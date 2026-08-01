"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Topic } from "./types";

const STORAGE_KEY = "life_hq_topics_v1";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Backfill fields for topics saved before drag-to-reorder / history tracking existed.
function withOrder(list: Topic[]): Topic[] {
  return list.map((t) => ({
    ...t,
    order: typeof t.order === "number" ? t.order : new Date(t.updatedAt).getTime(),
    createdAt: t.createdAt ?? t.updatedAt,
    history: Array.isArray(t.history) ? t.history : [],
  }));
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount: local cache first (fast), then try to override with cloud copy.
  useEffect(() => {
    let localTopics: Topic[] = [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        localTopics = withOrder(JSON.parse(saved));
        setTopics(localTopics);
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
          if (Array.isArray(parsed)) {
            // Cloud is empty but this browser already has local data (e.g. cloud sync was
            // just turned on for the first time) — keep local and let it seed the cloud,
            // instead of wiping it out with nothing.
            if (parsed.length === 0 && localTopics.length > 0) return;
            setTopics(withOrder(parsed));
          }
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
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const topic: Topic = {
      id: `t-${now}`,
      domain: input.domain,
      title: input.title,
      note: input.note ?? "",
      chatLink: input.chatLink ?? "",
      reminderAt: input.reminderAt ?? "",
      pinned: false,
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [],
      order: now,
    };
    setTopics((prev) => [topic, ...prev]);
    return topic;
  }

  // Content edits (title/note/link/reminder) log a new history entry; pin toggles and
  // reordering go through their own setters below and don't touch history.
  function updateTopic(id: string, patch: Partial<Topic>) {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const now = new Date().toISOString();
        return { ...t, ...patch, updatedAt: now, history: [...t.history, now] };
      })
    );
  }

  function togglePin(id: string) {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  }

  function removeTopic(id: string) {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }

  // Reassigns `order` for a set of topics based on their new top-to-bottom sequence.
  // Doesn't touch updatedAt — reordering isn't a content edit.
  function reorderTopics(orderedIds: string[]) {
    const base = Date.now();
    setTopics((prev) => {
      const nextOrder = new Map(orderedIds.map((id, i) => [id, base - i]));
      return prev.map((t) => (nextOrder.has(t.id) ? { ...t, order: nextOrder.get(t.id)! } : t));
    });
  }

  return { topics, loaded, addTopic, updateTopic, togglePin, removeTopic, reorderTopics };
}
