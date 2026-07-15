'use client';

import React, { useState, useEffect } from 'react';

interface ProjectItem {
  id: string;
  name: string;
  desc: string;
  belongsTo: 'work' | 'personal' | 'mind';
  color: string;
  notes: string;
  link: string;
}

interface MemoItem {
  id: string;
  text: string;
  color: string;
}

interface SystemState {
  workTitle: string;
  workDesc: string;
  personalTitle: string;
  personalDesc: string;
  mindTitle: string;
  mindDesc: string;
  projects: ProjectItem[];
  memos: MemoItem[];
}

// 精心挑選的高顏值馬卡龍色彩對照表，為每個顏色指定一個完美的漸層搭配色與霓虹陰影色
const COLOR_MAPS: Record<string, { from: string; to: string; shadow: string }> = {
  '#FFB4B4': { from: '#FFB4B4', to: '#FFD3D3', shadow: 'rgba(255, 180, 180, 0.4)' },
  '#FFDEB4': { from: '#FFDEB4', to: '#FFEED6', shadow: 'rgba(255, 222, 180, 0.4)' },
  '#FDFDBD': { from: '#FDFDBD', to: '#FFFFE0', shadow: 'rgba(253, 253, 189, 0.4)' },
  '#B5EAEA': { from: '#B5EAEA', to: '#D7F7F7', shadow: 'rgba(181, 234, 234, 0.4)' },
  '#EDF6E8': { from: '#EDF6E8', to: '#F7FCF5', shadow: 'rgba(237, 246, 232, 0.3)' },
  '#FFCCB6': { from: '#FFCCB6', to: '#FFE5D9', shadow: 'rgba(255, 204, 182, 0.4)' },
  '#D4A5B8': { from: '#D4A5B8', to: '#E8C5D4', shadow: 'rgba(212, 165, 184, 0.4)' },
  '#B39CD0': { from: '#B39CD0', to: '#D2C4E6', shadow: 'rgba(179, 156, 208, 0.4)' },
  // 相容舊的色彩
  '#FEC8D8': { from: '#FEC8D8', to: '#FFF0F5', shadow: 'rgba(254, 200, 216, 0.4)' },
  '#D4F0F0': { from: '#D4F0F0', to: '#E6FAFA', shadow: 'rgba(212, 240, 240, 0.4)' },
  '#CCE2CB': { from: '#CCE2CB', to: '#E2F0E1', shadow: 'rgba(204, 226, 203, 0.4)' },
  '#FFDFD3': { from: '#FFDFD3', to: '#FFF0EA', shadow: 'rgba(255, 223, 211, 0.4)' },
  '#E8AEB7': { from: '#E8AEB7', to: '#F4CStatus', shadow: 'rgba(232, 174, 183, 0.4)' },
  '#B7CFB7': { from: '#B7CFB7', to: '#D3E2D3', shadow: 'rgba(183, 207, 183, 0.4)' },
  '#D7C49E': { from: '#D7C49E', to: '#E8DCBF', shadow: 'rgba(215, 196, 158, 0.4)' },
  '#B18597': { from: '#B18597', to: '#CFA4B7', shadow: 'rgba(177, 133, 151, 0.4)' },
};

const MACARON_PALETTE = Object.keys(COLOR_MAPS);

