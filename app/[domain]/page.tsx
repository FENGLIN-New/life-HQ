"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { domainMeta, isDomainId } from "@/lib/domains";
import { useTopics } from "@/lib/useTopics";
import TopicCard from "@/components/TopicCard";

const displayFont = { fontFamily: "'Baloo 2', sans-serif" };

export default function DomainPage() {
  const { domain } = useParams<{ domain: string }>();
  const { topics, addTopic, updateTopic, togglePin } = useTopics();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formReminder, setFormReminder] = useState("");

  if (!isDomainId(domain)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 text-center">
        <p className="text-slate-500">找不到這個領域。</p>
        <Link href="/" className="mt-2 inline-block text-sm text-slate-700 underline">
          回首頁
        </Link>
      </div>
    );
  }

  const meta = domainMeta(domain);
  const domainTopics = topics.filter((t) => t.domain === meta.id);
  const pinned = domainTopics.filter((t) => t.pinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const rest = domainTopics.filter((t) => !t.pinned).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    addTopic({ domain: meta.id, title: formTitle.trim(), note: formNote.trim(), chatLink: formLink.trim(), reminderAt: formReminder });
    setFormTitle("");
    setFormLink("");
    setFormNote("");
    setFormReminder("");
    setShowAddForm(false);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-10 lg:max-w-4xl lg:px-10 lg:py-14">
        {/* Banner */}
        <div
          style={{ backgroundImage: `linear-gradient(to top, ${meta.overlay}), url(${meta.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          className={`relative mb-6 flex min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border ${meta.border} p-5 shadow-sm lg:min-h-[180px] lg:p-6`}
        >
          <Link href="/" className="w-fit text-sm text-white/85 transition hover:text-white">
            ‹ 首頁
          </Link>
          <h1 className="text-3xl font-semibold text-white drop-shadow-sm lg:text-4xl" style={displayFont}>
            {meta.label}
          </h1>
        </div>

        <button
          onClick={() => setShowAddForm((s) => !s)}
          className={`mb-4 w-full rounded-xl border border-dashed ${meta.border} py-2.5 text-sm ${meta.accent} transition-all duration-150 hover:bg-slate-50 hover:scale-[1.005] active:scale-[0.995]`}
        >
          {showAddForm ? "取消" : "+ 新增一個項目"}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddTopic} className={`mb-5 space-y-2 rounded-2xl border ${meta.border} bg-white p-4 shadow-sm`}>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="這是什麼？"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <input
              value={formLink}
              onChange={(e) => setFormLink(e.target.value)}
              placeholder="上次聊天連結（選填）"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <textarea
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder="上次進度到哪裡（選填）"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <div>
              <label className="mb-1 block text-[11px] text-slate-400">提醒時間（選填）</label>
              <input
                type="datetime-local"
                value={formReminder}
                onChange={(e) => setFormReminder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-amber-300 py-2 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.99]"
            >
              儲存
            </button>
          </form>
        )}

        {pinned.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">已釘選</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {pinned.map((t) => (
                <TopicCard key={t.id} topic={t} meta={meta} onTogglePin={togglePin} onUpdate={updateTopic} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rest.length === 0 && pinned.length === 0 ? (
            <div className={`col-span-full rounded-2xl border border-dashed ${meta.border} py-14 text-center text-sm text-slate-400`}>
              這個領域還沒有紀錄，點上面加一個吧。
            </div>
          ) : (
            rest.map((t) => <TopicCard key={t.id} topic={t} meta={meta} onTogglePin={togglePin} onUpdate={updateTopic} />)
          )}
        </div>
      </div>
    </div>
  );
}
