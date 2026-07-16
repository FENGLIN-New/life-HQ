'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. 初始化 Supabase 用戶端 (防錯機制)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 2. 定義資料結構與型別
interface Item {
  id: string;
  text: string;
  completed: boolean;
  type: 'todo' | 'note';
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: Item[];
}

interface SystemState {
  projects: Project[];
  activeProjectId: string | null;
  activeItemType: 'todo' | 'note';
}

// 🔥 重點：直接在預設狀態裡「塞入假資料」，確保絕對能渲染出雙面板！
const defaultState: SystemState = {
  projects: [
    {
      id: 'default-project-1',
      name: '雲端增強計畫',
      icon: '⚡',
      color: 'from-blue-500 to-indigo-500',
      items: [
        { id: 'item-1', text: '歡迎來到你的專屬減壓小宇宙', completed: false, type: 'note', createdAt: new Date().toISOString() },
        { id: 'item-2', text: '你不需要每天都很完美，只要前進就好。', completed: false, type: 'note', createdAt: new Date().toISOString() },
        { id: 'item-3', text: '在 Supabase 資料庫同步成功前，這裡會顯示預設資料', completed: false, type: 'todo', createdAt: new Date().toISOString() }
      ]
    }
  ],
  activeProjectId: 'default-project-1',
  activeItemType: 'note'
};

export default function Home() {
  // 3. 狀態初始化 (優先讀取本地快取，否則用包含假資料的預設值)
  const [systemState, setSystemState] = useState<SystemState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('life_hq_user_universe_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // 確保抓出來的資料是有項目的，如果舊資料是空的，一樣強制用假資料
          if (parsed && Array.isArray(parsed.projects) && parsed.projects.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("解析 LocalStorage 失敗", e);
        }
      }
    }
    return defaultState;
  });

  const [newItemText, setNewItemText] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 4. 當狀態改變時，自動儲存到 LocalStorage
  useEffect(() => {
    localStorage.setItem('life_hq_user_universe_data', JSON.stringify(systemState));
  }, [systemState]);

  // 5. 從 Supabase 同步資料 (如果連得上的話)
  useEffect(() => {
    async function loadSupabaseData() {
      if (!supabase) return;
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('user_universe')
          .select('content')
          .single();
        
        if (data && data.content) {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          if (parsed && parsed.projects && parsed.projects.length > 0) {
            setSystemState(parsed);
          }
        }
      } catch (err) {
        console.log("暫時無法連線至 Supabase，使用本地/預設資料儲存", err);
      } finally {
        setIsSyncing(false);
      }
    }
    loadSupabaseData();
  }, []);

  // 取得當前選中的項目
  const activeProject = systemState.projects.find(p => p.id === systemState.activeProjectId) || systemState.projects[0];

  // 處理切換項目
  const handleSelectProject = (projectId: string) => {
    setSystemState(prev => ({ ...prev, activeProjectId: projectId }));
  };

  // 處理切換 待辦/筆記 分頁
  const handleTypeChange = (type: 'todo' | 'note') => {
    setSystemState(prev => ({ ...prev, activeItemType: type }));
  };

  // 新增項目 (待辦或筆記)
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !activeProject) return;

    const newItem: Item = {
      id: `item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      type: systemState.activeItemType,
      createdAt: new Date().toISOString()
    };

    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === activeProject.id 
          ? { ...p, items: [newItem, ...p.items] }
          : p
      )
    }));
    setNewItemText('');
  };

  // 切換待辦事項勾選狀態
  const handleToggleTodo = (itemId: string) => {
    setSystemState(prev => ({
      ...prev,
      projects: prev.projects.map(p => ({
        ...p,
        items: p.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        )
      }))
    }));
  };

  // 新增專案分類
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName.trim(),
      icon: '📁',
      color: randomColor,
      items: []
    };

    setSystemState(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      activeProjectId: newProject.id
    }));
    setNewProjectName('');
    setShowAddProject(false);
  };

  // 過濾當前分頁要顯示的內容
  const filteredItems = activeProject 
    ? activeProject.items.filter(item => item.type === systemState.activeItemType)
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 頂部標題與狀態列 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              今日雲端增強計畫
            </h1>
            <p className="text-sm text-slate-500 mt-1">時光便籤壁 · 您的專屬減壓小宇宙</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${supabase ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <span className={`h-2 w-2 rounded-full ${supabase ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`}></span>
              {supabase ? (isSyncing ? '雲端同步中...' : 'LINE 即時同步中') : '本地快取模式'}
            </span>
          </div>
        </div>

        {/* 💡 提示操作列 */}
        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-4 text-sm text-indigo-700 flex items-center gap-2">
          <span>⚡ 點擊左側方塊，右側面板會即時切換待辦與筆記</span>
        </div>

        {/* 核心雙面板排版佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 左側面板：專案項目方塊 (佔 5 格) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-700">分類項目</h2>
              <button 
                onClick={() => setShowAddProject(!showAddProject)}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                {showAddProject ? '取消新增' : '+ 新增分類'}
              </button>
            </div>

            {/* 新增分類表單 */}
            {showAddProject && (
              <form onSubmit={handleCreateProject} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <input 
                  type="text"
                  placeholder="輸入新分類名稱..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={20}
                  required
                />
                <button type="submit" className="w-full text-xs bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-medium transition">
                  確認建立
                </button>
              </form>
            )}

            {/* 分類方塊列表 - 強制 grid-cols-1 垂直單列堆疊 */}
            <div className="grid grid-cols-1 gap-4">
              {systemState.projects.map((project) => {
                const isSelected = activeProject?.id === project.id;
                const todoCount = project.items.filter(i => i.type === 'todo' && !i.completed).length;
                const noteCount = project.items.filter(i => i.type === 'note').length;

                return (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 bg-white shadow-sm ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-600/10' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${project.color} text-white flex items-center justify-center text-lg shadow-sm`}>
                          {project.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{project.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>📋 {todoCount} 待辦</span>
                            <span>·</span>
                            <span>✍️ {noteCount} 筆記</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
                          已選取
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 右側面板：詳細內容與新增區 (佔 7 格) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {activeProject ? (
              <div>
                {/* 右側面板頭部：分頁切換 */}
                <div className="bg-slate-50/70 p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 text-base">{activeProject.name}</span>
                  </div>
                  
                  {/* 待辦 / 筆記 切換 Tab */}
                  <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => handleTypeChange('note')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                        systemState.activeItemType === 'note'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ✍️ 隨手筆記
                    </button>
                    <button
                      onClick={() => handleTypeChange('todo')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                        systemState.activeItemType === 'todo'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      📋 待辦清單
                    </button>
                  </div>
                </div>

                {/* 內容輸入區 */}
                <div className="p-6 border-b border-slate-100">
                  <form onSubmit={handleAddItem} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={systemState.activeItemType === 'todo' ? "新增待辦事項..." : "寫點生活筆記、減壓小語..."}
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition shadow-sm shrink-0"
                    >
                      新增
                    </button>
                  </form>
                </div>

                {/* 列表渲染區 */}
                <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      <div className="text-3xl mb-2">🍃</div>
                      目前還沒有任何{systemState.activeItemType === 'todo' ? '待辦事項' : '筆記'}喔，立刻在上方新增一個吧！
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                          item.completed 
                            ? 'bg-slate-50/80 border-slate-100 text-slate-400 line-through' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        {systemState.activeItemType === 'todo' && (
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleTodo(item.id)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        )}
                        <span className="flex-1 break-words">{item.text}</span>
                      </div>
                    ))
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-slate-400 text-sm">
                請先建立或選取左側的一個項目分類
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
