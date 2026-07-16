'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ProjectItem {
  id: string;
  name: string;
  desc: string;
  belongsTo: 'work' | 'personal' | 'mind';
  color: string;
  notes: string;
  link: string;
  todos?: TodoItem[]; // 💡 新增：支援每個項目獨立的待辦清單
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

const COLOR_MAPS: Record<string, { from: string; to: string; shadow: string }> = {
  '#FFB4B4': { from: '#FFB4B4', to: '#FFD3D3', shadow: 'rgba(255, 180, 180, 0.4)' },
  '#FFDEB4': { from: '#FFDEB4', to: '#FFEED6', shadow: 'rgba(255, 222, 180, 0.4)' },
  '#FDFDBD': { from: '#FDFDBD', to: '#FFFFE0', shadow: 'rgba(253, 253, 189, 0.4)' },
  '#B5EAEA': { from: '#B5EAEA', to: '#D7F7F7', shadow: 'rgba(181, 234, 234, 0.4)' },
  '#EDF6E8': { from: '#EDF6E8', to: '#F7FCF5', shadow: 'rgba(237, 246, 232, 0.3)' },
  '#FFCCB6': { from: '#FFCCB6', to: '#FFE5D9', shadow: 'rgba(255, 204, 182, 0.4)' },
  '#D4A5B8': { from: '#D4A5B8', to: '#E8C5D4', shadow: 'rgba(212, 165, 184, 0.4)' },
  '#B39CD0': { from: '#B39CD0', to: '#D2C4E6', shadow: 'rgba(179, 156, 208, 0.4)' },
  '#FEC8D8': { from: '#FEC8D8', to: '#FFF0F5', shadow: 'rgba(254, 200, 216, 0.4)' },
  '#D4F0F0': { from: '#D4F0F0', to: '#E6FAFA', shadow: 'rgba(212, 240, 240, 0.4)' },
  '#CCE2CB': { from: '#CCE2CB', to: '#E2F0E1', shadow: 'rgba(204, 226, 203, 0.4)' },
  '#FFDFD3': { from: '#FFDFD3', to: '#FFF0EA', shadow: 'rgba(255, 223, 211, 0.4)' },
  '#E8AEB7': { from: '#E8AEB7', to: '#F4C2C2', shadow: 'rgba(232, 174, 183, 0.4)' },
  '#B7CFB7': { from: '#B7CFB7', to: '#D3E2D3', shadow: 'rgba(183, 207, 183, 0.4)' },
  '#D7C49E': { from: '#D7C49E', to: '#E8DCBF', shadow: 'rgba(215, 196, 158, 0.4)' },
  '#B18597': { from: '#B18597', to: '#CFA4B7', shadow: 'rgba(177, 133, 151, 0.4)' },
};