const BACKUP_WORDS = {
  english: [
    { word: 'Stagnation', detail: '(n.) 停滯、不景氣 - 常用於經濟新聞描述市場增長緩慢' },
    { word: 'Leverage', detail: '(v./n.) 槓桿、利用 - 商業新聞中指利用既有優勢取得更大成效' },
    { word: 'Volatility', detail: '(n.) 波動性 - 常用於股市、外匯與加密貨幣的價格劇烈變動' }
  ],
  thai: [
    { word: 'การเจรจาต่อรอง', detail: '(kan-chen-ra-cha-tor-rong) 商業談判 - 用於商務合約與條件協議' },
    { word: 'พันธมิตรทางธุรกิจ', detail: '(phan-tha-mit-thang-thu-ra-kit-sa) 商業戰略夥伴 - 企業結盟常用語' },
    { word: 'ต้นทุนทุนทรัพย์', detail: '(ton-thun-thun-sa-rap) 資本成本 - 財務與商業投資分析術語' }
  ]
};

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'work' | 'personal' | 'mind'>('welcome');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newMemoText, setNewMemoText] = useState('');
  const [apiEnglishWord, setApiEnglishWord] = useState({ word: 'Loading...', detail: '正在載入今日高頻新聞英文...' });
  const [apiThaiWord, setApiThaiWord] = useState({ word: 'Loading...', detail: '正在載入今日商業泰語...' });

  const [systemState, setSystemState] = useState<SystemState>({
    workTitle: '工作領域',
    workDesc: '日常教學、行政事務與商業專案',
    personalTitle: '私人生活',
    personalDesc: '健康管理、日常興趣與生活調劑',
    mindTitle: '異想知識庫',
    mindDesc: '靈感閃現、奇思妙想與知識筆記',
    projects: [
      { id: 'w-1', name: '工作項目一', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#B5EAEA', notes: '', link: '' },
      { id: 'w-2', name: '工作項目二', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#EDF6E8', notes: '', link: '' },
      { id: 'w-3', name: '工作項目三', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#B39CD0', notes: '', link: '' },
      { id: 'p-1', name: '生活項目一', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFB4B4', notes: '', link: '' },
      { id: 'p-2', name: '生活項目二', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFCCB6', notes: '', link: '' },
      { id: 'p-3', name: '生活項目三', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFDEB4', notes: '', link: '' },
      { id: 'm-1', name: '知識靈感一', desc: '在這裡記錄隨手拈來的奇思妙想...', belongsTo: 'mind', color: '#FFDEB4', notes: '', link: '' },
      { id: 'm-2', name: '知識靈感二', desc: '在這裡記錄隨手拈來的奇思妙想...', belongsTo: 'mind', color: '#D4A5B8', notes: '', link: '' },
      { id: 'm-3', name: '知識靈感三', desc: '在這裡記錄隨手拈來的奇思妙想...', belongsTo: 'mind', color: '#FDFDBD', notes: '', link: '' }
    ],
    memos: [
      { id: 'memo-1', text: '歡迎來到你的專屬減壓小宇宙', color: '#FFDEB4' },
      { id: 'memo-2', text: '你不需要每天都很完美，只要前進就好。', color: '#B5EAEA' }
    ]
  });

  const saveToLocalStorage = (newState: SystemState) => {
    localStorage.setItem('life_hq_user_universe_data', JSON.stringify(newState));
  };

  const fetchDailyWords = () => {
    const randomIdx = Math.floor(Math.random() * BACKUP_WORDS.english.length);
    setTimeout(() => {
      setApiEnglishWord(BACKUP_WORDS.english[randomIdx]);
      setApiThaiWord(BACKUP_WORDS.thai[randomIdx]);
    }, 400);
  };

  useEffect(() => {
    document.title = "Life HQ-我的小宇宙";

    const savedNew = localStorage.getItem('life_hq_user_universe_data');
    if (savedNew) {
      try {
        const parsed = JSON.parse(savedNew);
        if (parsed && Array.isArray(parsed.projects)) {
          setSystemState(parsed);
        }
      } catch(e) {
        console.error(e);
      }
    }
    setIsInitialized(true);
    fetchDailyWords();
  }, []);

  const handleAddProject = (zone: 'work' | 'personal' | 'mind') => {
    const newId = `project-${Date.now()}`;
    const finalColor = MACARON_PALETTE[Math.floor(Math.random() * MACARON_PALETTE.length)];

    const newProj: ProjectItem = {
      id: newId,
      name: '未命名新項目',
      desc: '點擊修改內容',
      belongsTo: zone,
      color: finalColor,
      notes: '',
      link: ''
    };

    setSystemState(prev => {
      const updated = { ...prev, projects: [...prev.projects, newProj] };
      saveToLocalStorage(updated);
      return updated;
    });

    setActiveProjectId(newId);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('確定要刪除這個方塊嗎？')) {
      setSystemState(prev => {
        const updated = { ...prev, projects: prev.projects.filter(p => p.id !== id) };
        saveToLocalStorage(updated);
        return updated;
      });
      if (activeProjectId === id) setActiveProjectId(null);
    }
  };

  const handleProjectUpdate = (id: string, fields: Partial<ProjectItem>) => {
    setSystemState(prev => {
      const updated = {
        ...prev,
        projects: prev.projects.map(p => p.id === id ? { ...p, ...fields } : p)
      };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoText.trim()) return;

    const randomColor = MACARON_PALETTE[Math.floor(Math.random() * MACARON_PALETTE.length)];
    const newMemo: MemoItem = {
      id: `memo-${Date.now()}`,
      text: newMemoText.trim(),
      color: randomColor
    };

    setSystemState(prev => {
      const updated = { ...prev, memos: [newMemo, ...(prev.memos || [])] };
      saveToLocalStorage(updated);
      return updated;
    });
    setNewMemoText('');
  };

  const handleDeleteMemo = (id: string) => {
    setSystemState(prev => {
      const updated = { ...prev, memos: (prev.memos || []).filter(m => m.id !== id) };
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedId || draggedId === targetCardId) return;

    setSystemState(prev => {
      const dragIndex = prev.projects.findIndex(p => p.id === draggedId);
      const targetIndex = prev.projects.findIndex(p => p.id === targetCardId);
      
      if (dragIndex === -1 || targetIndex === -1) return prev;
      if (prev.projects[dragIndex].belongsTo !== prev.projects[targetIndex].belongsTo) return prev;

      const newProjects = [...prev.projects];
      const [draggedItem] = newProjects.splice(dragIndex, 1);
      newProjects.splice(targetIndex, 0, draggedItem);

      const updated = { ...prev, projects: newProjects };
      saveToLocalStorage(updated);
      return updated;
    });

    setDraggedId(null);
  };

  if (!isInitialized) {
    return <div className="h-screen w-screen bg-[#FFF0F2] flex items-center justify-center text-slate-400 font-mono text-xs tracking-widest">MY_UNIVERSE INITIALIZING...</div>;
  }

  const displayedProjects = systemState.projects.filter(p => p.belongsTo === currentView);
  const workCount = systemState.projects.filter(p => p.belongsTo === 'work').length;
  const personalCount = systemState.projects.filter(p => p.belongsTo === 'personal').length;
  const mindCount = systemState.projects.filter(p => p.belongsTo === 'mind').length;
  const currentProject = systemState.projects.find(p => p.id === activeProjectId);

  const getPageBgClass = () => {
    if (currentView === 'work') return 'bg-[#EDF4F6] text-slate-700';
    if (currentView === 'personal') return 'bg-[#FAF0F2] text-slate-700';
    if (currentView === 'mind') return 'bg-[#F4EDFA] text-slate-700';
    return 'bg-[#FAF0F2] text-slate-700';
  };

  return (
    <div className={`min-h-screen w-screen p-8 font-sans antialiased selection:bg-pink-100 relative overflow-x-hidden transition-colors duration-500 ${getPageBgClass()}`}>
      
      {currentView === 'welcome' && (
        <>
          <div className="absolute top-[-50px] left-[-50px] w-[500px] h-[500px] bg-gradient-to-tr from-pink-300/20 via-yellow-200/20 to-purple-300/10 rounded-full blur-[100px] pointer-events-none z-0" />
          <div className="absolute bottom-[100px] right-[-100px] w-[600px] h-[600px] bg-gradient-to-br from-teal-200/15 via-pink-200/30 to-purple-200/25 rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      )}

      <div className={`mx-auto transition-all duration-300 relative z-10 ${currentView === 'welcome' ? 'max-w-6xl' : 'max-w-[95%]'}`}>
        
        {/* 頁首軌跡 */}
        <div className="text-[11px] text-pink-400 font-mono mb-8 tracking-widest flex items-center gap-2 select-none">
          <span className="cursor-pointer hover:text-pink-600 transition-colors" onClick={() => setCurrentView('welcome')}>MY_SPACE</span>
          {currentView !== 'welcome' && (
            <>
              <span>/</span>
              <span className="text-pink-500 font-medium uppercase">{currentView}_SPACE</span>
            </>
          )}
        </div>

        {/* 【大首頁視圖】 */}
        {currentView === 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-6">
            
            {/* 左側：三大入口 */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-4xl font-light tracking-tight text-slate-800">屬於我的小宇宙</h1>
              </div>
              
              <div className="pt-6">
                <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-4 uppercase">切換空間</h2>
                <div className="space-y-5">
                  
                  {/* 工作領域卡片 */}
                  <div onClick={() => setCurrentView('work')} className="group cursor-pointer bg-gradient-to-br from-[#E8F4F8]/85 to-[#Cbe3eb]/70 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-300/30 transition-all duration-300 shadow-sm active:scale-[0.99] hover:-translate-y-0.5 border border-white/40">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">{systemState.workTitle}</h3>
                        <p className="text-slate-500 text-xs mt-1 font-light">{systemState.workDesc}</p>
                      </div>
                      <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-blue-600 font-medium shadow-sm">{workCount} 項目</div>
                    </div>
                  </div>
                  
                  {/* 私人生活卡片 */}
                  <div onClick={() => setCurrentView('personal')} className="group cursor-pointer bg-gradient-to-br from-[#FFF0F2]/90 to-[#Fcdde2]/75 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-pink-300/30 transition-all duration-300 shadow-sm active:scale-[0.99] hover:-translate-y-0.5 border border-white/40">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 tracking-tight group-hover:text-pink-700 transition-colors">{systemState.personalTitle}</h3>
                        <p className="text-slate-500 text-xs mt-1 font-light">{systemState.personalDesc}</p>
                      </div>
                      <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-pink-600 font-medium shadow-sm">{personalCount} 項目</div>
                    </div>
                  </div>

                  {/* 異想知識庫卡片 */}
                  <div onClick={() => setCurrentView('mind')} className="group cursor-pointer bg-gradient-to-br from-[#F3EAF8]/85 to-[#E1cbed]/70 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-300/30 transition-all duration-300 shadow-sm active:scale-[0.99] hover:-translate-y-0.5 border border-white/40">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800 tracking-tight group-hover:text-purple-700 transition-colors">{systemState.mindTitle}</h3>
                        <p className="text-slate-500 text-xs mt-1 font-light">{systemState.mindDesc}</p>
                      </div>
                      <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-purple-600 font-medium shadow-sm">{mindCount} 項目</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 右側：時光便簽壁 + 學習單字 */}
            <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-3 uppercase">今日自我增強計畫</h2>
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-white/60 border border-white text-xs shadow-sm">
                      <div className="font-bold text-slate-700 text-sm tracking-tight">{apiEnglishWord.word}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{apiEnglishWord.detail}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white/60 border border-white text-xs shadow-sm">
                      <div className="font-bold text-slate-700 text-sm tracking-tight">{apiThaiWord.word}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{apiThaiWord.detail}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-semibold text-slate-400 tracking-wider mb-2 uppercase">時光便簽壁</h2>
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {systemState.memos.map(memo => (
                      <div key={memo.id} className="p-3.5 rounded-xl bg-white/90 text-xs text-slate-700 border border-slate-100 relative group flex justify-between items-start leading-relaxed shadow-sm">
                        <span className="flex-1 pr-4 font-light">{memo.text}</span>
                        <button onClick={() => handleDeleteMemo(memo.id)} className="text-[10px] text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0">刪除</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddMemo} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <input 
                  type="text"
                  value={newMemoText}
                  onChange={e => setNewMemoText(e.target.value)}
                  placeholder="輸入便簽內容..."
                  className="bg-slate-50 border border-slate-100 text-xs rounded-xl px-3.5 py-2.5 flex-1 focus:outline-none focus:bg-white focus:ring-1 focus:ring-pink-200 transition-all placeholder:text-slate-300"
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-4 rounded-xl shadow-sm transition-colors">新增</button>
              </form>
            </div>
          </div>
        )}

        {/* 【獨立專頁視圖】 */}
        {currentView !== 'welcome' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-black/5 pb-5">
              <button onClick={() => setCurrentView('welcome')} className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 hover:bg-white text-slate-600 text-xs transition-colors shadow-sm font-medium">返回首頁</button>
              <div className="text-[10px] text-slate-400 font-mono select-none">
                💡 提示：按住方塊即可拖曳更換排序
              </div>
            </div>

            <div className="flex justify-between items-end bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-sm">
              <div className="space-y-1">
                {currentView === 'work' && <h2 className="text-xl font-medium text-slate-800 tracking-tight">{systemState.workTitle}</h2>}
                {currentView === 'personal' && <h2 className="text-xl font-medium text-slate-800 tracking-tight">{systemState.personalTitle}</h2>}
                {currentView === 'mind' && <h2 className="text-xl font-medium text-slate-800 tracking-tight">{systemState.mindTitle}</h2>}
                <p className="text-slate-400 text-xs font-light">{currentView === 'work' ? systemState.workDesc : currentView === 'personal' ? systemState.personalDesc : systemState.mindDesc}</p>
              </div>
              <button onClick={() => handleAddProject(currentView)} className="bg-white hover:bg-slate-50 text-slate-700 text-xs px-5 py-2.5 rounded-xl border border-slate-200 transition-colors font-medium shadow-sm shrink-0">新增項目</button>
            </div>

            {/* 💡 滿版通透漸層色塊網格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2">
              {displayedProjects.map(project => {
                // 讀取相對應的漸層配色設定，若無則提供安全預設
                const colorSetup = COLOR_MAPS[project.color] || { from: project.color, to: project.color, shadow: 'rgba(0,0,0,0.05)' };
                
                return (
                  <div 
                    key={project.id}
                    draggable={true}
                    onDragStart={() => handleDragStart(project.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnCard(e, project.id)}
                    onClick={() => setActiveProjectId(project.id)}
                    className="cursor-grab active:cursor-grabbing rounded-2xl p-5 flex flex-col justify-between min-h-[160px] transition-all hover:-translate-y-1 duration-300 group relative select-none overflow-hidden border border-white/30 backdrop-blur-md"
                    style={{ 
                      // 1. 整個色塊重回滿版上色：採用高質感的溫潤馬卡龍微幅雙色漸層
                      background: `linear-gradient(135deg, ${colorSetup.from}ee, ${colorSetup.to}cc)`,
                      // 2. 拔除髒黑邊框，改用與卡片同色系的霓虹柔和彩色陰影
                      boxShadow: `0 10px 25px -5px ${colorSetup.shadow}, 0 4px 12px -4px ${colorSetup.shadow}`
                    }}
                  >
                    <button onClick={(e) => handleDeleteProject(project.id, e)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium z-10">刪除</button>
                    
                    <div className="space-y-2.5 w-full h-full pointer-events-none pt-1"> 
                      <span className="text-md font-bold tracking-tight block text-slate-800 leading-snug">{project.name}</span>
                      <span className="text-[12px] text-slate-600/90 block line-clamp-4 leading-relaxed font-light whitespace-pre-line">{project.desc || '點擊填寫內容...'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 彈窗主控台 */}
        {activeProjectId && currentProject && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 relative shadow-2xl overflow-hidden border border-slate-100">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: currentProject.color }} />
              <div className="flex justify-between items-start mb-6 mt-2">
                <div className="flex-1 mr-4 space-y-2">
                  <input type="text" value={currentProject.name} onChange={e => handleProjectUpdate(currentProject.id, { name: e.target.value })} className="bg-slate-50 text-slate-800 font-medium text-lg rounded-xl px-3 py-1.5 w-full focus:outline-none border border-slate-100 focus:bg-white focus:ring-1 focus:ring-pink-200 transition-all" />
                  <input type="text" value={currentProject.desc} onChange={e => handleProjectUpdate(currentProject.id, { desc: e.target.value })} className="bg-slate-50 text-slate-500 text-xs rounded-xl px-3 py-2 w-full focus:outline-none border border-slate-100 focus:bg-white focus:ring-1 focus:ring-pink-200 transition-all" />
                </div>
                <button onClick={() => setActiveProjectId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors shrink-0 font-medium">關閉</button>
              </div>

              <div className="space-y-5 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-mono tracking-wider block font-bold">摘要與記錄區</label>
                  <textarea value={currentProject.notes || ''} onChange={e => handleProjectUpdate(currentProject.id, { notes: e.target.value })} className="w-full h-40 bg-slate-50 text-slate-700 text-xs rounded-xl p-3.5 focus:outline-none border border-slate-100 focus:bg-white focus:ring-1 focus:ring-pink-200 transition-all leading-relaxed placeholder:text-slate-300 resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-mono tracking-wider block font-bold">相關對話或資料連結</label>
                  <div className="flex gap-2">
                    <input type="text" value={currentProject.link || ''} onChange={e => handleProjectUpdate(currentProject.id, { link: e.target.value })} className="bg-slate-50 text-slate-700 text-xs rounded-xl px-3.5 py-2 flex-1 focus:outline-none border border-slate-100 focus:bg-white focus:ring-1 focus:ring-pink-200 transition-all" />
                    {currentProject.link && <a href={currentProject.link} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shrink-0 transition-colors">開啟</a>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <select value={currentProject.belongsTo} onChange={e => {
                    const targetZone = e.target.value as 'work' | 'personal' | 'mind';
                    handleProjectUpdate(currentProject.id, { belongsTo: targetZone });
                    setActiveProjectId(null);
                    setCurrentView(targetZone);
                  }} className="bg-slate-50 text-slate-400 hover:text-slate-600 text-xs px-3 py-2 rounded-xl border border-slate-100 focus:outline-none font-medium">
                    <option value="work">移至 工作區</option>
                    <option value="personal">移至 生活區</option>
                    <option value="mind">移至 知識庫</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}