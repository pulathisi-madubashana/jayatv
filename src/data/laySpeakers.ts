import defaultMonk from '@/assets/monks/default-monk.jpg';

export interface LaySpeakerVideo {
  id: string;
  youtubeId: string;
  title: { si: string; en: string };
  programId?: string;
  date: string;
  duration?: string;
}

export interface LaySpeaker {
  id: string;
  name: { si: string; en: string };
  title: { si: string; en: string };
  biography: { si: string; en: string };
  tags: { si: string; en: string }[];
  photo?: string;
  programs?: string[];
  videos?: LaySpeakerVideo[];
}

export const defaultSpeakerPhoto = defaultMonk;

export const laySpeakersData: LaySpeaker[] = [
  {
    id: 'chandana-mendis',
    name: { si: 'චන්දන මෙන්ඩිස්', en: 'Chandana Mendis' },
    title: { si: 'ධර්ම කථිකාචාර්ය', en: 'Dharma Lecturer' },
    biography: {
      si: 'චන්දන මෙන්ඩිස් මහතා වසර 20කට අධික කාලයක් බුද්ධ ධර්මය ප්‍රචාරණය කරන ප්‍රසිද්ධ ධර්ම කථිකයෙකි. උන්වහන්සේ සාරාංශ ධර්ම දේශනා සහ ජීවිත මඟපෙන්වීම සඳහා ප්‍රසිද්ධය.',
      en: 'Mr. Chandana Mendis is a renowned Dharma speaker who has been propagating Buddhism for over 20 years. He is famous for his practical Dharma teachings and life guidance.'
    },
    tags: [
      { si: 'ධර්ම දේශනා', en: 'Dharma Talks' },
      { si: 'ජීවිත මඟපෙන්වීම', en: 'Life Guidance' },
    ],
    programs: ['science-of-success', 'vinivida'],
    videos: [
      {
        id: 'ls-v1',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'සාර්ථක ජීවිතය', en: 'Successful Life' },
        programId: 'science-of-success',
        date: '2024-01-15',
        duration: '45:30'
      },
    ],
  },
  {
    id: 'nilantha-jayawardena',
    name: { si: 'නිලන්ත ජයවර්ධන', en: 'Nilantha Jayawardena' },
    title: { si: 'බෞද්ධ දාර්ශනික', en: 'Buddhist Philosopher' },
    biography: {
      si: 'නිලන්ත ජයවර්ධන මහතා බෞද්ධ දර්ශනය පිළිබඳ විශේෂඥයෙකි. උන්වහන්සේ විවිධ විශ්ව විද්‍යාලවල බුද්ධ දර්ශනය ඉගැන්වීමේ පළපුරුද්ද ඇත.',
      en: 'Mr. Nilantha Jayawardena is an expert in Buddhist philosophy. He has experience teaching Buddhist philosophy at various universities.'
    },
    tags: [
      { si: 'බෞද්ධ දර්ශනය', en: 'Buddhist Philosophy' },
      { si: 'අධ්‍යාපනය', en: 'Education' },
    ],
    programs: ['viwarana'],
    videos: [
      {
        id: 'ls-v2',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'බෞද්ධ දර්ශනයේ මූලධර්ම', en: 'Principles of Buddhist Philosophy' },
        programId: 'viwarana',
        date: '2024-01-12',
        duration: '52:00'
      },
    ],
  },
  {
    id: 'kumari-silva',
    name: { si: 'කුමාරි සිල්වා', en: 'Kumari Silva' },
    title: { si: 'භාවනා උපදේශක', en: 'Meditation Instructor' },
    biography: {
      si: 'කුමාරි සිල්වා මහත්මිය භාවනා උපදේශනයේ විශේෂඥයෙකි. ඇය විපස්සනා භාවනාව සහ සති භාවනාව පිළිබඳ වැඩසටහන් මෙහෙයවයි.',
      en: 'Ms. Kumari Silva is a specialist in meditation instruction. She conducts programs on Vipassana meditation and mindfulness.'
    },
    tags: [
      { si: 'භාවනාව', en: 'Meditation' },
      { si: 'සති', en: 'Mindfulness' },
    ],
    programs: ['samahitha'],
    videos: [
      {
        id: 'ls-v3',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'සති භාවනාව', en: 'Mindfulness Meditation' },
        programId: 'samahitha',
        date: '2024-01-10',
        duration: '35:15'
      },
    ],
  },
  {
    id: 'ranjith-perera',
    name: { si: 'රංජිත් පෙරේරා', en: 'Ranjith Perera' },
    title: { si: 'ධර්ම ග්‍රන්ථ රචක', en: 'Dharma Author' },
    biography: {
      si: 'රංජිත් පෙරේරා මහතා ධර්ම ග්‍රන්ථ රචනයේ පළපුරුදු ලේඛකයෙකි. උන්වහන්සේ බුද්ධ දහම පිළිබඳ පොත් 15කට අධික ප්‍රමාණයක් ලියා ඇත.',
      en: 'Mr. Ranjith Perera is an experienced author in Dharma literature. He has written more than 15 books on Buddhism.'
    },
    tags: [
      { si: 'ග්‍රන්ථ රචනය', en: 'Writing' },
      { si: 'ධර්ම විග්‍රහය', en: 'Dharma Analysis' },
    ],
    programs: ['awarjana', 'vinivida'],
    videos: [
      {
        id: 'ls-v4',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ධර්ම ග්‍රන්ථ කියවීමේ වැදගත්කම', en: 'Importance of Reading Dharma Books' },
        programId: 'awarjana',
        date: '2024-01-08',
        duration: '40:00'
      },
    ],
  },
];
