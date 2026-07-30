"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Topic } from "./types";

const STORAGE_KEY = "life_hq_topics_v1";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount: local cache first (fast), then try to override with cloud copy.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTopics(JSON.parse(saved));
      } catch (e) {
        console.error("讀取本地資料失敗", e);
      }
    }
    setLoaded(true);

    async function loadFromSupabase() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from("life_hq_topics").select("content").eq("id", 1).single();
        if (data?.content) {
          const parsed = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
          if (Array.isArray(parsed)) setTopics(parsed);
        }
      } catch (e) {
        console.log("暫時無法連線至 Supabase，使用本地資料", e);
      }
    }
    loadFromSupabase();
  }, []);

  // Persist on every change, after the initial load has settled.
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
    if (supabase) {
      supabase
        .from("life_hq_topics")
        .upsert({ id: 1, content: JSON.stringify(topics) })
        .then(({ error }) => {
          if (error) console.error("同步雲端失敗", error.message);
        });
    }
  }, [topics, loaded]);

  function addTopic(input: { domain: Topic["domain"]; title: string; note?: string; chatLink?: string; reminderAt?: string }) {
    const topic: Topic = {
      id: `t-${Date.now()}`,
      domain: input.domain,
      title: input.title,
      note: input.note ?? "",
      chatLink: input.chatLink ?? "",
      reminderAt: input.reminderAt ?? "",
      pinned: false,
      updatedAt: new Date().toISOString(),
    };
    setTopics((prev) => [topic, ...prev]);
    return topic;
  }

  function updateTopic(id: string, patch: Partial<Topic>) {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)));
  }

  function togglePin(id: string) {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }

  function removeTopic(id: string) {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }

  return { topics, loaded, addTopic, updateTopic, togglePin, removeTopic };
}
