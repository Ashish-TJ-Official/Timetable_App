
import { TimetableConfig } from './types';

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_CONFIG: TimetableConfig = {
  selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periodsPerDay: 8,
  startTime: "09:00",
  periodDuration: 50,
  breakDuration: 10, // Interval gap
  breaks: [
    { id: 'b1', afterPeriod: 4, duration: 60, label: 'Lunch Break' }
  ]
};

export const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f97316',
  '#14b8a6', '#d946ef', '#64748b'
];

export const STORAGE_KEY = 'CHRONOS_TIMETABLE_PRO_SESSION_V4';
export const MANUAL_STORAGE_KEY = 'CHRONOS_TIMETABLE_PRO_ARCHIVE_V4';
