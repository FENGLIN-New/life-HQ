import React from 'react';
import Link from 'next/link';

export default function PetSouvenirPage() {
  return (
    <>
      <div className="flex justify-between items-center mt-4 px-2">
        <Link href="/work/startup" className="text-xl opacity-70 hover:opacity-100">〈</Link>
        <h1 className="text-lg font-medium tracking-wide text-slate-300">Pet Souvenir</h1>
        <button className="text-xl opacity-70">•••</button>
      </div>

      <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-5" style={{ scrollbarWidth: 'none' }}>
        <div className="text-center py-6 bg-gradient-to-b from-amber-600/10 to-transparent rounded-3xl border border-amber-500/10">
          <span className="text-5xl block mb-3">🐾</span>
          <h2 className="text-2xl font-bold text-white">Pet Souvenir</h2>
          <p className="text-slate-400 text-xs mt-1">主打寵物的伴手禮產品</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-slate-500 text-xs block">目前進度</span>
              <span className="text-lg font-bold text-white mt-0.5 block">產品開發</span>
            </div>
            <span className="text-2xl font-bold text-amber-400">40%</span>
          </div>
          
          <div className="relative pt-2">
            <div className="h-1 w-full bg-slate-800 rounded-full absolute top-4 left-0"></div>
            <div className="h-1 w-[40%] bg-amber-500 rounded-full absolute top-4 left-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            
            <div className="flex justify-between relative z-10 text-[10px] text-slate-400">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
                <span className="text-amber-500 font-medium">構想</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
                <span className="text-amber-500 font-medium">研究</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/40 animate-pulse"></div>
                <span className="text-white font-semibold">開發</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <span>測試</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <span>上市</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-slate-500 text-xs block">上次停在這裡</span>
          <p className="text-slate-200 text-sm leading-relaxed font-light">
            決定使用米製零食作為第一款商品，正在進行配方測試。
          </p>
          <span className="text-slate-600 text-[10px] block pt-1">2026/07/12 14:30</span>
        </div>
      </div>
    </>
  );
}