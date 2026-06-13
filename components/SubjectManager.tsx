
import React, { useState } from 'react';
import { Subject, SubjectType, TimetableConfig } from '../types';
import { getRandomColor, generateId } from '../utils/timeUtils';

interface Props {
  subjects: Subject[];
  onAdd: (subject: Subject) => void;
  onDelete: (id: string) => void;
  // Engine Control props
  use12h: boolean;
  setUse12h: (val: boolean) => void;
  config: TimetableConfig;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  setIsConfigured: (val: boolean) => void;
}

const SubjectManager: React.FC<Props> = ({ 
  subjects, 
  onAdd, 
  onDelete,
  use12h,
  setUse12h,
  config,
  saveToLocalStorage,
  loadFromLocalStorage,
  setIsConfigured
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SubjectType>('Theory');
  const [duration, setDuration] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    
    onAdd({
      id: generateId(),
      name,
      code,
      type,
      duration: type === 'Lab' ? duration : 1,
      color: getRandomColor(subjects.map(s => s.color))
    });
    
    setName('');
    setCode('');
    setDuration(1);
    setType('Theory');
  };

  const inputClasses = "w-full px-4 py-3 rounded-[1rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[12px] font-bold focus:ring-2 ring-indigo-500/10 transition-all dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 appearance-none";

  return (
    <div className="space-y-6 md:space-y-8" style={{ fontSize: '12px' }}>
      <div>
        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 md:mb-6 flex items-center justify-between italic">
          <span>Inventory</span>
          <span className="text-[10px] not-italic font-black bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">{subjects.length} Units</span>
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-6 md:mb-8 p-4 md:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-inner">
          
          {/* Top section: Subject Info (Left Col) and Engine Controls (Right Col) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Column: Subject Name and Code inputs (each taking half width visually as requested) */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                <input 
                  type="text" 
                  placeholder="E.G. PHYSICS" 
                  className={inputClasses}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                <input 
                  type="text" 
                  placeholder="E.G. PHY-201" 
                  className={`${inputClasses} uppercase`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Engine Controls */}
            <div className="p-4 bg-white dark:bg-slate-950 rounded-[1.25rem] border border-slate-200 dark:border-slate-800/60 text-[11px] font-black uppercase tracking-widest text-slate-400/80 space-y-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 dark:text-slate-100 italic text-xs lowercase first-letter:uppercase font-black">Controls</span>
                <button 
                  type="button" 
                  onClick={() => setUse12h(!use12h)} 
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md transition-transform active:scale-95 cursor-pointer"
                >
                  {use12h ? '12 HR' : '24 HR'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                <div className="flex justify-between border-b border-slate-200/40 dark:border-slate-800 pb-1">
                  <span>Days</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{config.selectedDays.length}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/40 dark:border-slate-800 pb-1">
                  <span>Gap</span>
                  <span className="text-amber-600 dark:text-amber-400 font-black">{config.breakDuration}m</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={saveToLocalStorage}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save
                </button>
                <button 
                  type="button"
                  onClick={loadFromLocalStorage}
                  className="py-2 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Load
                </button>
              </div>

              <button 
                type="button" 
                onClick={() => setIsConfigured(false)} 
                className="w-full py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-extrabold transition-all active:scale-[0.97] shadow-sm uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Config
              </button>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <div className="relative group/sel">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-[1rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-[12px] font-bold focus:ring-2 ring-indigo-500/10 transition-all dark:text-white outline-none appearance-none cursor-pointer"
                  value={type}
                  onChange={(e) => setType(e.target.value as SubjectType)}
                >
                  <option value="Theory">Theory</option>
                  <option value="Lab">Lab</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/sel:text-indigo-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Span</label>
              {type === 'Lab' ? (
                <div className="relative">
                  <input 
                    type="number" 
                    min="1" 
                    max="6" 
                    className={inputClasses}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 pointer-events-none uppercase">P</span>
                </div>
              ) : (
                  <div className="px-4 py-3 rounded-[1rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-400 flex items-center justify-center uppercase tracking-widest">1 Period</div>
              )}
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-[1rem] transition-all shadow-lg uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] cursor-pointer"
          >
            Store Unit
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {subjects.map(s => (
          <div 
            key={s.id} 
            draggable 
            onDragStart={(e) => {
                e.dataTransfer.setData('subjectId', s.id);
                e.dataTransfer.effectAllowed = 'move';
            }}
            className="flex items-center justify-between p-3 sm:p-4 rounded-xl md:rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 cursor-grab active:cursor-grabbing hover:shadow-xl hover:-translate-y-0.5 md:hover:-translate-y-1 transition-all group"
            style={{ borderLeft: `10px solid ${s.color}` }}
          >
            <div className="pl-1.5 sm:pl-3 min-w-0 flex-1 mr-2">
              <p className="font-black text-[12px] text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-none mb-1 truncate">{s.code}</p>
              <p className="text-[11px] font-bold text-slate-400 truncate tracking-tight">{s.name}</p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg uppercase">{s.type === 'Lab' ? `${s.duration}P` : '1P'}</span>
                <button 
                  onClick={() => onDelete(s.id)}
                  className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectManager;
