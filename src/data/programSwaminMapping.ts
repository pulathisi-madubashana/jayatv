// Program to Swamin (Monk) Mapping Data
// This maps which monks conduct which programs

import monk1 from '@/assets/monks/monk-1.jpg';
import monk2 from '@/assets/monks/monk-2.jpg';
import monk3 from '@/assets/monks/monk-3.jpg';
import monk4 from '@/assets/monks/monk-4.jpg';
import monk5 from '@/assets/monks/monk-5.jpg';
import monk6 from '@/assets/monks/monk-6.jpg';
import defaultMonk from '@/assets/monks/default-monk.jpg';

export interface Swamin {
  id: string;
  name: { si: string; en: string };
  photo: string;
  type: 'monk' | 'lay-speaker';
}

export interface ProgramWithSwamins {
  programId: string;
  programName: { si: string; en: string };
  swamins: string[]; // Array of swamin IDs
}

// All Swamins (Monks & Lay Speakers) available in the system
export const swaminsData: Swamin[] = [
  {
    id: 'udadumbara-kashyapa',
    name: { 
      si: 'උඩදුම්බර කාශ්‍යප ස්වාමීන්වහන්සේ', 
      en: 'Ududumbara Kashyapa Thero' 
    },
    photo: monk1,
    type: 'monk',
  },
  {
    id: 'puhulwelle-sarada',
    name: { 
      si: 'පුහුල්වැලේ සාරද ස්වාමීන්වහන්සේ', 
      en: 'Puhulwelle Sarada Thero' 
    },
    photo: monk2,
    type: 'monk',
  },
  {
    id: 'neethiyagama-chandima',
    name: { 
      si: 'නීතියගම චන්දිම ස්වාමීන්වහන්සේ', 
      en: 'Neethiyagama Chandima Thero' 
    },
    photo: monk3,
    type: 'monk',
  },
  {
    id: 'hasalaka-seelawimala',
    name: { 
      si: 'හසලක සීලවිමල ස්වාමීන්වහන්සේ', 
      en: 'Hasalaka Seelawimala Thero' 
    },
    photo: monk4,
    type: 'monk',
  },
  {
    id: 'samanera-swamin',
    name: { 
      si: 'සාමනේර ස්වාමීන්වහන්සේ', 
      en: 'Samanera Monks' 
    },
    photo: monk5,
    type: 'monk',
  },
  {
    id: 'kiribathgoda-gnanananda',
    name: { 
      si: 'කිරිබත්ගොඩ ඤාණානන්ද ස්වාමීන්වහන්සේ', 
      en: 'Kiribathgoda Gnanananda Thero' 
    },
    photo: monk6,
    type: 'monk',
  },
  {
    id: 'seehela-upasikawa',
    name: { 
      si: 'සීහෙල උපාසිකාව', 
      en: 'Seehela Upasikawa' 
    },
    photo: defaultMonk,
    type: 'lay-speaker',
  },
];

// Program to Swamin Mapping
export const programSwaminMapping: ProgramWithSwamins[] = [
  {
    programId: 'mekala-niwena-bana',
    programName: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' },
    swamins: ['udadumbara-kashyapa'],
  },
  {
    programId: 'awarjana',
    programName: { si: 'ආවර්ජනා', en: 'Awarjana' },
    swamins: ['udadumbara-kashyapa'],
  },
  {
    programId: 'viwarana',
    programName: { si: 'විවරණ', en: 'Viwarana' },
    swamins: ['puhulwelle-sarada'],
  },
  {
    programId: 'thathagatha-sri-saddharmaya',
    programName: { si: 'තථාගත ශ්‍රී සද්ධර්මය', en: 'Thathagatha Sri Saddharmaya' },
    swamins: ['neethiyagama-chandima', 'hasalaka-seelawimala'],
  },
  {
    programId: 'nigrodabhimana',
    programName: { si: 'නිග්‍රෝදාභිමාන', en: 'Nigrodabhimana' },
    swamins: ['samanera-swamin'],
  },
  {
    programId: 'sewa-niyukthi',
    programName: { si: 'සේවානියුක්ති', en: 'Sewa Niyukthi' },
    swamins: ['udadumbara-kashyapa'],
  },
  {
    programId: 'science-of-success',
    programName: { si: 'Science of Success', en: 'Science of Success' },
    swamins: ['udadumbara-kashyapa'],
  },
  {
    programId: 'aloka',
    programName: { si: 'ආලෝක', en: 'Aloka' },
    swamins: [], // Future assignment supported
  },
  {
    programId: 'seehela-upasikawa',
    programName: { si: 'සීහෙල උපාසිකාව', en: 'Seehela Upasikawa' },
    swamins: ['seehela-upasikawa'],
  },
];

// Helper function to get swamins for a specific program
export function getSwaminsForProgram(programId: string): Swamin[] {
  const mapping = programSwaminMapping.find(p => p.programId === programId);
  if (!mapping) return [];
  
  return mapping.swamins
    .map(swaminId => swaminsData.find(s => s.id === swaminId))
    .filter((s): s is Swamin => s !== undefined);
}

// Helper function to get all programs for submission form
export function getSubmissionPrograms() {
  return programSwaminMapping.map(p => ({
    id: p.programId,
    name: p.programName,
  }));
}
