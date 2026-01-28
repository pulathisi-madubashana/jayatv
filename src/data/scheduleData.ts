export interface ScheduleItem {
  time: string; // Start time in HH:MM format
  endTime: string; // End time in HH:MM format (REQUIRED for accurate live detection)
  program: { si: string; en: string };
  programId?: string;
}

export interface WeeklySchedule {
  [key: string]: ScheduleItem[];
}

// Complete weekly schedule with CUSTOM times per day
// Each day can have different program durations (30min, 60min, 90min, etc.)
export const weeklyScheduleData: WeeklySchedule = {
  sunday: [
    { time: '05:00', endTime: '06:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '06:00', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'ගමින් ගමට සදහම්', en: 'Gamin Gamata Sadaham' }, programId: 'gamin-gamata-sadaham' },
    { time: '16:00', endTime: '18:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '18:00', endTime: '20:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '22:00', endTime: '00:00', program: { si: 'භාවනා සංවාද', en: 'Meditation Talks' } },
  ],
  monday: [
    { time: '05:00', endTime: '05:30', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '05:30', endTime: '06:00', program: { si: 'ප්‍රභාත ධර්ම සාකච්ඡා', en: 'Morning Dharma Talk' } },
    { time: '06:00', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '16:00', endTime: '18:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '18:00', endTime: '20:00', program: { si: 'සේවා නියුක්ති භාවනා වැඩසටහන', en: 'Sewa Niyukthi' }, programId: 'sewa-niyukthi' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
  ],
  tuesday: [
    { time: '05:00', endTime: '06:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '06:00', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'ගමින් ගමට සදහම්', en: 'Gamin Gamata Sadaham' }, programId: 'gamin-gamata-sadaham' },
    { time: '16:00', endTime: '18:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '18:00', endTime: '20:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
  ],
  wednesday: [
    // Wednesday has mixed 30-minute and 60-minute programs to test custom durations
    { time: '05:00', endTime: '05:30', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '05:30', endTime: '06:00', program: { si: 'ප්‍රභාත භාවනා', en: 'Morning Meditation' } },
    { time: '06:00', endTime: '06:30', program: { si: 'ධර්ම දේශනා', en: 'Dharma Sermon' } },
    { time: '06:30', endTime: '07:30', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '07:30', endTime: '08:00', program: { si: 'සංගීත ධර්ම', en: 'Musical Dharma' } },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '12:30', program: { si: 'දහවල් ධර්ම', en: 'Midday Dharma' } },
    { time: '12:30', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '16:00', endTime: '18:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '18:00', endTime: '18:30', program: { si: 'සන්ධ්‍යා ගීත', en: 'Evening Songs' } },
    { time: '18:30', endTime: '20:00', program: { si: 'සේවා නියුක්ති භාවනා වැඩසටහන', en: 'Sewa Niyukthi' }, programId: 'sewa-niyukthi' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
  ],
  thursday: [
    { time: '05:00', endTime: '06:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '06:00', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'ගමින් ගමට සදහම්', en: 'Gamin Gamata Sadaham' }, programId: 'gamin-gamata-sadaham' },
    { time: '16:00', endTime: '18:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '18:00', endTime: '20:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
  ],
  friday: [
    { time: '05:00', endTime: '05:30', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '05:30', endTime: '06:30', program: { si: 'ප්‍රභාත සාකච්ඡා', en: 'Morning Discussion' } },
    { time: '06:30', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '16:00', endTime: '18:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '18:00', endTime: '20:00', program: { si: 'සේවා නියුක්ති භාවනා වැඩසටහන', en: 'Sewa Niyukthi' }, programId: 'sewa-niyukthi' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
  ],
  saturday: [
    { time: '05:00', endTime: '06:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '06:00', endTime: '08:00', program: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' }, programId: 'mekala-niwena-bana' },
    { time: '08:00', endTime: '10:00', program: { si: 'විනිවිද', en: 'Vinivida' }, programId: 'vinivida' },
    { time: '10:00', endTime: '12:00', program: { si: 'සමාහිත', en: 'Samahitha' }, programId: 'samahitha' },
    { time: '12:00', endTime: '14:00', program: { si: 'ආවර්ජනා', en: 'Awarjana' }, programId: 'awarjana' },
    { time: '14:00', endTime: '16:00', program: { si: 'ගමින් ගමට සදහම්', en: 'Gamin Gamata Sadaham' }, programId: 'gamin-gamata-sadaham' },
    { time: '16:00', endTime: '18:00', program: { si: 'විවරණ', en: 'Viwarana' }, programId: 'viwarana' },
    { time: '18:00', endTime: '20:00', program: { si: 'Science of Success', en: 'Science of Success' }, programId: 'science-of-success' },
    { time: '20:00', endTime: '22:00', program: { si: 'පිරිත් දේශනා', en: 'Pirith Chanting' } },
    { time: '22:00', endTime: '00:00', program: { si: 'රාත්‍රී භාවනා', en: 'Night Meditation' } },
  ],
};

export const daysOfWeek = {
  si: ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  keys: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
};

// Helper function to parse time string to minutes since midnight
export function parseTimeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

// Helper function to check if a time is within a range (handles midnight crossing)
export function isTimeInRange(
  currentMinutes: number,
  startMinutes: number,
  endMinutes: number
): boolean {
  // Handle "00:00" as end of day (24:00)
  const adjustedEnd = endMinutes === 0 ? 24 * 60 : endMinutes;
  
  // Normal case: start < end
  if (startMinutes < adjustedEnd) {
    return currentMinutes >= startMinutes && currentMinutes < adjustedEnd;
  }
  
  // Midnight crossing case: program spans midnight (e.g., 22:00 - 02:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}
