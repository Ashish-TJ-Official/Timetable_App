
import React, { useState, useEffect, useRef } from 'react';
import { 
  TimetableConfig, 
  Subject, 
  TimetableGrid, 
  BreakConfig
} from './types';
import { 
  DAYS_OF_WEEK, 
  DEFAULT_CONFIG, 
  STORAGE_KEY,
  MANUAL_STORAGE_KEY 
} from './constants';
import { addMinutes, formatTimeDisplay, generateId } from './utils/timeUtils';
import SubjectManager from './components/SubjectManager';
import GridCell from './components/GridCell';

const App: React.FC = () => {
  const [config, setConfig] = useState<TimetableConfig>(DEFAULT_CONFIG);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grid, setGrid] = useState<TimetableGrid>({});
  const [darkMode, setDarkMode] = useState(false);
  const [use12h, setUse12h] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const timetableRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Persistence logic - Initial Load
  useEffect(() => {
    const session = localStorage.getItem(STORAGE_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.grid) setGrid(parsed.grid);
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
        if (parsed.use12h !== undefined) setUse12h(parsed.use12h);
        if (parsed.isConfigured !== undefined) setIsConfigured(parsed.isConfigured);
      } catch (e) { console.error("Session restore failed:", e); }
    }
    setIsLoaded(true);
  }, []);

  // Automatic Session Persistence
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, subjects, grid, darkMode, isConfigured, use12h }));
  }, [config, subjects, grid, darkMode, isConfigured, use12h, isLoaded]);

  // Dark Mode Class synchronization
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const saveToLocalStorage = () => {
    const dataToSave = { config, subjects, grid, darkMode, isConfigured, use12h };
    localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(dataToSave));
    alert("Timetable state successfully saved to manual archive.");
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed.config);
        setSubjects(parsed.subjects);
        setGrid(parsed.grid);
        setDarkMode(parsed.darkMode);
        setUse12h(parsed.use12h);
        setIsConfigured(parsed.isConfigured);
        alert("Timetable state loaded from manual archive.");
      } catch (e) {
        alert("Failed to load archived timetable.");
      }
    } else {
      alert("No archived timetable found.");
    }
  };

  const addSubject = (subject: Subject) => setSubjects([...subjects, subject]);
  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    setGrid(prev => {
      const newGrid = { ...prev };
      Object.keys(newGrid).forEach(key => {
        if (newGrid[key]?.subjectId === id) delete newGrid[key];
      });
      return newGrid;
    });
  };

  const handleRemoveCell = (dayIndex: number, periodIndex: number) => {
    const cellId = `${dayIndex}-${periodIndex}`;
    const cell = grid[cellId];
    if (!cell) return;
    const span = cell.spanCount;
    const newGrid = { ...grid };
    for (let i = 0; i < span; i++) {
      delete newGrid[`${dayIndex}-${periodIndex + i}`];
    }
    setGrid(newGrid);
  };

  const handleDrop = (dayIndex: number, periodIndex: number, subjectId: string, sourcePos?: { day: number, period: number }) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    
    const span = subject.duration || 1;
    if (periodIndex + span - 1 > config.periodsPerDay) {
      alert(`Duration (${span} periods) exceeds the end of the day.`);
      return;
    }

    // Prepare a temporary grid for conflict checking
    // If it's an internal move, we "lift" the source temporarily to allow the move
    const checkGrid = { ...grid };
    if (sourcePos) {
      const sourceCellId = `${sourcePos.day}-${sourcePos.period}`;
      const sourceCell = grid[sourceCellId];
      if (sourceCell) {
        for (let i = 0; i < sourceCell.spanCount; i++) {
          delete checkGrid[`${sourcePos.day}-${sourcePos.period + i}`];
        }
      }
    }

    // Check for conflicts in the projected grid
    for (let i = 0; i < span; i++) {
      if (checkGrid[`${dayIndex}-${periodIndex + i}`]) {
        alert("Conflict: This slot is already occupied!");
        return;
      }
    }

    // Success: Apply changes
    const finalGrid = { ...checkGrid };
    for (let i = 0; i < span; i++) {
      finalGrid[`${dayIndex}-${periodIndex + i}`] = {
        subjectId,
        isStart: i === 0,
        spanCount: span
      };
    }
    setGrid(finalGrid);
  };

  const prepareForExport = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }
  };

  const exportAsImage = async () => {
    if (!timetableRef.current) return;
    prepareForExport();
    await new Promise(r => setTimeout(r, 200));

    const canvas = await (window as any).html2canvas(timetableRef.current, {
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: timetableRef.current.scrollWidth,
        windowHeight: timetableRef.current.scrollHeight
    });
    const link = document.createElement('a');
    link.download = 'chronos-timetable.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const exportAsPDF = async () => {
    if (!timetableRef.current) return;
    prepareForExport();
    await new Promise(r => setTimeout(r, 200));

    const canvas = await (window as any).html2canvas(timetableRef.current, { 
      scale: 2, 
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: timetableRef.current.scrollWidth,
      windowHeight: timetableRef.current.scrollHeight
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new (window as any).jspdf.jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('chronos-timetable.pdf');
  };

  const SetupView = () => {
    const [localConfig, setLocalConfig] = useState<TimetableConfig>(config);
    return (
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3rem] shadow-2xl p-5 sm:p-8 md:p-10 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-500 overflow-y-auto max-h-[95vh] lg:max-h-[90vh] scrollbar-hide">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 md:mb-10 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 tracking-tight uppercase italic">
            <span className="bg-indigo-600 text-white p-2.5 sm:p-3 rounded-[1rem] sm:rounded-[1.25rem] shadow-lg transition-transform hover:rotate-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            Schedule Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Active Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const selected = localConfig.selectedDays.includes(day)
                          ? localConfig.selectedDays.filter(d => d !== day)
                          : [...localConfig.selectedDays, day];
                        const sorted = DAYS_OF_WEEK.filter(d => selected.includes(d));
                        setLocalConfig({...localConfig, selectedDays: sorted});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        localConfig.selectedDays.includes(day) 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Starts At</label>
                  <input type="time" value={localConfig.startTime} onChange={e => setLocalConfig({...localConfig, startTime: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Periods / Day</label>
                  <input type="number" min="1" max="15" value={localConfig.periodsPerDay} onChange={e => setLocalConfig({...localConfig, periodsPerDay: parseInt(e.target.value) || 1})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 ring-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Slot (min)</label>
                  <input type="number" step="5" value={localConfig.periodDuration} onChange={e => setLocalConfig({...localConfig, periodDuration: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Gap (min)</label>
                  <input type="number" step="5" value={localConfig.breakDuration} onChange={e => setLocalConfig({...localConfig, breakDuration: parseInt(e.target.value) || 0})} className="w-full bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-4 py-3 text-amber-700 dark:text-amber-400 font-bold focus:ring-2 ring-amber-500 outline-none transition-all" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Shared Breaks</label>
                 <button onClick={() => setLocalConfig({...localConfig, breaks: [...localConfig.breaks, {id: generateId(), label: 'Break', afterPeriod: 4, duration: 30}]})} className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-widest">
                   + Add
                 </button>
              </div>
              <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {localConfig.breaks.map((brk, idx) => (
                  <div key={brk.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 relative group transition-all hover:border-amber-200">
                    <button onClick={() => setLocalConfig({...localConfig, breaks: localConfig.breaks.filter(b => b.id !== brk.id)})} className="absolute top-3 right-3 text-slate-300 hover:text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    <input type="text" placeholder="Label" value={brk.label} onChange={e => {
                      const newBreaks = [...localConfig.breaks];
                      newBreaks[idx].label = e.target.value;
                      setLocalConfig({...localConfig, breaks: newBreaks});
                    }} className="w-full bg-transparent font-black text-xs border-none p-0 focus:ring-0 text-indigo-600 uppercase tracking-wider" />
                    <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <div>
                        <label className="mb-1 block">Post Period:</label>
                        <input type="number" value={brk.afterPeriod} onChange={e => {
                          const newBreaks = [...localConfig.breaks];
                          newBreaks[idx].afterPeriod = parseInt(e.target.value) || 1;
                          setLocalConfig({...localConfig, breaks: newBreaks});
                        }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 font-bold text-slate-800 dark:text-slate-200" />
                      </div>
                      <div>
                        <label className="mb-1 block">Mins:</label>
                        <input type="number" value={brk.duration} onChange={e => {
                          const newBreaks = [...localConfig.breaks];
                          newBreaks[idx].duration = parseInt(e.target.value) || 0;
                          setLocalConfig({...localConfig, breaks: newBreaks});
                        }} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 px-3 font-bold text-slate-800 dark:text-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => { if (localConfig.selectedDays.length === 0) return alert("Select at least one day!"); setConfig(localConfig); setIsConfigured(true); }} className="w-full mt-6 md:mt-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 md:py-5 rounded-2xl md:rounded-[2rem] shadow-xl transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em] text-xs md:text-sm active:scale-95">
            Apply Changes
          </button>
        </div>
      </div>
    );
  };

  const getPeriodRowIndex = (p: number) => {
    let rowIndex = 2; // header is row 1
    for (let i = 1; i < p; i++) {
      rowIndex += 1; // 1 row for the period itself
      const hasBreak = config.breaks.some(b => b.afterPeriod === i);
      if (hasBreak) {
        rowIndex += 1; // 1 row for the break after this period
      }
    }
    return rowIndex;
  };

  const DashboardView = () => {
    return (
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
        <aside className="w-full lg:w-[480px] xl:w-[520px] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-10 overflow-y-visible lg:overflow-y-auto shrink-0 shadow-lg z-10 transition-colors scrollbar-hide">
          <SubjectManager 
            subjects={subjects} 
            onAdd={addSubject} 
            onDelete={deleteSubject} 
            use12h={use12h}
            setUse12h={setUse12h}
            config={config}
            saveToLocalStorage={saveToLocalStorage}
            loadFromLocalStorage={loadFromLocalStorage}
            setIsConfigured={setIsConfigured}
          />
        </aside>

        <div className="flex-1 p-3 sm:p-6 lg:p-8 bg-slate-100/50 dark:bg-slate-900/20 flex flex-col items-center justify-start lg:justify-center overflow-x-auto overflow-y-visible lg:overflow-hidden">
          <div 
            ref={scrollContainerRef}
            className="w-full max-h-[60vh] lg:max-h-[75vh] overflow-auto rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl scrollbar-thin"
          >
            <div 
              ref={timetableRef}
              className="w-full text-[12px]"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `96px repeat(${config.selectedDays.length}, minmax(130px, 1fr))`,
                width: '100%',
                minWidth: 'max-content'
              }}
            >
              <div 
                className="sticky top-0 left-0 z-50 bg-slate-200 dark:bg-slate-800 p-2 border-b border-r border-slate-300 dark:border-slate-700 font-black text-center text-slate-500 text-[9px] uppercase tracking-[0.2em] flex items-center justify-center italic shadow-sm"
                style={{ gridColumn: 1, gridRow: 1 }}
              >
                Timeline
              </div>
              
              {config.selectedDays.map((day, idx) => (
                <div 
                  key={day} 
                  className={`sticky top-0 z-40 p-2 sm:p-2.5 border-b ${idx === config.selectedDays.length - 1 ? '' : 'border-r'} border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-black text-center text-slate-800 dark:text-slate-200 uppercase tracking-[0.1em] text-xs sm:text-sm transition-colors shadow-sm`}
                  style={{ gridColumn: idx + 2, gridRow: 1 }}
                >
                  {day}
                </div>
              ))}

              {(() => {
                const rows = [];
                let currentTime = config.startTime;

                for (let p = 1; p <= config.periodsPerDay; p++) {
                  const periodStart = currentTime;
                  const periodEnd = addMinutes(periodStart, config.periodDuration);
                  const rowIdx = getPeriodRowIndex(p);
                  
                  rows.push(
                    <React.Fragment key={`period-${p}`}>
                      <div 
                        className="sticky left-0 z-30 p-1.5 sm:p-2 bg-white dark:bg-slate-900 border-b border-r border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-0.5 group transition-colors shadow-sm min-h-[72px]"
                        style={{ gridColumn: 1, gridRow: `${rowIdx} / span 1` }}
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tighter">{formatTimeDisplay(periodStart, use12h)}</span>
                        <div className="w-5 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-indigo-500 transition-all duration-300"></div>
                        <span className="text-xs font-black text-slate-400 dark:text-slate-600 tracking-tighter">{formatTimeDisplay(periodEnd, use12h)}</span>
                      </div>
                      
                      {config.selectedDays.map((_, d) => {
                        const cellData = grid[`${d}-${p}`];
                        const subject = subjects.find(s => s.id === cellData?.subjectId);
                        const isLastDay = d === config.selectedDays.length - 1;
                        return (
                          <GridCell 
                            key={`${d}-${p}`} 
                            dayIndex={d} 
                            periodIndex={p} 
                            data={cellData || null} 
                            subject={subject} 
                            onDrop={handleDrop} 
                            onRemove={handleRemoveCell} 
                            isLastColumn={isLastDay} 
                            gridColumn={d + 2}
                            gridRow={cellData ? `${rowIdx} / span ${cellData.spanCount}` : `${rowIdx} / span 1`}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                  
                  const breakFound = config.breaks.find(b => b.afterPeriod === p);
                  if (breakFound) {
                    const intervalEnd = addMinutes(periodEnd, config.breakDuration);
                    const breakStart = intervalEnd;
                    const breakEnd = addMinutes(breakStart, breakFound.duration);
                    rows.push(
                      <React.Fragment key={`break-row-${p}`}>
                        <div 
                          className="sticky left-0 z-30 p-1.5 bg-amber-50 dark:bg-amber-900/30 border-b border-r border-amber-200 dark:border-amber-800/50 flex flex-col items-center justify-center min-h-[46px] shadow-sm"
                          style={{ gridColumn: 1, gridRow: `${rowIdx + 1} / span 1` }}
                        >
                           <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 tracking-tighter leading-none">{formatTimeDisplay(breakStart, use12h)}</span>
                           <div className="h-2 w-px bg-amber-200 dark:bg-amber-700 my-0.5"></div>
                           <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 tracking-tighter leading-none">{formatTimeDisplay(breakEnd, use12h)}</span>
                        </div>
                        <div 
                          style={{ 
                            gridColumn: `2 / span ${config.selectedDays.length}`,
                            gridRow: `${rowIdx + 1} / span 1`
                          }} 
                          className="bg-amber-50/60 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-xs md:text-sm font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.4em] italic min-h-[46px]"
                        >
                          {breakFound.label} • {breakFound.duration}m
                        </div>
                      </React.Fragment>
                    );
                    currentTime = breakEnd;
                  } else {
                    currentTime = addMinutes(periodEnd, config.breakDuration);
                  }
                }
                return rows;
              })()}
            </div>
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50 overflow-x-hidden overflow-y-auto lg:overflow-hidden">
      <header className="bg-white dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 md:px-10 md:py-6 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 z-50 transition-colors shadow-sm shrink-0">
        <div className="flex items-center gap-3 sm:gap-5 group cursor-pointer" onClick={() => setIsConfigured(false)}>
          <div className="bg-indigo-600 p-2.5 sm:p-3.5 rounded-[1.25rem] text-white shadow-xl transition-all group-hover:rotate-6 group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Chronos <span className="text-indigo-600 not-italic">Pro</span></h1>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all active:scale-90" aria-label="Toggle dark mode">
            {darkMode ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 fill-yellow-400 animate-in fade-in zoom-in duration-300"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 fill-slate-600 animate-in fade-in zoom-in duration-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            }
          </button>
          
          {isConfigured && (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={exportAsImage} 
                className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black transition-all hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 flex items-center gap-2 uppercase tracking-[0.15em] active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                PNG
              </button>
              <button 
                onClick={exportAsPDF} 
                className="group bg-indigo-600 text-white px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black transition-all hover:shadow-2xl hover:-translate-y-0.5 sm:hover:-translate-y-1 flex items-center gap-2 uppercase tracking-[0.15em] active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </button>
            </div>
          )}
        </div>
      </header>

      {isConfigured ? <DashboardView /> : <SetupView />}
      
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-4 px-4 md:px-10 flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] transition-colors shrink-0 text-center">
        <span>Chronos Timetable Engine &copy; {new Date().getFullYear()}</span>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-10">
          <span className="hover:text-indigo-500 cursor-pointer transition-colors">Internal Systems</span>
          <span className="hover:text-indigo-500 cursor-pointer transition-colors">Support Portal</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
