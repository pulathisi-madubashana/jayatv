import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, Tv, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'monk' | 'program' | 'sermon';
  title: { si: string; en: string };
  subtitle?: { si: string; en: string };
}

const mockResults: SearchResult[] = [
  { type: 'monk', title: { si: 'අතුරලියේ රතන හිමි', en: 'Athuraliye Rathana Thero' }, subtitle: { si: 'ධර්ම දේශක', en: 'Dharma Teacher' } },
  { type: 'program', title: { si: 'විනිවිද', en: 'Vinivida' }, subtitle: { si: 'ධර්ම සාකච්ඡා', en: 'Dharma Discussion' } },
  { type: 'sermon', title: { si: 'සතිපට්ඨාන සූත්‍රය', en: 'Satipatthana Sutta' }, subtitle: { si: 'භාවනා උපදේශ', en: 'Meditation Guidance' } },
  { type: 'program', title: { si: 'සමාහිත', en: 'Samahitha' }, subtitle: { si: 'භාවනා වැඩසටහන', en: 'Meditation Program' } },
];

export default function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockResults.filter(
        (r) =>
          r.title.si.toLowerCase().includes(query.toLowerCase()) ||
          r.title.en.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'monk':
        return User;
      case 'program':
        return Tv;
      case 'sermon':
        return BookOpen;
      default:
        return Search;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monk':
        return t('search.monks');
      case 'program':
        return t('search.programs');
      case 'sermon':
        return t('search.sermons');
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto px-4 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center px-6 py-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground mr-3" />
                <Input
                  autoFocus
                  placeholder={t('search.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`flex-1 border-0 shadow-none focus-visible:ring-0 text-lg ${language === 'si' ? 'font-sinhala' : ''}`}
                />
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = getIcon(result.type);
                      return (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="w-full flex items-center px-6 py-3 hover:bg-secondary transition-colors text-left"
                          onClick={() => {
                            // Handle navigation
                            onClose();
                          }}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                              {result.title[language]}
                            </p>
                            {result.subtitle && (
                              <p className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {result.subtitle[language]}
                              </p>
                            )}
                          </div>
                          <span className={`text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {getTypeLabel(result.type)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : query.length > 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'ප්‍රතිඵල හමු නොවීය' : 'No results found'}
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'ස්වාමීන් වහන්සේලා, වැඩසටහන්, හෝ ධර්ම දේශනා සොයන්න' : 'Search for monks, programs, or sermons'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
