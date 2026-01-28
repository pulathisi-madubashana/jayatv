import vinividaImg from '@/assets/programs/vinivida.jpg';
import scienceOfSuccessImg from '@/assets/programs/science-of-success.jpg';
import samahithaImg from '@/assets/programs/samahitha.jpg';
import gaminGamataImg from '@/assets/programs/gamin-gamata-sadaham.jpg';
import viwaranaImg from '@/assets/programs/viwarana.jpg';
import awarjanaImg from '@/assets/programs/awarjana.jpg';
import mekalaNiwenaImg from '@/assets/programs/mekala-niwena-bana.jpg';
import sewaNiyukthiImg from '@/assets/programs/sewa-niyukthi.jpg';
import defaultProgramImg from '@/assets/programs/default-program.jpg';

export interface Program {
  id: string;
  name: { si: string; en: string };
  description: { si: string; en: string };
  fullDescription?: { si: string; en: string };
  logo?: string;
  category: string;
  schedule?: string;
  monks?: string[];
}

export const defaultProgramImage = defaultProgramImg;

export const programsData: Program[] = [
  {
    id: 'vinivida',
    name: { si: 'විනිවිද', en: 'Vinivida' },
    description: { 
      si: 'ධර්ම සාකච්ඡා සහ විග්‍රහ වැඩසටහන', 
      en: 'Dharma discussion and analysis program' 
    },
    fullDescription: {
      si: 'විනිවිද යනු බුද්ධ ධර්මය පිළිබඳ ගැඹුරු සාකච්ඡා සහ විග්‍රහයන් ඇතුළත් වූ ජය ටීවී හි ප්‍රමුඛ වැඩසටහනකි. මෙහිදී විද්වත් භික්ෂූන් වහන්සේලා සහ ගිහි පුද්ගලයින් එක්ව ධර්මය පිළිබඳ විවිධ මාතෘකා සාකච්ඡා කරනු ලැබේ.',
      en: 'Vinivida is a flagship program of Jaya TV featuring in-depth discussions and analyses of Buddhist teachings. Scholarly monks and laypeople come together to discuss various topics related to the Dharma.'
    },
    logo: vinividaImg,
    category: 'Discussion',
    schedule: 'Daily 8:00 AM',
  },
  {
    id: 'science-of-success',
    name: { si: 'Science of Success', en: 'Science of Success' },
    description: { 
      si: 'ජීවිතය සාර්ථක කර ගැනීමේ බුද්ධ ධර්ම මාර්ගය', 
      en: 'Buddhist path to life success' 
    },
    fullDescription: {
      si: 'Science of Success වැඩසටහන මගින් බුද්ධ ධර්මය සහ නූතන විද්‍යාව අතර සම්බන්ධතාවය ගවේෂණය කරමින් ජීවිතය සාර්ථක කර ගැනීමට අවශ්‍ය මාර්ගෝපදේශ ලබා දෙනු ලැබේ.',
      en: 'The Science of Success program explores the connection between Buddhist teachings and modern science, providing guidance for achieving success in life.'
    },
    logo: scienceOfSuccessImg,
    category: 'Motivational',
    schedule: 'Daily 6:00 PM',
  },
  {
    id: 'samahitha',
    name: { si: 'සමාහිත', en: 'Samahitha' },
    description: { 
      si: 'භාවනා උපදේශ වැඩසටහන', 
      en: 'Meditation guidance program' 
    },
    fullDescription: {
      si: 'සමාහිත යනු භාවනා අභ්‍යාසය පිළිබඳ ප්‍රායෝගික මාර්ගෝපදේශ ලබා දෙන වැඩසටහනකි. මෙහිදී විවිධ භාවනා ක්‍රම සහ ඒවායේ ප්‍රතිලාභ පිළිබඳ සවිස්තරාත්මකව විස්තර කෙරේ.',
      en: 'Samahitha is a program that provides practical guidance on meditation practice. It explains various meditation techniques and their benefits in detail.'
    },
    logo: samahithaImg,
    category: 'Meditation',
    schedule: 'Daily 10:00 AM',
  },
  {
    id: 'gamin-gamata-sadaham',
    name: { si: 'ගමින් ගමට සදහම්', en: 'Gamin Gamata Sadaham' },
    description: { 
      si: 'ග්‍රාමීය ධර්ම ප්‍රචාරණ වැඩසටහන', 
      en: 'Village-to-village Dharma outreach program' 
    },
    fullDescription: {
      si: 'ගමින් ගමට සදහම් වැඩසටහන මගින් ශ්‍රී ලංකාවේ විවිධ ගම්මාන වෙත ගොස් ධර්ම දේශනා සහ ධර්ම සාකච්ඡා පවත්වනු ලැබේ. මෙය ග්‍රාමීය ජනතාව වෙත බුදු දහම ගෙන යාමේ සුවිශේෂී උත්සාහයකි.',
      en: 'Gamin Gamata Sadaham travels to various villages in Sri Lanka to conduct Dharma sermons and discussions. This is a special effort to bring Buddhism to rural communities.'
    },
    logo: gaminGamataImg,
    category: 'Outreach',
    schedule: 'Saturdays 2:00 PM',
  },
  {
    id: 'viwarana',
    name: { si: 'විවරණ', en: 'Viwarana' },
    description: { 
      si: 'සූත්‍ර විග්‍රහ වැඩසටහන', 
      en: 'Sutta analysis program' 
    },
    fullDescription: {
      si: 'විවරණ වැඩසටහන මගින් ත්‍රිපිටකයේ සූත්‍ර ග්‍රන්ථ පිළිබඳ ගැඹුරු විග්‍රහයන් ඉදිරිපත් කෙරේ. මෙහිදී සූත්‍රවල අර්ථය, පසුබිම සහ ප්‍රායෝගික යෙදීම් පිළිබඳ සවිස්තරාත්මකව සාකච්ඡා කෙරේ.',
      en: 'Viwarana offers in-depth analyses of suttas from the Tipitaka. It discusses the meaning, context, and practical applications of suttas in detail.'
    },
    logo: viwaranaImg,
    category: 'Educational',
    schedule: 'Daily 4:00 PM',
  },
  {
    id: 'awarjana',
    name: { si: 'ආවර්ජනා', en: 'Awarjana' },
    description: { 
      si: 'ධර්ම මෙනෙහි කිරීමේ වැඩසටහන', 
      en: 'Dharma reflection program' 
    },
    fullDescription: {
      si: 'ආවර්ජනා වැඩසටහන මගින් එදිනෙදා ජීවිතයට අදාළ ධර්ම මාතෘකා පිළිබඳ මෙනෙහි කිරීමට අවකාශ සලසා දෙයි. මෙය සාමකාමී මනසක් වර්ධනය කිරීමට උපකාරී වේ.',
      en: 'Awarjana provides an opportunity to reflect on Dharma topics relevant to daily life. It helps in developing a peaceful mind.'
    },
    logo: awarjanaImg,
    category: 'Reflection',
    schedule: 'Daily 12:00 PM',
  },
  {
    id: 'mekala-niwena-bana',
    name: { si: 'මෙකල නිවෙන බණ', en: 'Mekala Niwena Bana' },
    description: { 
      si: 'සාම්ප්‍රදායික ධර්ම දේශනා', 
      en: 'Traditional Dharma sermons' 
    },
    fullDescription: {
      si: 'මෙකල නිවෙන බණ වැඩසටහන මගින් සාම්ප්‍රදායික ශ්‍රී ලාංකික බණ දේශනා විකාශය කෙරේ. මෙහිදී ප්‍රසිද්ධ ධර්මකථික හිමිවරුන්ගේ දේශනා ඇතුළත් වේ.',
      en: 'Mekala Niwena Bana broadcasts traditional Sri Lankan Dharma sermons. It includes sermons by renowned Dharma speakers.'
    },
    logo: mekalaNiwenaImg,
    category: 'Sermons',
    schedule: 'Daily 6:00 AM',
  },
  {
    id: 'sewa-niyukthi',
    name: { si: 'සේවා නියුක්ති භාවනා වැඩසටහන', en: 'Sewa Niyukthi' },
    description: { 
      si: 'රාජ්‍ය සේවක භාවනා වැඩසටහන', 
      en: 'Government employee meditation program' 
    },
    fullDescription: {
      si: 'සේවා නියුක්ති භාවනා වැඩසටහන රාජ්‍ය සේවකයින් සඳහා විශේෂයෙන් සකස් කරන ලද භාවනා පුහුණු වැඩසටහනකි. මෙමගින් වෘත්තීය ආතතිය අවම කර ගැනීමට සහ මානසික සෞඛ්‍යය වැඩිදියුණු කිරීමට උපකාරී වේ.',
      en: 'Sewa Niyukthi is a meditation training program specially designed for government employees. It helps in reducing work stress and improving mental health.'
    },
    logo: sewaNiyukthiImg,
    category: 'Meditation',
    schedule: 'Fridays 7:00 PM',
  },
];
