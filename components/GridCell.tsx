
import React from 'react';
import { Subject, ScheduledCell } from '../types';

interface Props {
  dayIndex: number;
  periodIndex: number;
  data: ScheduledCell | null;
  subject: Subject | undefined;
  onDrop: (dayIndex: number, periodIndex: number, subjectId: string, sourcePos?: { day: number, period: number }) => void;
  onRemove: (dayIndex: number, periodIndex: number) => void;
  isLastColumn?: boolean;
  gridColumn: number;
  gridRow: string;
}

const GridCell: React.FC<Props> = ({ 
  dayIndex, 
  periodIndex, 
  data, 
  subject, 
  onDrop, 
  onRemove, 
  isLastColumn,
  gridColumn,
  gridRow
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const subjectId = e.dataTransfer.getData('subjectId');
    const sourceData = e.dataTransfer.getData('sourcePos');
    
    if (subjectId) {
      const sourcePos = sourceData ? JSON.parse(sourceData) : undefined;
      onDrop(dayIndex, periodIndex, subjectId, sourcePos);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (data && subject) {
      e.dataTransfer.setData('subjectId', subject.id);
      e.dataTransfer.setData('sourcePos', JSON.stringify({ day: dayIndex, period: periodIndex }));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  if (data && !data.isStart) {
    return null; // Cell is spanned by an earlier start slot
  }

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`min-h-[72px] border-b ${isLastColumn ? '' : 'border-r'} border-slate-200 dark:border-slate-800 transition-all p-1.5 relative group
        ${!data ? 'bg-white dark:bg-slate-900 hover:bg-indigo-50/45 dark:hover:bg-indigo-900/15' : ''}
      `}
      style={{
        gridColumn: gridColumn,
        gridRow: gridRow
      }}
    >
      {data && subject ? (
        <div 
          draggable
          onDragStart={handleDragStart}
          onDoubleClick={() => onRemove(dayIndex, periodIndex)}
          className="h-full w-full rounded-lg md:rounded-xl p-2 sm:p-2.5 text-white shadow-md flex flex-col justify-center items-center text-center overflow-hidden animate-in fade-in zoom-in duration-300 relative cursor-grab active:cursor-grabbing hover:brightness-110 active:scale-95 transition-transform"
          style={{ backgroundColor: subject.color }}
        >
          {subject.type === 'Lab' && (
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
            </div>
          )}
          
          <span className="font-extrabold text-[12px] sm:text-[14px] leading-tight uppercase mb-0.5 drop-shadow-md truncate max-w-full">{subject.code}</span>
          <span className="text-[9px] sm:text-[10px] font-semibold opacity-90 leading-none line-clamp-1 px-0.5 drop-shadow-sm">{subject.name}</span>
          
          <div className="mt-1.5 flex gap-1 items-center">
             <span className="text-[8px] font-black bg-black/15 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-inner">{subject.type}</span>
             {data.spanCount > 1 && (
                 <span className="text-[8px] font-black bg-white/15 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-inner">{data.spanCount}P</span>
             )}
          </div>
          
          <button 
             onClick={(e) => { e.stopPropagation(); onRemove(dayIndex, periodIndex); }}
             className="absolute top-1 right-1 p-1 bg-black/10 rounded opacity-0 group-hover:opacity-100 hover:bg-black/30 transition-all cursor-pointer"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      ) : (
          <div className="h-full w-full border border-dashed border-slate-100 dark:border-slate-800/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200 dark:text-slate-700/80"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          </div>
      )}
    </div>
  );
};

export default GridCell;