const MACARON_PALETTE = Object.keys(COLOR_MAPS);

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'work' | 'personal' | 'mind'>('welcome');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [newMemoText, setNewMemoText] = useState('');
  const [newTodoText, setNewTodoText] = useState(''); // 💡 待辦輸入框控制
  
  const [apiEnglishWord, setApiEnglishWord] = useState({ word: 'Loading...', detail: '連線資料庫撈取今日新聞英文...' });
  const [apiThaiWord, setApiThaiWord] = useState({ word: 'Loading...', detail: '連線資料庫撈取今日商業泰語...' });
  
  const [supabaseMemos, setSupabaseMemos] = useState<MemoItem[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [systemState, setSystemState] = useState<SystemState>(() => {
    const defaultState: SystemState = {
      workTitle: '工作領域',
      workDesc: '日常教學、行政事務與商業專案',
      personalTitle: '私人生活',
      personalDesc: '健康管理、日常興趣與生活調劑',
      mindTitle: '異想知識庫',
      mindDesc: '靈感閃現、奇思妙想與知識筆記',
      projects: [
        { id: 'w-1', name: '工作項目一', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#B5EAEA', notes: '', link: '', todos: [] },
        { id: 'w-2', name: '工作項目二', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#EDF6E8', notes: '', link: '', todos: [] },
        { id: 'w-3', name: '工作項目三', desc: '點擊修改內容與詳細筆記', belongsTo: 'work', color: '#B39CD0', notes: '', link: '', todos: [] },
        { id: 'p-1', name: '生活項目一', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFB4B4', notes: '', link: '', todos: [] },
        { id: 'p-2', name: '生活項目二', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFCCB6', notes: '', link: '', todos: [] },
        { id: 'p-3', name: '生活項目三', desc: '點擊修改內容與詳細筆記', belongsTo: 'personal', color: '#FFDEB4', notes: '', link: '', todos: [] }
      ],
      memos: [
        { id: 'memo-1', text: '歡迎來到你的專屬減壓小宇宙', color: '#FFDEB4' },
        { id: 'memo-2', text: '你不需要每天都很完美，只要前進就好。', color: '#B5EAEA' }
      ]
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_hq_user_universe_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.projects)) {
            return parsed;
          }
        } catch (e) {
          console.error('LocalStorage 解析失敗:', e);
        }
      }
    }
    return defaultState;
  });

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('life_hq_user_universe_data', JSON.stringify(systemState));
    }
  }, [systemState, isInitialized]);

  const fetchDailyWordsFromCloud = async () => {
    if (!supabase) return;
    try {
      const { data: engData, error: engErr } = await supabase.from('daily_words').select('word, detail').eq('type', 'english');
      if (!engErr && engData && engData.length > 0) {
        setApiEnglishWord(engData[Math.floor(Math.random() * engData.length)]);
      } else {
        setApiEnglishWord({ word: '無單字資料', detail: '請先在 Supabase 雲端資料庫新增英文單字。' });
      }

      const { data: thaiData, error: thaiErr } = await supabase.from('daily_words').select('word, detail').eq('type', 'thai');
      if (!thaiErr && thaiData && thaiData.length > 0) {
        setApiThaiWord(thaiData[Math.floor(Math.random() * thaiData.length)]);
      } else {
        setApiThaiWord({ word: '無單字資料', detail: '請先在 Supabase 雲端資料庫新增泰文單字。' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.title = "Life HQ-我的小宇宙";
    setIsInitialized(true);
    fetchDailyWordsFromCloud();

    if (!supabase) return;
    let channel: any;

    const initSupabase = async () => {
      const { data, error } = await supabase.from('ideas').select('*').order('created_at', { ascending: false });
      if (data) {
        setSupabaseMemos(data.map((item: any) => ({ id: `sb-${item.id}`, text: `🛸 ${item.text}`, color: '#B5EAEA' })));
      }
      channel = supabase.channel('schema-db-changes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
        const newIdea = payload.new as { id: number; text: string };
        setSupabaseMemos((prev) => [{ id: `sb-${newIdea.id}`, text: `🛸 ${newIdea.text}`, color: '#FFB4B4' }, ...prev]);
      }).subscribe();
    };
    initSupabase();
    return () => { if (supabase && channel) supabase.removeChannel(channel); };
  }, []);

  const handleAddProject = (zone: 'work' | 'personal' | 'mind') => {
    const newId = `project-${Date.now()}`;
    const newProj: ProjectItem = {
      id: newId,
      name: '未命名新項目',
      desc: '點擊修改內容',
      belongsTo: zone,
      color: MACARON_PALETTE[Math.floor(Math.random() * MACARON_PALETTE.length)],
      notes: '',
      link: '',
      todos: [] // 初始化空待辦
    };
    setSystemState(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
    setActiveProjectId(newId);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    setSystemState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== deleteConfirmId) }));
    if (activeProjectId === deleteConfirmId) setActiveProjectId(null);
    setDeleteConfirmId(null);
  };

  const handleProjectUpdate = (id: string, fields: Partial<ProjectItem>) => {
    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...fields } : p)
    }));
  };

  // 💡 新增：處理專案內待辦事項的函式群
  const handleAddTodo = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        const currentTodos = p.todos || [];
        return {
          ...p,
          todos: [...currentTodos, { id: `todo-${Date.now()}`, text: newTodoText.trim(), completed: false }]
        };
      })
    }));
    setNewTodoText('');
  };

  const handleToggleTodo = (projectId: string, todoId: string) => {
    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          todos: (p.todos || []).map(t => t.id === todoId ? { ...t, completed: !t.completed } : t)
        };
      })
    }));
  };

  const handleDeleteTodo = (projectId: string, todoId: string) => {
    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          todos: (p.todos || []).filter(t => t.id !== todoId)
        };
      })
    }));
  };

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoText.trim()) return;
    setSystemState(prev => ({ ...prev, memos: [{ id: `memo-${Date.now()}`, text: newMemoText.trim(), color: MACARON_PALETTE[Math.floor(Math.random() * MACARON_PALETTE.length)] }, ...(prev.memos || [])] }));
    setNewMemoText('');
  };

  const handleDeleteMemo = async (id: string) => {
    if (id.startsWith('sb-')) {
      const rawId = id.replace('sb-', '');
      setSupabaseMemos(prev => prev.filter(m => m.id !== id));
      if (supabase) await supabase.from('ideas').delete().eq('id', rawId);
    } else {
      setSystemState(prev => ({ ...prev, memos: (prev.memos || []).filter(m => m.id !== id) }));
    }
  };

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const handleDropOnCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetCardId) return;
    setSystemState(prev => {
      const dragIndex = prev.projects.findIndex(p => p.id === draggedId);
      const targetIndex = prev.projects.findIndex(p => p.id === targetCardId);
      if (dragIndex === -1 || targetIndex === -1 || prev.projects[dragIndex].belongsTo !== prev.projects[targetIndex].belongsTo) return prev;
      const newProjects = [...prev.projects];
      const [draggedItem] = newProjects.splice(dragIndex, 1);
      newProjects.splice(targetIndex, 0, draggedItem);
      return { ...prev, projects: newProjects };
    });
    setDraggedId(null);
  };

  if (!isInitialized) return <div className="h-screen w-screen bg-[#FFF0F2] flex items-center justify-center text-slate-400 font-mono text-xs tracking-widest">MY_UNIVERSE INITIALIZING...</div>;

  const combinedMemos = [...supabaseMemos, ...(systemState.memos || [])];
  const displayedProjects = systemState.projects.filter(p => p.belongsTo === currentView);
  const workCount = systemState.projects.filter(p => p.belongsTo === 'work').length;
  const personalCount = systemState.projects.filter(p => p.belongsTo === 'personal').length;
  const mindCount = systemState.projects.filter(p => p.belongsTo === 'mind').length;
  const currentProject = systemState.projects.find(p => p.id === activeProjectId);

  // 計算目前專案的待辦進度摘要
  const getTodoSummary = (proj: ProjectItem) => {
    if (!proj.todos || proj.todos.length === 0) return null;
    const done = proj.todos.filter(t => t.completed).length;
    return `${done}/${proj.todos.length}`;
  };

  return (
    <div className={`min-h-screen w-screen p-8 font-sans antialiased selection:bg-pink-100 relative overflow-x-hidden transition-colors duration-500 ${currentView === 'work' ? 'bg-[#EDF4F6]' : currentView === 'personal' ? 'bg-[#FAF0F2]' : currentView === 'mind' ? 'bg-[#F4EDFA]' : 'bg-[#FAF0F2]'}`}>
      
      <div className={`mx-auto transition-all duration-300 relative z-10 ${currentView === 'welcome' ? 'max-w-6xl' : 'max-w-[95%]'}`}>
        
        <div className="text-[11px] text-pink-400 font-mono mb-8 tracking-widest flex items-center gap-2 select-none">
          <span className="cursor-pointer hover:text-pink-600 transition-colors" onClick={() => setCurrentView('welcome')}>MY_SPACE</span>
          {currentView !== 'welcome' && <><span className="text-slate-300">/</span><span className="text-pink-500 font-medium uppercase">{currentView}_SPACE</span></>}
        </div>

        {/* 主首頁 */}
        {currentView === 'welcome' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-6">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl font-light tracking-tight text-slate-800">屬於我的小宇宙</h1>
              <div className="pt-6 space-y-5">
                <div onClick={() => setCurrentView('work')} className="group cursor-pointer bg-gradient-to-br from-[#E8F4F8]/85 to-[#Cbe3eb]/70 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-300/30 transition-all border border-white/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{systemState.workTitle}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-light">{systemState.workDesc}</p>
                    </div>
                    <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-blue-600 font-medium">{workCount} 項目</div>
                  </div>
                </div>
                <div onClick={() => setCurrentView('personal')} className="group cursor-pointer bg-gradient-to-br from-[#FFF0F2]/90 to-[#Fcdde2]/75 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-pink-300/30 transition-all border border-white/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-pink-700 transition-colors">{systemState.personalTitle}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-light">{systemState.personalDesc}</p>
                    </div>
                    <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-pink-600 font-medium">{personalCount} 項目</div>
                  </div>
                </div>
                <div onClick={() => setCurrentView('mind')} className="group cursor-pointer bg-gradient-to-br from-[#F3EAF8]/85 to-[#E1cbed]/70 backdrop-blur-md rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-300/30 transition-all border border-white/40">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">{systemState.mindTitle}</h3>
                      <p className="text-slate-500 text-xs mt-1 font-light">{systemState.mindDesc}</p>
                    </div>
                    <div className="text-[11px] font-mono bg-white/80 px-3 py-1.5 rounded-xl text-purple-600 font-medium">{mindCount} 項目</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">今日雲端增強計畫</h2>
                    <button type="button" onClick={fetchDailyWordsFromCloud} className="text-[10px] text-pink-500 font-mono">🔄 隨機換字</button>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-white/60 border border-white text-xs"><div className="font-bold text-slate-700 text-sm">{apiEnglishWord.word}</div><div className="text-slate-400 text-[11px] mt-0.5">{apiEnglishWord.detail}</div></div>
                    <div className="p-3.5 rounded-xl bg-white/60 border border-white text-xs"><div className="font-bold text-slate-700 text-sm">{apiThaiWord.word}</div><div className="text-slate-400 text-[11px] mt-0.5">{apiThaiWord.detail}</div></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">時光便簽壁</h2>
                  <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                    {combinedMemos.map(memo => (
                      <div key={memo.id} className="p-3.5 rounded-xl bg-white/90 text-xs text-slate-700 border border-slate-100 relative group flex justify-between items-start shadow-sm">
                        <span className="flex-1 pr-4 font-light">{memo.text}</span>
                        <button onClick={() => handleDeleteMemo(memo.id)} className="text-[10px] text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">刪除</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <form onSubmit={handleAddMemo} className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <input type="text" value={newMemoText} onChange={e => setNewMemoText(e.target.value)} placeholder="輸入便簽內容..." className="bg-slate-50 border border-slate-100 text-xs rounded-xl px-3.5 py-2.5 flex-1 focus:outline-none focus:bg-white transition-all" />
                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 rounded-xl shadow-sm">新增</button>
              </form>
            </div>
          </div>
        )}

        {/* 分區獨立頁面 */}
        {currentView !== 'welcome' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-black/5 pb-5">
              <button onClick={() => setCurrentView('welcome')} className="px-4 py-2 rounded-xl bg-white/80 border border-white/60 text-slate-600 text-xs shadow-sm font-medium">返回首頁</button>
              <div className="text-[10px] text-slate-400 font-mono">💡 提示：點擊方塊可開啟專屬「待辦清單」與筆記</div>
            </div>

            <div className="flex justify-between items-end bg-white/50 backdrop-blur-md p-5 rounded-xl border border-white/60 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-medium text-slate-800 tracking-tight">
                  {currentView === 'work' ? systemState.workTitle : currentView === 'personal' ? systemState.personalTitle : systemState.mindTitle}
                </h2>
                <p className="text-slate-400 text-xs font-light">{currentView === 'work' ? systemState.workDesc : currentView === 'personal' ? systemState.personalDesc : systemState.mindDesc}</p>
              </div>
              <button onClick={() => handleAddProject(currentView)} className="bg-white hover:bg-slate-50 text-slate-700 text-xs px-5 py-2.5 rounded-xl border border-slate-200 font-medium shadow-sm">新增項目</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-2">
              {displayedProjects.map(project => {
                const colorSetup = COLOR_MAPS[project.color] || { from: project.color, to: project.color, shadow: 'rgba(0,0,0,0.05)' };
                const todoSummary = getTodoSummary(project);
                
                return (
                  <div 
                    key={project.id}
                    draggable={true}
                    onDragStart={() => setDraggedId(project.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={(e) => handleDropOnCard(e, project.id)}
                    onClick={() => setActiveProjectId(project.id)}
                    className="cursor-grab active:cursor-grabbing rounded-2xl p-5 flex flex-col justify-between min-h-[160px] transition-all hover:-translate-y-1 duration-300 group relative border border-white/30 backdrop-blur-md select-none"
                    style={{ 
                      background: `linear-gradient(135deg, ${colorSetup.from}ee, ${colorSetup.to}cc)`,
                      boxShadow: `0 10px 25px -5px ${colorSetup.shadow}`
                    }}
                  >
                    <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(project.id); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 text-xs opacity-0 group-hover:opacity-100 transition-opacity">刪除</button>
                    
                    <div className="space-y-2 w-full pt-1"> 
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-md font-bold tracking-tight text-slate-800 leading-snug">{project.name}</span>
                        {todoSummary && (
                          <span className="text-[10px] font-mono bg-white/50 text-slate-700 px-1.5 py-0.5 rounded-md font-bold shadow-xs shrink-0">
                            📋 {todoSummary}
                          </span>
                        )}
                      </div>
                      <span className="text-[12px] text-slate-600/90 block line-clamp-4 font-light whitespace-pre-line leading-relaxed">{project.desc || '點擊填寫內容...'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 💡 擴充：彈窗內置專屬待辦清單 (To-Do List) 功能 */}
        {activeProjectId && currentProject && (
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 relative shadow-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden max-h-[90vh]">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: currentProject.color }} />
              
              {/* 左側：項目基本資料與大筆記 */}
              <div className="md:col-span-7 space-y-4 flex flex-col overflow-y-auto pr-1">
                <div className="flex justify-between items-center mt-2">
                  <input type="text" value={currentProject.name} onChange={e => handleProjectUpdate(currentProject.id, { name: e.target.value })} className="bg-slate-50 text-slate-800 font-medium text-lg rounded-xl px-3 py-1.5 w-full border border-slate-100 focus:bg-white" />
                </div>
                <input type="text" value={currentProject.desc} onChange={e => handleProjectUpdate(currentProject.id, { desc: e.target.value })} className="bg-slate-50 text-slate-500 text-xs rounded-xl px-3 py-2 w-full border border-slate-100 focus:bg-white" />
                
                <div className="flex-1 flex flex-col space-y-1.5 min-h-[180px]">
                  <label className="text-[11px] text-slate-400 font-mono font-bold tracking-wider">詳細筆記與備忘</label>
                  <textarea value={currentProject.notes || ''} onChange={e => handleProjectUpdate(currentProject.id, { notes: e.target.value })} className="w-full flex-1 bg-slate-50 text-slate-700 text-xs rounded-xl p-3 focus:outline-none border border-slate-100 focus:bg-white resize-none leading-relaxed" placeholder="在這裡寫下詳細的脈絡、進度或想法..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-mono font-bold tracking-wider">連結參考</label>
                  <div className="flex gap-2">
                    <input type="text" value={currentProject.link || ''} onChange={e => handleProjectUpdate(currentProject.id, { link: e.target.value })} className="bg-slate-50 text-slate-700 text-xs rounded-xl px-3 py-1.5 flex-1 border border-slate-100 focus:bg-white" placeholder="https://..." />
                    {currentProject.link && <a href={currentProject.link} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl flex items-center shadow-xs">開啟</a>}
                  </div>
                </div>
              </div>

              {/* 右側：專屬待辦事項區面版 */}
              <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col max-h-[400px] md:max-h-full">
                <div className="flex justify-between items-center mb-3 mt-2">
                  <label className="text-[11px] text-slate-400 font-mono font-bold tracking-wider">📋 專屬待辦清單</label>
                  <button onClick={() => setActiveProjectId(null)} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs">關閉</button>
                </div>

                {/* 待辦列表滾動區 */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1 min-h-[150px]">
                  {(currentProject.todos || []).length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-300 text-xs font-light tracking-wide py-10">目前沒有待辦事項</div>
                  ) : (
                    (currentProject.todos || []).map(todo => (
                      <div key={todo.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs group">
                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                          <input 
                            type="checkbox" 
                            checked={todo.completed} 
                            onChange={() => handleToggleTodo(currentProject.id, todo.id)}
                            className="rounded text-pink-500 focus:ring-pink-200 w-3.5 h-3.5 accent-pink-500 cursor-pointer"
                          />
                          <span className={`truncate ${todo.completed ? 'line-through text-slate-300' : 'text-slate-600 font-light'}`}>
                            {todo.text}
                          </span>
                        </label>
                        <button 
                          onClick={() => handleDeleteTodo(currentProject.id, todo.id)} 
                          className="text-[10px] text-slate-300 hover:text-red-400 md:opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* 新增待辦表單 */}
                <form onSubmit={(e) => handleAddTodo(currentProject.id, e)} className="flex gap-2 border-t border-slate-100 pt-3">
                  <input 
                    type="text" 
                    value={newTodoText} 
                    onChange={e => setNewTodoText(e.target.value)} 
                    placeholder="新增待辦步驟..." 
                    className="bg-slate-50 border border-slate-100 text-xs rounded-xl px-3 py-2 flex-1 focus:outline-none focus:bg-white text-slate-700"
                  />
                  <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-3.5 rounded-xl font-medium shadow-xs">添加</button>
                </form>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <select value={currentProject.belongsTo} onChange={e => {
                    const targetZone = e.target.value as 'work' | 'personal' | 'mind';
                    handleProjectUpdate(currentProject.id, { belongsTo: targetZone });
                    setActiveProjectId(null);
                    setCurrentView(targetZone);
                  }} className="bg-slate-50 text-slate-400 hover:text-slate-600 text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-100 focus:outline-none font-medium">
                    <option value="work">移至 工作區</option>
                    <option value="personal">移至 生活區</option>
                    <option value="mind">移至 知識庫</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 刪除確認防防呆 */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
              <span className="text-4xl mb-3 block">🌸</span>
              <h3 className="text-md font-bold text-slate-800 mb-2">確定要刪除這個馬卡龍方塊嗎？</h3>
              <p className="text-slate-400 text-xs mb-6">此動作將連同內部的所有待辦事項一併永久移除！</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium">取消</button>
                <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium shadow-sm">確認刪除</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
