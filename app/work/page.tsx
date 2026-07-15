import React from 'react';
import Link from 'next/link';

export default function WorkPage() {
  return (
    <>
      <div className="flex justify-between items-center mt-4 px-2">
        <Link href="/" className="text-xl opacity-70 hover:opacity-100">〈</Link>
        <h1 className="text-xl font-semibold tracking-wide text-slate-200">工作</h1>
        <button className="text-2xl opacity-70">+</button>
      </div>

      <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-blue-600/30 to-indigo-950/70 backdrop-blur-md rounded-3xl p-5 border border-blue-400/30 shadow-lg flex flex-col justify-between aspect-[3/4]">
              <div className="text-2xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl">📖</div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">教學</h3>
                <p className="text-blue-200/60 text-xs mt-1">每天都在做</p>
              </div>
            </div>
            <div className="bg-gradient-to-b from-cyan-600/20 to-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-cyan-400/20 shadow-lg flex flex-col justify-between aspect-square">
              <div className="text-2xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl">📋</div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">行政</h3>
                <p className="text-cyan-200/60 text-xs mt-0.5">進行中</p>
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-6">
            <div className="bg-gradient-to-b from-purple-600/30 to-purple-950/70 backdrop-blur-md rounded-3xl p-5 border border-purple-400/30 shadow-lg flex flex-col justify-between aspect-square relative">
              <span className="absolute top-4 right-4 text-amber-400 text-xs">★</span>
              <div className="text-2xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl">📝</div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">論文</h3>
                <p className="text-purple-200/60 text-xs mt-0.5">進行中</p>
              </div>
            </div>
            {/* 點擊創業前往第 3 頁 */}
            <Link 
              href="/work/startup" 
              className="block bg-gradient-to-b from-orange-600/30 to-amber-950/70 backdrop-blur-md rounded-3xl p-5 border border-orange-400/30 shadow-lg flex flex-col justify-between aspect-[3/4] relative hover:scale-[1.02] transition-transform"
            >
              <span className="absolute top-4 right-4 text-amber-400 text-xs">★</span>
              <div className="text-2xl bg-white/10 w-10 h-10 flex items-center justify-center rounded-xl">💡</div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">創業</h3>
                <p className="text-orange-200/60 text-xs mt-1">持續經營</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}