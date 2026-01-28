import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { weeklyScheduleData, ScheduleItem, daysOfWeek } from '@/data/scheduleData';

interface DBScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  program_name_sinhala: string;
  program_name_english: string;
  program_id: string | null;
  is_active: boolean;
}

// Convert database schedule to app format
function convertDBSchedule(dbItems: DBScheduleItem[]): Record<string, ScheduleItem[]> {
  const schedule: Record<string, ScheduleItem[]> = {};

  // Group by day
  const byDay: Record<number, DBScheduleItem[]> = {};
  dbItems.forEach((item) => {
    if (!byDay[item.day_of_week]) byDay[item.day_of_week] = [];
    byDay[item.day_of_week].push(item);
  });

  // Convert each day
  Object.entries(byDay).forEach(([day, items]) => {
    const dayKey = daysOfWeek.keys[parseInt(day)];
    // Sort by start time
    const sorted = items.sort((a, b) => a.start_time.localeCompare(b.start_time));
    schedule[dayKey] = sorted.map((item) => ({
      time: item.start_time.slice(0, 5), // HH:MM
      endTime: item.end_time.slice(0, 5),
      program: {
        si: item.program_name_sinhala,
        en: item.program_name_english,
      },
      programId: item.program_id || undefined,
    }));
  });

  return schedule;
}

export function useScheduleData() {
  const [dbSchedule, setDbSchedule] = useState<Record<string, ScheduleItem[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('program_schedule')
        .select('*')
        .eq('is_active', true)
        .order('start_time', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const converted = convertDBSchedule(data);
        setDbSchedule(converted);
      } else {
        setDbSchedule(null);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();

    // Subscribe to real-time changes for schedule updates
    const channel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'program_schedule',
        },
        () => {
          fetchSchedule();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSchedule]);

  // Merge: use DB schedule if available, fallback to static data
  const schedule = useMemo(() => {
    if (dbSchedule && Object.keys(dbSchedule).length > 0) {
      // Merge with static data as fallback for missing days
      return {
        ...weeklyScheduleData,
        ...dbSchedule,
      };
    }
    return weeklyScheduleData;
  }, [dbSchedule]);

  return { schedule, isLoading };
}