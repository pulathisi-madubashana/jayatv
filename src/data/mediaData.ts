export type MediaType = 'video' | 'audio' | 'photo' | 'pdf';
export type VideoSource = 'youtube' | 'download';

export interface MediaItem {
  id: string;
  title: { si: string; en: string };
  description?: { si: string; en: string };
  type: MediaType;
  thumbnail?: string;
  duration?: string;
  date: string; // ISO date string
  programId?: string;
  monkId?: string;
  url?: string;
  downloadable: boolean;
  // Video-specific fields
  videoSource?: VideoSource;
  youtubeId?: string; // YouTube video ID for embedding
  downloadUrl?: string; // Direct download URL for downloadable videos
  // Document-specific fields  
  driveDownloadUrl?: string; // Google Drive direct download link
}

// Helper to extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper to get YouTube thumbnail
export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

export const mediaData: MediaItem[] = [
  // YouTube Videos
  {
    id: 'v1',
    title: { si: 'සතිපට්ඨාන භාවනාව', en: 'Satipatthana Meditation' },
    description: { si: 'සතිපට්ඨාන භාවනා ක්‍රමය පිළිබඳ සවිස්තරාත්මක දේශනාව', en: 'Detailed discourse on Satipatthana meditation technique' },
    type: 'video',
    videoSource: 'youtube',
    youtubeId: 'dQw4w9WgXcQ', // Example YouTube ID
    duration: '45:30',
    date: '2024-01-15',
    programId: 'samahitha',
    monkId: 'kiribathgoda-gnanananda',
    downloadable: false,
  },
  {
    id: 'v2',
    title: { si: 'කරණීය මෙත්ත සූත්‍රය', en: 'Karaniya Metta Sutta' },
    description: { si: 'මෛත්‍රී භාවනාව පිළිබඳ සූත්‍ර විග්‍රහය', en: 'Sutta analysis on loving-kindness meditation' },
    type: 'video',
    videoSource: 'youtube',
    youtubeId: 'jNQXAC9IVRw', // Example YouTube ID
    duration: '32:15',
    date: '2024-01-14',
    programId: 'viwarana',
    monkId: 'waharaka-abhayarathanalankara',
    downloadable: false,
  },
  {
    id: 'v3',
    title: { si: 'ධම්මපදය', en: 'Dhammapada' },
    description: { si: 'ධම්මපද ගාථා විග්‍රහය', en: 'Analysis of Dhammapada verses' },
    type: 'video',
    videoSource: 'youtube',
    youtubeId: '9bZkp7q19f0', // Example YouTube ID
    duration: '58:00',
    date: '2024-01-13',
    programId: 'vinivida',
    monkId: 'athuraliye-rathana',
    downloadable: false,
  },
  // Downloadable Video
  {
    id: 'v4',
    title: { si: 'අභිධර්මය හැඳින්වීම', en: 'Introduction to Abhidhamma' },
    description: { si: 'අභිධර්ම පිටකය පිළිබඳ මූලික හැඳින්වීම', en: 'Basic introduction to Abhidhamma Pitaka' },
    type: 'video',
    videoSource: 'download',
    downloadUrl: 'https://example.com/videos/abhidhamma-intro.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800',
    duration: '1:12:00',
    date: '2024-01-12',
    programId: 'viwarana',
    downloadable: true,
  },
  {
    id: 'v5',
    title: { si: 'මංගල සූත්‍රය', en: 'Mangala Sutta' },
    description: { si: 'උතුම් මංගල පිළිබඳ දේශනාව', en: 'Discourse on the highest blessings' },
    type: 'video',
    videoSource: 'youtube',
    youtubeId: 'L_jWHffIx5E', // Example
    duration: '28:45',
    date: '2024-01-11',
    programId: 'mekala-niwena-bana',
    monkId: 'galigamuwe-gnanadeepa',
    downloadable: false,
  },
  {
    id: 'v6',
    title: { si: 'පටිච්ච සමුප්පාදය', en: 'Dependent Origination' },
    description: { si: 'පටිච්ච සමුප්පාදය පිළිබඳ ගැඹුරු විග්‍රහය', en: 'Deep analysis of dependent origination' },
    type: 'video',
    videoSource: 'youtube',
    youtubeId: 'kJQP7kiw5Fk', // Example
    duration: '52:30',
    date: '2024-01-10',
    programId: 'vinivida',
    monkId: 'waharaka-abhayarathanalankara',
    downloadable: false,
  },

  // Audio
  {
    id: 'a1',
    title: { si: 'සෙත් පිරිත්', en: 'Seth Pirith' },
    description: { si: 'සුරැකුම සඳහා සෙත් පිරිත් දේශනාව', en: 'Seth Pirith chanting for protection' },
    type: 'audio',
    duration: '1:30:00',
    date: '2024-01-15',
    downloadUrl: 'https://example.com/audio/seth-pirith.mp3',
    downloadable: true,
  },
  {
    id: 'a2',
    title: { si: 'මහ පිරිත්', en: 'Maha Pirith' },
    description: { si: 'පූර්ණ මහ පිරිත් දේශනාව', en: 'Complete Maha Pirith chanting' },
    type: 'audio',
    duration: '2:45:00',
    date: '2024-01-14',
    downloadUrl: 'https://example.com/audio/maha-pirith.mp3',
    downloadable: true,
  },
  {
    id: 'a3',
    title: { si: 'රතන සූත්‍රය', en: 'Ratana Sutta' },
    description: { si: 'රතන සූත්‍ර පිරිත් දේශනාව', en: 'Ratana Sutta pirith chanting' },
    type: 'audio',
    duration: '12:30',
    date: '2024-01-13',
    downloadUrl: 'https://example.com/audio/ratana-sutta.mp3',
    downloadable: true,
  },
  {
    id: 'a4',
    title: { si: 'මෛත්‍රී භාවනාව', en: 'Metta Meditation' },
    description: { si: 'මෛත්‍රී භාවනා මාර්ගෝපදේශ', en: 'Loving-kindness meditation guidance' },
    type: 'audio',
    duration: '35:00',
    date: '2024-01-12',
    programId: 'samahitha',
    monkId: 'kiribathgoda-gnanananda',
    downloadUrl: 'https://example.com/audio/metta-meditation.mp3',
    downloadable: true,
  },
  {
    id: 'a5',
    title: { si: 'ආනාපානසති භාවනාව', en: 'Anapanasati Meditation' },
    description: { si: 'ශ්වාසය මත පදනම් වූ භාවනාව', en: 'Breath-based meditation practice' },
    type: 'audio',
    duration: '40:00',
    date: '2024-01-11',
    programId: 'samahitha',
    downloadUrl: 'https://example.com/audio/anapanasati.mp3',
    downloadable: true,
  },

  // Photos
  {
    id: 'p1',
    title: { si: 'වෙසක් පොහොය දිනය', en: 'Vesak Poya Day' },
    description: { si: 'ජය ටීවී වෙසක් විශේෂ වැඩසටහන', en: 'Jaya TV Vesak special program' },
    type: 'photo',
    date: '2024-05-23',
    thumbnail: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400',
    downloadable: true,
  },
  {
    id: 'p2',
    title: { si: 'ධර්ම සාකච්ඡාව', en: 'Dharma Discussion' },
    description: { si: 'විනිවිද වැඩසටහන පටිගත කිරීම', en: 'Vinivida program recording' },
    type: 'photo',
    date: '2024-01-10',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    programId: 'vinivida',
    downloadable: true,
  },
  {
    id: 'p3',
    title: { si: 'භාවනා වැඩසටහන', en: 'Meditation Session' },
    description: { si: 'සමාහිත භාවනා සැසිය', en: 'Samahitha meditation session' },
    type: 'photo',
    date: '2024-01-08',
    thumbnail: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400',
    programId: 'samahitha',
    downloadable: true,
  },
  {
    id: 'p4',
    title: { si: 'පිරිත් දේශනාව', en: 'Pirith Ceremony' },
    description: { si: 'සෙත් පිරිත් දේශනා අවස්ථාව', en: 'Seth Pirith chanting ceremony' },
    type: 'photo',
    date: '2024-01-05',
    thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
    downloadable: true,
  },
  {
    id: 'p5',
    title: { si: 'බෝධි පූජාව', en: 'Bodhi Pooja' },
    description: { si: 'ජය ටීවී බෝධි පූජා වැඩසටහන', en: 'Jaya TV Bodhi Pooja program' },
    type: 'photo',
    date: '2024-01-03',
    thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
    downloadable: true,
  },
  {
    id: 'p6',
    title: { si: 'ගමින් ගමට', en: 'Village Outreach' },
    description: { si: 'ගමින් ගමට සදහම් ග්‍රාමීය වැඩසටහන', en: 'Gamin Gamata Sadaham village program' },
    type: 'photo',
    date: '2024-01-01',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    programId: 'gamin-gamata-sadaham',
    downloadable: true,
  },

  // PDFs / Documents with Google Drive download links
  {
    id: 'd1',
    title: { si: 'ධම්මපද අර්ථකථාව', en: 'Dhammapada Commentary' },
    description: { si: 'ධම්මපද ගාථා පිළිබඳ විස්තරාත්මක අර්ථකථාව', en: 'Detailed commentary on Dhammapada verses' },
    type: 'pdf',
    date: '2024-01-10',
    driveDownloadUrl: 'https://drive.google.com/uc?export=download&id=EXAMPLE_FILE_ID_1',
    downloadable: true,
  },
  {
    id: 'd2',
    title: { si: 'භාවනා අත්පොත', en: 'Meditation Handbook' },
    description: { si: 'මූලික භාවනා ක්‍රම පිළිබඳ මාර්ගෝපදේශ', en: 'Guide to basic meditation techniques' },
    type: 'pdf',
    date: '2024-01-05',
    programId: 'samahitha',
    driveDownloadUrl: 'https://drive.google.com/uc?export=download&id=EXAMPLE_FILE_ID_2',
    downloadable: true,
  },
  {
    id: 'd3',
    title: { si: 'පිරිත් පොත', en: 'Pirith Book' },
    description: { si: 'දෛනික පිරිත් සජ්ඣායනා පොත', en: 'Daily pirith chanting book' },
    type: 'pdf',
    date: '2024-01-01',
    driveDownloadUrl: 'https://drive.google.com/uc?export=download&id=EXAMPLE_FILE_ID_3',
    downloadable: true,
  },
];
