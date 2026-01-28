import monk1 from '@/assets/monks/monk-1.jpg';
import monk2 from '@/assets/monks/monk-2.jpg';
import monk3 from '@/assets/monks/monk-3.jpg';
import monk4 from '@/assets/monks/monk-4.jpg';
import monk5 from '@/assets/monks/monk-5.jpg';
import monk6 from '@/assets/monks/monk-6.jpg';
import defaultMonk from '@/assets/monks/default-monk.jpg';

export interface MonkVideo {
  id: string;
  youtubeId: string;
  title: { si: string; en: string };
  programId?: string;
  date: string;
  duration?: string;
}

export interface Monk {
  id: string;
  name: { si: string; en: string };
  temple: { si: string; en: string };
  biography: { si: string; en: string };
  tags: { si: string; en: string }[];
  photo?: string;
  programs?: string[];
  videos?: MonkVideo[];
}

export const defaultMonkPhoto = defaultMonk;

export const monksData: Monk[] = [
  {
    id: 'athuraliye-rathana',
    name: { si: 'අතුරලියේ රතන හිමි', en: 'Athuraliye Rathana Thero' },
    temple: { si: 'ශ්‍රී බෝධිරාජාරාමය, කොළඹ', en: 'Sri Bodhirajramaya, Colombo' },
    biography: {
      si: 'අතුරලියේ රතන හිමි ශ්‍රී ලංකාවේ ප්‍රසිද්ධ ධර්මකථික භික්ෂුවකි. උන්වහන්සේ සමාජ සේවයේ සහ ධර්ම ප්‍රචාරණයේ පෙරමුණේ සිටින අයෙකි.',
      en: 'Athuraliye Rathana Thero is a renowned Dharma speaker in Sri Lanka. He is at the forefront of social service and Dharma propagation.'
    },
    tags: [
      { si: 'ධර්ම දේශනා', en: 'Dharma Sermons' },
      { si: 'සමාජ සේවය', en: 'Social Service' },
      { si: 'අධ්‍යාපනය', en: 'Education' },
    ],
    photo: monk1,
    programs: ['vinivida', 'viwarana'],
    videos: [
      {
        id: 'v1',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ධම්මපදය - පළමු පරිච්ඡේදය', en: 'Dhammapada - Chapter One' },
        programId: 'vinivida',
        date: '2024-01-15',
        duration: '45:30'
      },
      {
        id: 'v2',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'සූත්‍ර විග්‍රහය - මංගල සූත්‍රය', en: 'Sutta Analysis - Mangala Sutta' },
        programId: 'viwarana',
        date: '2024-01-10',
        duration: '52:15'
      },
      {
        id: 'v3',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ජීවිතය සහ ධර්මය', en: 'Life and Dharma' },
        programId: 'vinivida',
        date: '2024-01-05',
        duration: '38:00'
      },
    ],
  },
  {
    id: 'kiribathgoda-gnanananda',
    name: { si: 'කිරිබත්ගොඩ ඤාණානන්ද හිමි', en: 'Kiribathgoda Gnanananda Thero' },
    temple: { si: 'මහාමේඝ වන සේනාසනය', en: 'Mahamevnawa Monastery' },
    biography: {
      si: 'කිරිබත්ගොඩ ඤාණානන්ද හිමි මහාමේඝ වන සේනාසනයේ ආරම්භකයා වන අතර ලොව පුරා බුදු දහම ව්‍යාප්ත කිරීමේ මහා කාර්යයක නියැලී සිටින්නේය.',
      en: 'Kiribathgoda Gnanananda Thero is the founder of Mahamevnawa Monastery and is engaged in the great task of spreading Buddhism worldwide.'
    },
    tags: [
      { si: 'භාවනා', en: 'Meditation' },
      { si: 'ධර්ම දේශනා', en: 'Dharma Sermons' },
      { si: 'පිරිත්', en: 'Pirith' },
    ],
    photo: monk2,
    programs: ['samahitha', 'mekala-niwena-bana'],
    videos: [
      {
        id: 'v4',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'සතිපට්ඨාන භාවනාව', en: 'Satipatthana Meditation' },
        programId: 'samahitha',
        date: '2024-01-14',
        duration: '1:05:00'
      },
      {
        id: 'v5',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ආනාපානසති', en: 'Anapanasati' },
        programId: 'samahitha',
        date: '2024-01-08',
        duration: '48:30'
      },
    ],
  },
  {
    id: 'galigamuwe-gnanadeepa',
    name: { si: 'ගලිගමුවේ ඥානදීප හිමි', en: 'Galigamuwe Gnanadeepa Thero' },
    temple: { si: 'ශ්‍රී ලංකාරාමය', en: 'Sri Lankaramaya' },
    biography: {
      si: 'ගලිගමුවේ ඥානදීප හිමි ධර්ම දේශනා සහ බණ ග්‍රන්ථ රචනයේ පළපුරුදු හිමිකරුවෙකි. උන්වහන්සේගේ දේශනා සරලත්වය සහ ගැඹුරුකම යන දෙඅංශයෙන්ම සුවිශේෂී වේ.',
      en: 'Galigamuwe Gnanadeepa Thero is experienced in Dharma sermons and writing religious texts. His sermons are distinguished by both simplicity and depth.'
    },
    tags: [
      { si: 'ධර්ම දේශනා', en: 'Dharma Sermons' },
      { si: 'ග්‍රන්ථ රචනය', en: 'Writing' },
    ],
    photo: monk3,
    programs: ['awarjana'],
    videos: [
      {
        id: 'v6',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ධර්ම මෙනෙහි කිරීම', en: 'Dharma Reflection' },
        programId: 'awarjana',
        date: '2024-01-12',
        duration: '35:45'
      },
    ],
  },
  {
    id: 'waharaka-abhayarathanalankara',
    name: { si: 'වහරක අභයරතනාලංකාර හිමි', en: 'Waharaka Abhayarathanalankara Thero' },
    temple: { si: 'ශ්‍රී සමන්තකූට විහාරය', en: 'Sri Samanthakuta Viharaya' },
    biography: {
      si: 'වහරක අභයරතනාලංකාර හිමි ත්‍රිපිටක ධර්මය පිළිබඳ ගැඹුරු දැනුමක් ඇති හිමිකරුවෙකි. උන්වහන්සේ නිවන් මග පිළිබඳ පැහැදිලි ලෙස දේශනා කරන්නෙකි.',
      en: 'Waharaka Abhayarathanalankara Thero has deep knowledge of Tipitaka Dharma. He clearly explains the path to Nibbana.'
    },
    tags: [
      { si: 'ත්‍රිපිටකය', en: 'Tipitaka' },
      { si: 'නිවන් මග', en: 'Path to Nibbana' },
      { si: 'ධර්ම දේශනා', en: 'Dharma Sermons' },
    ],
    photo: monk4,
    programs: ['viwarana', 'mekala-niwena-bana'],
    videos: [
      {
        id: 'v7',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'පටිච්ච සමුප්පාදය', en: 'Dependent Origination' },
        programId: 'viwarana',
        date: '2024-01-11',
        duration: '1:12:00'
      },
      {
        id: 'v8',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'කරණීය මෙත්ත සූත්‍රය', en: 'Karaniya Metta Sutta' },
        programId: 'mekala-niwena-bana',
        date: '2024-01-06',
        duration: '42:30'
      },
    ],
  },
  {
    id: 'koralayagama-saranathissa',
    name: { si: 'කොරලයගම සරණතිස්ස හිමි', en: 'Koralayagama Saranathissa Thero' },
    temple: { si: 'ශ්‍රී සද්ධර්මෝදය පිරිවෙන', en: 'Sri Saddharmmodaya Pirivena' },
    biography: {
      si: 'කොරලයගම සරණතිස්ස හිමි පාලි භාෂාව සහ බුද්ධ දර්ශනය පිළිබඳ විශේෂඥයෙකි. උන්වහන්සේ බහුලව අධ්‍යාපනික කටයුතුවල නියැලී සිටී.',
      en: 'Koralayagama Saranathissa Thero is an expert in Pali language and Buddhist philosophy. He is extensively involved in educational activities.'
    },
    tags: [
      { si: 'අධ්‍යාපනය', en: 'Education' },
      { si: 'පාලි භාෂාව', en: 'Pali Language' },
      { si: 'බුද්ධ දර්ශනය', en: 'Buddhist Philosophy' },
    ],
    photo: monk5,
    programs: ['science-of-success'],
    videos: [
      {
        id: 'v9',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'සාර්ථකත්වයේ විද්‍යාව', en: 'Science of Success' },
        programId: 'science-of-success',
        date: '2024-01-09',
        duration: '55:00'
      },
    ],
  },
  {
    id: 'medagoda-abhayatissa',
    name: { si: 'මැඩගොඩ අභයතිස්ස හිමි', en: 'Medagoda Abhayatissa Thero' },
    temple: { si: 'ගංගාරාමය, කොළඹ', en: 'Gangaramaya, Colombo' },
    biography: {
      si: 'මැඩගොඩ අභයතිස්ස හිමි ජාත්‍යන්තර වශයෙන් ප්‍රසිද්ධ ධර්මකථිකයෙකි. උන්වහන්සේ විවිධ රටවල බුදු දහම ප්‍රචාරණය කර ඇත.',
      en: 'Medagoda Abhayatissa Thero is an internationally renowned Dharma speaker. He has propagated Buddhism in various countries.'
    },
    tags: [
      { si: 'ධර්ම දේශනා', en: 'Dharma Sermons' },
      { si: 'ජාත්‍යන්තර', en: 'International' },
    ],
    photo: monk6,
    programs: ['gamin-gamata-sadaham'],
    videos: [
      {
        id: 'v10',
        youtubeId: 'dQw4w9WgXcQ',
        title: { si: 'ග්‍රාමීය ධර්ම ප්‍රචාරණය', en: 'Village Dharma Outreach' },
        programId: 'gamin-gamata-sadaham',
        date: '2024-01-07',
        duration: '48:15'
      },
    ],
  },
];
