import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'si' | 'en';

interface Translations {
  [key: string]: {
    si: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { si: 'මුල් පිටුව', en: 'Home' },
  'nav.programs': { si: 'වැඩසටහන්', en: 'Programs' },
  'nav.todaySchedule': { si: 'අද කාලසටහන', en: "Today's Schedule" },
  'nav.liveBroadcast': { si: 'සජීවී විකාශය', en: 'Live Broadcast' },
  'nav.preachers': { si: 'දේශකයන්', en: 'Preachers' },
  'nav.monks': { si: 'ස්වාමීන් වහන්සේලා', en: 'Monks' },
  'nav.laySpeakers': { si: 'ධර්ම කථිකයන්', en: 'Lay Speakers' },
  'nav.requestDharmaDeshana': { si: 'ධර්ම දේශනා ඉල්ලීම', en: 'Request Dharma Deshana' },
  'nav.contact': { si: 'සම්බන්ධ වන්න', en: 'Contact' },
  'nav.schedule': { si: 'කාලසටහන', en: 'Schedule' },
  'nav.liveTV': { si: 'සජීවී විකාශය', en: 'Live TV' },
  'nav.mediaLibrary': { si: 'මාධ්‍ය පුස්තකාලය', en: 'Media Library' },
  'nav.about': { si: 'අප ගැන', en: 'About' },
  
  // Home Page
  'home.hero.title': { si: 'ජය ටීවී', en: 'Jaya TV' },
    'home.hero.subtitle': { si: 'හොදම දේ පමණයි', en: 'Only The Best.' },
  'home.hero.watchLive': { si: 'සජීවීව නරඹන්න', en: 'Watch Live' },
  'home.hero.viewSchedule': { si: 'කාලසටහන බලන්න', en: 'View Schedule' },
  'home.liveNow': { si: 'දැන් සජීවී', en: 'Live Now' },
  'home.featuredPrograms': { si: 'විශේෂ වැඩසටහන්', en: 'Featured Programs' },
  'home.featuredMonks': { si: 'ගෞරවනීය ස්වාමීන් වහන්සේලා', en: 'Venerable Monks' },
  'home.todaySchedule': { si: 'අද කාලසටහන', en: "Today's Schedule" },
  'home.viewAll': { si: 'සියල්ල බලන්න', en: 'View All' },
  
  // Programs
  'programs.title': { si: 'වැඩසටහන්', en: 'Programs' },
  'programs.subtitle': { si: 'ඔබගේ ආධ්‍යාත්මික ගමන සඳහා', en: 'For Your Spiritual Journey' },
  'programs.watchNow': { si: 'දැන් නරඹන්න', en: 'Watch Now' },
  'programs.learnMore': { si: 'තව දැනගන්න', en: 'Learn More' },
  
  // Monks
  'monks.title': { si: 'ස්වාමීන් වහන්සේලා', en: 'Venerable Monks' },
  'monks.subtitle': { si: 'ධර්ම දේශනා සහ මඟපෙන්වීම', en: 'Dharma Teachings & Guidance' },
  'monks.viewProfile': { si: 'පැතිකඩ බලන්න', en: 'View Profile' },
  'monks.allSermons': { si: 'සියලු ධර්ම දේශනා', en: 'All Sermons' },
  
  // Lay Speakers
  'laySpeakers.title': { si: 'ධර්ම කථිකයන්', en: 'Lay Speakers' },
  'laySpeakers.subtitle': { si: 'ධර්ම දේශනා සහ ජීවිත මඟපෙන්වීම', en: 'Dharma Teachings & Life Guidance' },
  'laySpeakers.viewProfile': { si: 'පැතිකඩ බලන්න', en: 'View Profile' },
  
  // Special Events
  'events.title': { si: 'විශේෂ වැඩසටහන', en: 'Special Event' },
  'events.countdown': { si: 'ආරම්භයට ඉතිරි', en: 'Starts In' },
  'events.liveNow': { si: 'දැන් සජීවී', en: 'Live Now' },
  'events.joinWhatsApp': { si: 'WhatsApp හරහා සම්බන්ධ වන්න', en: 'Join via WhatsApp' },
  'events.days': { si: 'දින', en: 'Days' },
  'events.hours': { si: 'පැය', en: 'Hours' },
  'events.minutes': { si: 'මිනි', en: 'Min' },
  'events.seconds': { si: 'තත්', en: 'Sec' },
  
  // Live TV
  'live.title': { si: 'සජීවී විකාශය', en: 'Live Broadcast' },
  'live.watchingNow': { si: 'දැන් නරඹන්නේ', en: 'Now Playing' },
  'live.schedule': { si: 'අද කාලසටහන', en: "Today's Schedule" },
  'live.share': { si: 'බෙදාගන්න', en: 'Share' },
  
  // Schedule
  'schedule.title': { si: 'කාලසටහන', en: 'Schedule' },
  'schedule.today': { si: 'අද', en: 'Today' },
  'schedule.weekly': { si: 'සතිය', en: 'Weekly' },
  
  // Media Library
  'media.title': { si: 'මාධ්‍ය පුස්තකාලය', en: 'Media Library' },
  'media.videos': { si: 'වීඩියෝ', en: 'Videos' },
  'media.audio': { si: 'ශ්‍රව්‍ය', en: 'Audio' },
  'media.documents': { si: 'ලේඛන', en: 'Documents' },
  
  // Footer
  'footer.quote': { 
    si: 'ඔබගේ ජීවිතය ජය ගැනීමට සහ ධර්මමාවබෝධය සදහා නිවැරදි මගක් පෙන්වන එකම බෞද්ධ නාළිකාව.', 
    en: 'The only Buddhist TV channel that shows you the right way to conquer your life and understand the dharma.' 
  },
  'footer.copyright': { si: '© 2026 ජය ටීවී. සියලුම හිමිකම් ඇවිරිණි.┃Designed', en: '© 2026 Jaya TV. All rights reserved.┃Designed' },
  'footer.designedBy': { si: 'By', en: 'By' },
  'footer.contact': { si: 'සම්බන්ධතා', en: 'Contact' },
  
  // Search
  'search.placeholder': { si: 'සොයන්න...', en: 'Search...' },
  'search.monks': { si: 'ස්වාමීන් වහන්සේලා', en: 'Monks' },
  'search.programs': { si: 'වැඩසටහන්', en: 'Programs' },
  'search.sermons': { si: 'ධර්ම දේශනා', en: 'Sermons' },
  
  // Common
  'common.readMore': { si: 'තව කියවන්න', en: 'Read More' },
  'common.close': { si: 'වසන්න', en: 'Close' },
  'common.loading': { si: 'පූරණය වේ...', en: 'Loading...' },
  'common.required': { si: 'අනිවාර්‍යයි', en: 'Required' },
  
  // Dharma Deshana Request Page
  'deshana.pageTitle': { si: 'දර්ම දේශනා ඉල්ලීම', en: 'Request Dharma Deshana' },
  'deshana.pageSubtitle': { 
    si: 'දර්ම දේශනාවක් විකාශනය සඳහා ඉල්ලුම් කරන්න', 
    en: 'Request a Dharma sermon for broadcasting' 
  },
  'deshana.selectProgram': { si: 'වැඩසටහන තෝරන්න', en: 'Select Program' },
  'deshana.selectProgramPlaceholder': { si: 'වැඩසටහනක් තෝරන්න...', en: 'Choose a program...' },
  'deshana.suggestedPreachers': { si: 'යෝජිත දේශකයින්', en: 'Suggested Preachers' },
  'deshana.noPreachers': { si: 'වැඩසටහන තෝරාගත් පසු දේශකයින් පෙන්වනු ලැබේ', en: 'Preachers will appear after selecting a program' },
  'deshana.requestedDate': { si: 'විකාශනය කිරීමට අවශ්‍ය දිනය', en: 'Preferred Broadcast Date' },
  'deshana.selectDate': { si: 'දිනයක් තෝරන්න', en: 'Pick a date' },
  'deshana.yourName': { si: 'ඔබගේ නම', en: 'Your Name' },
  'deshana.namePlaceholder': { si: 'ඔබගේ සම්පූර්ණ නම', en: 'Your full name' },
  'deshana.phoneNumber': { si: 'දුරකථන අංකය', en: 'Phone Number' },
  'deshana.whatsappNumber': { si: 'WhatsApp අංකය', en: 'WhatsApp Number' },
  'deshana.optional': { si: 'විකල්ප', en: 'Optional' },
  'deshana.submitButton': { si: 'ඉල්ලීම යොමු කරන්න', en: 'Submit Request' },
  'deshana.submitting': { si: 'යොමු කරමින්...', en: 'Submitting...' },
  'deshana.successTitle': { 
    si: 'දර්ම දේශනා ඉල්ලීම සාර්ථකව ලැබුණි.', 
    en: 'Your Dharma Deshana request has been successfully received.' 
  },
  'deshana.successMessage': { 
    si: 'වැඩිදුර තොරතුරු සඳහා අපගේ නියෝජිතයෙක් ඉක්මනින් ඔබව සම්බන්ධ කරගනු ඇත.', 
    en: 'Our representative will contact you shortly for further details.' 
  },
  'deshana.whatsappContact': { si: 'WhatsApp හරහා සම්බන්ධ වන්න', en: 'Contact via WhatsApp' },
  'deshana.newRequest': { si: 'නව ඉල්ලීමක් කරන්න', en: 'Make Another Request' },
  'deshana.errorTitle': { si: 'දෝෂයකි', en: 'Error' },
  'deshana.errorMessage': { si: 'කරුණාකර සියලුම අනිවාර්‍ය ක්ෂේත්‍ර පුරවන්න', en: 'Please fill in all required fields' },
  'deshana.message': { si: 'පණිවිඩය / විශේෂ සටහන්', en: 'Message / Special Notes' },
  'deshana.messagePlaceholder': { si: 'අමතර තොරතුරු හෝ විශේෂ ඉල්ලීම් මෙහි ලියන්න...', en: 'Add any additional information or special requests here...' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('si');

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    isRTL: false, // Sinhala is LTR
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
