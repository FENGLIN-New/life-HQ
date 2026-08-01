"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { StickyNote } from "./types";

const STORAGE_KEY = "life_hq_notes_v1";
const SUPABASE_ROW_ID = 2;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load once on mount: local cache first (fast), then try to override with cloud copy.
  useEffect(() => {
    let localNotes: StickyNote[] = [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        localNotes = JSON.parse(saved);
        setNotes(localNotes);
      } catch (e) {
        console.error("讀取本地便利貼失敗", e);
      }
    }
    setLoaded(true);

    async function loadFromSupabase() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from("life_hq_topics").select("content").eq("id", SUPABASE_ROW_ID).single();
        if (data?.content) {
          const parsed = typeof data.content === "string" ? JSON.parse(data.content) : data.content;
          if (Array.isArray(parsed)) {
            // Cloud is empty but this browser already has local notes (e.g. cloud sync was
            // just turned on for the first time) — keep local and let it seed the cloud,
            // instead of wiping it out with nothing.
            if (parsed.length === 0 && localNotes.length > 0) return;
            setNotes(parsed);
          }
        }
      } catch (e) {
        console.log("暫時無法連線至 Supabase，使用本地便利貼", e);
      }
    }
    loadFromSupabase();
  }, []);

  // Persist on every change, after the initial load has settled.
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    if (supabase) {
      supabase
        .from("life_hq_topics")
        .upsert({ id: SUPABASE_ROW_ID, content: JSON.stringify(notes) })
        .then(({ error }) => {
          if (error) console.error("同步便利貼至雲端失敗", error.message);
        });
    }
  }, [notes, loaded]);

  function addNote(text: string) {
    const note: StickyNote = {
      id: `n-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, loaded, addNote, removeNote };
}
