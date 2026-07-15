import React from 'react';
import Link from 'next/link';

export default function StartupPage() {
  return (
    <>
      <div className="flex justify-between items-center mt-4 px-2">
        <Link href="/work" className="text-xl opacity-70 hover:opacity-100">〈</Link>
        <h1 className="text-xl font-semibold tracking-wide text-slate-200">創業</h1>
        <div className="flex gap-4 text-xl opacity-70">
          <button>+</button>
          <button>•••</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4" style={{ scrollbarWidth: 'none' }}>
        {/* 點擊專案前往第 4 頁 */}
        <Link 
          href="/work/startup/pet-souvenir" 
          className="block bg-gradient-to-r from-amber-600/20 to-orange-900/40 border border-orange-500/30 rounded-3xl p-5 flex flex-col justify-between min-h-[140px] relative hover:scale-[1.01] transition-transform"
        >
          <span className="absolute top-5 right-5 text-amber-400">★</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐾</span>
            <div>
              <h3 className="text-lg font-bold text-white">Pet Souvenir</h3>
              <p className="text-orange-200/60 text-xs mt-0.5">主打寵物的伴手禮產品</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-orange-200/80">
            <span>進行中</span>
            <span className="font-semibold text-amber-400">40%</span>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-teal-600/20 to-emerald-900/40 border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-between min-h-[140px] relative">
          <span className="absolute top-5 right-5 text-amber-400">★</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗃️</span>
            <div>
              <h3 className="text-lg font-bold text-white">Life HQ</h3>
              <p className="text-emerald-200/60 text-xs mt-0.5">打造我的人生操作系統</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-emerald-200/80">
            <span>進行中</span>
            <span className="font-semibold text-emerald-400">25%</span>
          </div>
        </div>
      </div>
    </>
  );
}