import { useState, useEffect, useRef, useCallback } from 'react';
import { ScheduleItem, parseTimeToMinutes, isTimeInRange } from '@/data/scheduleData';

const SRI_LANKA_TIMEZONE = 'Asia/Colombo';

export interface SriLankaTime {
  hours: number;
  minutes: number;
  seconds: number;
  date: Date;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  formattedTime: string;
  formattedDate: string;
  dateKey: string; // e.g., 'sunday', 'monday'
  totalMinutes: number; // Total minutes since midnight
}

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Core function to get current Sri Lanka time
 * Uses Intl.DateTimeFormat for accurate timezone conversion
 * Does NOT rely on browser local time
 */
export function getSriLankaTime(): SriLankaTime {
  const now = new Date();
  
  // Use Intl.DateTimeFormat to get accurate Sri Lanka time components
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SRI_LANKA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SRI_LANKA_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: SRI_LANKA_TIMEZONE,
    weekday: 'long',
  });
  
  const timeParts = timeFormatter.formatToParts(now);
  const hours = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0', 10);
  const minutes = parseInt(timeParts.find(p => p.type === 'minute')?.value || '0', 10);
  const seconds = parseInt(timeParts.find(p => p.type === 'second')?.value || '0', 10);
  
  const dayName = dayFormatter.format(now).toLowerCase();
  const dayOfWeek = dayKeys.indexOf(dayName);
  
  const totalMinutes = hours * 60 + minutes;
  
  return {
    hours,
    minutes,
    seconds,
    date: now,
    dayOfWeek: dayOfWeek >= 0 ? dayOfWeek : 0,
    formattedTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    formattedDate: dateFormatter.format(now),
    dateKey: dayName,
    totalMinutes,
  };
}

/**
 * React hook that provides real-time Sri Lanka time
 * @param updateInterval - How often to update in milliseconds (default: 30 seconds)
 */
export function useSriLankaTime(updateInterval: number = 30000): SriLankaTime {
  const [time, setTime] = useState<SriLankaTime>(() => getSriLankaTime());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Immediate update on mount
    setTime(getSriLankaTime());
    
    // Set up interval for continuous updates
    intervalRef.current = setInterval(() => {
      setTime(getSriLankaTime());
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval]);

  return time;
}

/**
 * Finds the currently live program from a schedule
 * Uses strict time comparison: startTime <= currentTime < endTime
 * Only ONE program can be live at a time
 * 
 * @param schedule - Array of schedule items for the day
 * @param currentHours - Current hour in Sri Lanka time (0-23)
 * @param currentMinutes - Current minutes (0-59)
 * @returns Index of the live program, or -1 if no program is live
 */
export function findLiveProgramIndex(
  schedule: ScheduleItem[],
  currentHours: number,
  currentMinutes: number
): number {
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  
  for (let i = 0; i < schedule.length; i++) {
    const item = schedule[i];
    const startMinutes = parseTimeToMinutes(item.time);
    const endMinutes = parseTimeToMinutes(item.endTime);
    
    if (isTimeInRange(currentTotalMinutes, startMinutes, endMinutes)) {
      return i;
    }
  }
  
  return -1; // No program is currently live
}

/**
 * Checks if a specific program is currently live
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format  
 * @param currentHours - Current hour (0-23)
 * @param currentMinutes - Current minutes (0-59)
 */
export function isProgramLive(
  startTime: string,
  endTime: string,
  currentHours: number,
  currentMinutes: number
): boolean {
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  
  return isTimeInRange(currentTotalMinutes, startMinutes, endMinutes);
}

// Legacy export for backward compatibility
export const getCurrentProgramIndex = findLiveProgramIndex;
export const isCurrentlyLive = isProgramLive;

export function formatSriLankaDate(date: Date, language: 'si' | 'en'): string {
  return date.toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', {
    timeZone: SRI_LANKA_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
