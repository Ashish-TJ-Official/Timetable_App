
export const addMinutes = (timeStr: string, minutes: number): string => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const formatTimeDisplay = (time24: string, use12h: boolean): string => {
  if (!use12h) return time24;
  const [hours, mins] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const mStr = mins.toString().padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getRandomColor = (existingColors: string[]) => {
  const available = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f97316'];
  const unused = available.filter(c => !existingColors.includes(c));
  return unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : '#' + Math.floor(Math.random()*16777215).toString(16);
};
