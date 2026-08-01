"use client";

import { useState } from "react";
import type { DomainMeta } from "@/lib/domains";
import type { Topic } from "@/lib/types";
import { formatTime, buildGoogleCalendarUrl } from "@/lib/format";

function PinIcon({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M12 2v6.5l4 3v2h-4.5v7l-.5 2-.5-2v-7H6v-2l4-3V2Z" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3m-8 0 .8 12.2A2 2 0 0 0 9.8 21h4.4a2 2 0 0 0 2-1.8L17 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GripIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

export default function TopicCard({
  topic,
  meta,
  onTogglePin,
  onUpdate,
  onRemove,
  isDragging = false,
  isDragOver = false,
  dragHandleProps,
}: {
  topic: Topic;
  meta: DomainMeta;
  onTogglePin: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Topic>) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  dragHandleProps?: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-topic-id={topic.id}
      className={`rounded-2xl border ${meta.border} bg-white p-4 shadow-sm transition-all duration-150 hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      } ${isDragOver ? `ring-2 ring-offset-2 ${meta.border.replace("border-", "ring-")}` : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <button
            {...dragHandleProps}
            aria-label="拖曳排序"
            style={{ touchAction: "none" }}
            className="mt-1 shrink-0 cursor-grab text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
          >
            <GripIcon className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <input
              key={topic.id}
              defaultValue={topic.title}
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value && value !== topic.title) onUpdate(topic.id, { title: value });
                else e.target.value = topic.title;
              }}
              className="w-full min-w-0 rounded bg-transparent text-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-200"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            />
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              建立於 {formatTime(topic.createdAt)}
              {topic.history.length > 0 && <> · 更新於 {formatTime(topic.updatedAt)}</>}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => onTogglePin(topic.id)}
            className={`transition-transform duration-150 hover:scale-125 active:scale-90 ${topic.pinned ? meta.accent : "text-slate-300 hover:text-slate-400"}`}
            aria-label="釘選"
          >
            <PinIcon filled={topic.pinned} className="h-4 w-4" />
          </button>
          <button onClick={() => setExpanded((s) => !s)} className={`text-xs ${meta.accent} transition hover:opacity-70 hover:underline underline-offset-2`}>
            {expanded ? "收合" : "編輯"}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`確定要刪除「${topic.title}」嗎？`)) onRemove(topic.id);
            }}
            className="text-slate-300 transition hover:text-rose-500"
            aria-label="刪除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {topic.note && <p className="mt-2 text-sm leading-relaxed text-slate-500">{topic.note}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {topic.chatLink && (
          <a
            href={topic.chatLink}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${meta.chip}`}
          >
            回到上次對話 ↗
          </a>
        )}
        {topic.reminderAt && (
          <a
            href={buildGoogleCalendarUrl(topic.title, topic.reminderAt, topic.note)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition-all duration-150 hover:scale-105 hover:bg-amber-200 active:scale-95"
          >
            {formatTime(topic.reminderAt)} · 加到 Google 日曆
          </a>
        )}
      </div>

      {expanded && (
        <div className={`mt-3 space-y-2 border-t ${meta.border} pt-3`}>
          <input
            defaultValue={topic.chatLink}
            onBlur={(e) => onUpdate(topic.id, { chatLink: e.target.value })}
            placeholder="上次聊天連結"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <textarea
            defaultValue={topic.note}
            onBlur={(e) => onUpdate(topic.id, { note: e.target.value })}
            placeholder="目前進度到哪裡"
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <div>
            <label className="mb-1 block text-[11px] text-slate-400">提醒時間</label>
            <input
              type="datetime-local"
              defaultValue={topic.reminderAt}
              onBlur={(e) => onUpdate(topic.id, { reminderAt: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
            />
          </div>

          {topic.history.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] text-slate-400">更新紀錄</p>
              <ul className="space-y-0.5 font-mono text-[11px] text-slate-500">
                {[...topic.history].reverse().map((h, i) => (
                  <li key={i}>{formatTime(h)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
