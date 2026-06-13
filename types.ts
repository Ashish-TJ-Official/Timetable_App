
export type SubjectType = 'Theory' | 'Lab';

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  color: string;
  duration: number; // in periods
}

export interface BreakConfig {
  id: string;
  afterPeriod: number; // Index of period after which break occurs (1-based)
  duration: number; // in minutes
  label: string;
}

export interface TimetableConfig {
  selectedDays: string[];
  periodsPerDay: number;
  startTime: string; // HH:mm
  periodDuration: number; // minutes
  breakDuration: number; // Interval gap between every period (minutes)
  breaks: BreakConfig[]; // Common breaks (like Lunch) that get a special row
}

export interface ScheduledCell {
  subjectId: string;
  isStart: boolean;
  spanCount: number;
}

export type TimetableGrid = Record<string, ScheduledCell | null>;

export interface AppState {
  config: TimetableConfig;
  subjects: Subject[];
  grid: TimetableGrid;
  darkMode: boolean;
  isConfigured: boolean;
}
