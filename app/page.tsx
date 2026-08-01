"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DOMAINS } from "@/lib/domains";
import { WORDS } from "@/lib/words";
import { useTopics } from "@/lib/useTopics";
import { useNotes } from "@/lib/useNotes";
import { formatTime } from "@/lib/format";

const displayFont = { fontFamily: "'Baloo 2', sans-serif" };

// Same word all day (stable across refreshes), rotates to a new one the next day.
function todaysWordIndex() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  return dayOfYear % WORDS.length;
}

export default function Home() {
  const { topics } = useTopics();
  const { notes, addNote, removeNote } = useNotes();
  // Starts at a fixed index for SSR, then locks to today's word once mounted on the client
  // (avoids a server/client hydration mismatch from using the current date too early).
  const [wordIndex, setWordIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWordIndex(todaysWordIndex());
  }, []);

  function nextWord() {
    let i = Math.floor(Math.random() * WORDS.length);
    if (WORDS.length > 1 && i === wordIndex) i = (i + 1) % WORDS.length;
    setWordIndex(i);
  }

  function handleCapture(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addNote(text);
    setDraft("");
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-10 lg:max-w-4xl lg:px-10 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">Life HQ</p>
            <h1 className="mt-2 text-[38px] leading-tight text-slate-800" style={displayFont}>
              今天，從哪裡開始？
            </h1>
            <p className="mt-2 text-sm">
              <span className="bg-gradient-to-r from-sky-500 via-rose-500 to-violet-500 bg-clip-text text-transparent font-medium">工作 · 生活 · 創業</span>
              <span className="text-slate-400"> —— 都在這裡，一個一個來</span>
            </p>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-72 lg:shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">今日單字</span>
              <button onClick={nextWord} className="text-xs text-slate-500 transition hover:text-slate-700 hover:underline underline-offset-2">
                換一個 ↻
              </button>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl text-slate-800" style={displayFont}>
                {WORDS[wordIndex].en}
              </span>
              <span className="text-base text-slate-400">{WORDS[wordIndex].th}</span>
            </div>
          </div>
        </div>

        {/* Domain cards */}
        <div className="mb-6 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DOMAINS.map((d) => (
            <Link
              key={d.id}
              href={`/${d.id}`}
              style={{ backgroundImage: `linear-gradient(to top, ${d.overlay}), url(${d.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
              className={`relative overflow-hidden rounded-2xl border ${d.border} p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] lg:aspect-[4/5] lg:p-6`}
            >
              <div className="text-2xl font-semibold text-white drop-shadow-sm lg:text-3xl" style={displayFont}>
                {d.label}
              </div>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-white/80">
                {topics.filter((t) => t.domain === d.id).length} 筆紀錄
              </div>
            </Link>
          ))}
        </div>

        {/* Sticky notes: quick, freeform capture that isn't tied to a domain */}
        <div>
          <form onSubmit={handleCapture} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-slate-300">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="現在想到什麼？打字後按 Enter"
                className="w-full bg-transparent text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gradient-to-r from-rose-400 to-amber-300 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:scale-105 hover:brightness-110 active:scale-95"
              >
                記下來
              </button>
            </div>
          </form>

          {notes.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((n) => (
                <div key={n.id} className="group relative rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <button
                    onClick={() => removeNote(n.id)}
                    aria-label="刪除便利貼"
                    className="absolute right-2 top-2 text-slate-300 opacity-0 transition hover:text-slate-500 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <p className="pr-4 text-sm leading-relaxed text-slate-700">{n.text}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-600/70">{formatTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
