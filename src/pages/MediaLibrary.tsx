import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Headphones, FileText, Search, Image, X, ChevronLeft, ChevronRight, Filter, LayoutGrid, Play, Download, Calendar, Clock, ZoomIn, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMediaItems, MediaType as DBMediaType, getYouTubeThumbnail } from '@/hooks/useMediaData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayerModal from '@/components/media/VideoPlayerModal';

type DisplayMediaType = 'video' | 'audio' | 'photo' | 'pdf';

const typeIcons: Record<DisplayMediaType, typeof Video> = {
  video: Video,
  audio: Headphones,
  photo: Image,
  pdf: FileText,
};

const typeLabels: Record<'all' | DisplayMediaType, { si: string; en: string }> = {
  all: { si: 'සියල්ල', en: 'All' },
  video: { si: 'වීඩියෝ', en: 'Videos' },
  audio: { si: 'ශ්‍රව්‍ය', en: 'Audio' },
  photo: { si: 'ඡායාරූප', en: 'Photos' },
  pdf: { si: 'ලේඛන', en: 'Documents' },
};

const typeBadgeColors: Record<DisplayMediaType, string> = {
  video: 'bg-red-600',
  audio: 'bg-amber-600',
  photo: 'bg-emerald-600',
  pdf: 'bg-blue-600',
};

// Map database types to display types
const mapDbToDisplayType = (dbType: DBMediaType): DisplayMediaType => {
  switch (dbType) {
    case 'video': return 'video';
    case 'audio': return 'audio';
    case 'image': return 'photo';
    case 'document': return 'pdf';
    default: return 'video';
  }
};

const mapDisplayToDbType = (displayType: DisplayMediaType): DBMediaType => {
  switch (displayType) {
    case 'video': return 'video';
    case 'audio': return 'audio';
    case 'photo': return 'image';
    case 'pdf': return 'document';
    default: return 'video';
  }
};

export default function MediaLibrary() {
  const { t, language } = useLanguage();
  const [activeType, setActiveType] = useState<DisplayMediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [preacherFilter, setPreacherFilter] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoModal, setVideoModal] = useState<{ youtubeId: string; title: string } | null>(null);

  // Fetch media items from database
  const { data: mediaItems = [], isLoading } = useMediaItems();

  // Fetch programs for filter
  const { data: programs = [] } = useQuery({
    queryKey: ['programs-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_sinhala, name_english')
        .eq('is_active', true)
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  // Fetch profiles for filter
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name_sinhala, name_english, profile_type')
        .order('name_english');
      if (error) throw error;
      return data;
    },
  });

  const filteredMedia = useMemo(() => {
    return mediaItems.filter(item => {
      const displayType = mapDbToDisplayType(item.media_type);
      
      if (activeType !== 'all' && displayType !== activeType) return false;
      if (programFilter !== 'all' && item.program_id !== programFilter) return false;
      if (preacherFilter !== 'all') {
        const hasPreacher = item.preachers?.some(p => p.profile_id === preacherFilter);
        if (!hasPreacher) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title_sinhala.toLowerCase().includes(query) || 
                          (item.title_english?.toLowerCase().includes(query) ?? false);
        const programMatch = item.program && (
          item.program.name_sinhala.includes(query) || 
          item.program.name_english.toLowerCase().includes(query)
        );
        const preacherMatch = item.preachers?.some(p => 
          p.profile.name_sinhala.includes(query) || 
          p.profile.name_english.toLowerCase().includes(query)
        );
        return titleMatch || programMatch || preacherMatch;
      }
      return true;
    });
  }, [mediaItems, activeType, searchQuery, programFilter, preacherFilter]);

  const photoItems = filteredMedia.filter(m => m.media_type === 'image');

  // Get the best image URL for lightbox - prefer file_url for full quality, fallback to thumbnail
  const getImageUrl = (item: typeof mediaItems[0]) => {
    return item.file_url || item.thumbnail_url || null;
  };

  const openLightbox = (item: typeof mediaItems[0]) => {
    const photoIndex = photoItems.findIndex(p => p.id === item.id);
    if (photoIndex >= 0) {
      setLightboxIndex(photoIndex);
      setLightboxImage(getImageUrl(photoItems[photoIndex]));
    }
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % photoItems.length
      : (lightboxIndex - 1 + photoItems.length) % photoItems.length;
    setLightboxIndex(newIndex);
    setLightboxImage(getImageUrl(photoItems[newIndex]));
  };

  // Count items per type
  const typeCounts = useMemo(() => ({
    all: mediaItems.length,
    video: mediaItems.filter(m => m.media_type === 'video').length,
    audio: mediaItems.filter(m => m.media_type === 'audio').length,
    photo: mediaItems.filter(m => m.media_type === 'image').length,
    pdf: mediaItems.filter(m => m.media_type === 'document').length,
  }), [mediaItems]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Colombo'
    });
  };

  const handleCardClick = (item: typeof mediaItems[0]) => {
    // External/Drive-based items should NOT open players - they're download-only
    const isExternalLink = item.download_enabled && item.download_url && !item.file_url && !item.youtube_id;
    
    if (isExternalLink) {
      // Don't do anything on card click for external links - they use download button
      return;
    }
    
    if (item.media_type === 'image') {
      openLightbox(item);
    } else if (item.media_type === 'video' && item.is_youtube && item.youtube_id) {
      setVideoModal({ youtubeId: item.youtube_id, title: item.title_english || item.title_sinhala });
    }
  };

  const handleDownload = (e: React.MouseEvent, item: typeof mediaItems[0]) => {
    e.stopPropagation();
    const downloadUrl = item.download_url || item.file_url;
    if (downloadUrl) {
      // For Google Drive links, open in new tab to trigger download
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getThumbnail = (item: typeof mediaItems[0]) => {
    if (item.thumbnail_url) return item.thumbnail_url;
    // For images, use file_url as thumbnail if no separate thumbnail
    if (item.media_type === 'image' && item.file_url) return item.file_url;
    if (item.is_youtube && item.youtube_id) return getYouTubeThumbnail(item.youtube_id);
    return null;
  };

  // Check if item is external/drive-based (no file_url, has download_url)
  const isExternalItem = (item: typeof mediaItems[0]) => {
    return item.download_enabled && item.download_url && !item.file_url && !item.youtube_id;
  };

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'මාධ්‍ය පුස්තකාලය - ජය ටීවී' : 'Media Library - Jaya TV'}</title>
        <meta name="description" content={language === 'si' ? 'ජය ටීවී මාධ්‍ය පුස්තකාලය - වීඩියෝ, ශ්‍රව්‍ය, ඡායාරූප සහ ලේඛන' : 'Jaya TV Media Library - Videos, Audio, Photos and Documents'} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <LayoutGrid className="h-4 w-4" />
                <span className={`text-sm font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'මාධ්‍ය එකතුව' : 'Media Collection'}
                </span>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold text-foreground mb-3 ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('media.title')}
              </h1>
              <p className={`text-muted-foreground max-w-2xl mx-auto ${language === 'si' ? 'font-sinhala' : ''}`}>
                {language === 'si' 
                  ? 'ධර්ම දේශනා, පිරිත්, භාවනා සහ බෞද්ධ අධ්‍යාපනික ද්‍රව්‍ය පරිශීලනය කරන්න'
                  : 'Browse Dharma sermons, pirith, meditation guides and Buddhist educational materials'}
              </p>
            </motion.div>

            {/* Tab Filters */}
            <div className="flex justify-center mb-6 overflow-x-auto pb-2">
              <div className="inline-flex bg-card border border-border rounded-xl p-1.5 gap-1 shadow-sm">
                {(['all', 'video', 'audio', 'photo', 'pdf'] as const).map((type) => {
                  const Icon = type === 'all' ? LayoutGrid : typeIcons[type];
                  const isActive = activeType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      } ${language === 'si' ? 'font-sinhala' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{typeLabels[type][language]}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-secondary'}`}>
                        {typeCounts[type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Filters */}
            <div className="max-w-4xl mx-auto mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder={language === 'si' ? 'මාධ්‍ය සොයන්න...' : 'Search media...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 h-12 text-base bg-card border-border ${language === 'si' ? 'font-sinhala' : ''}`}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className={`w-[200px] h-10 bg-card ${language === 'si' ? 'font-sinhala' : ''}`}>
                    <SelectValue placeholder={language === 'si' ? 'වැඩසටහන තෝරන්න' : 'Select Program'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'සියලු වැඩසටහන්' : 'All Programs'}
                    </SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id} className={language === 'si' ? 'font-sinhala' : ''}>
                        {language === 'si' ? p.name_sinhala : p.name_english}
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'වෙනත්' : 'Other'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={preacherFilter} onValueChange={setPreacherFilter}>
                  <SelectTrigger className={`w-[200px] h-10 bg-card ${language === 'si' ? 'font-sinhala' : ''}`}>
                    <SelectValue placeholder={language === 'si' ? 'දේශකයා තෝරන්න' : 'Select Preacher'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'සියලු දේශකයින්' : 'All Preachers'}
                    </SelectItem>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id} className={language === 'si' ? 'font-sinhala' : ''}>
                        {language === 'si' ? p.name_sinhala : p.name_english}
                      </SelectItem>
                    ))}
                    <SelectItem value="other" className={language === 'si' ? 'font-sinhala' : ''}>
                      {language === 'si' ? 'වෙනත්' : 'Other'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {(programFilter !== 'all' || preacherFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setProgramFilter('all');
                      setPreacherFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    {language === 'si' ? 'ඉවත් කරන්න' : 'Clear filters'}
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mb-6">
              <p className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {language === 'si'
                  ? `මාධ්‍ය අයිතම ${filteredMedia.length}ක් සොයාගන්නා ලදී`
                  : `Found ${filteredMedia.length} media items`}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{language === 'si' ? 'පූරණය වේ...' : 'Loading...'}</p>
              </div>
            )}

            {/* Media Grid */}
            {!isLoading && (
              <motion.div
                key={activeType + programFilter + preacherFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredMedia.map((item, idx) => {
                  const displayType = mapDbToDisplayType(item.media_type);
                  const Icon = typeIcons[displayType];
                  const thumbnail = getThumbnail(item);
                  const isExternal = isExternalItem(item);
                  const isClickable = !isExternal && (item.media_type === 'image' || (item.media_type === 'video' && item.is_youtube && item.youtube_id));

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`bg-card rounded-xl border border-border overflow-hidden card-hover group ${isClickable ? 'cursor-pointer' : ''}`}
                      onClick={() => handleCardClick(item)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-secondary flex items-center justify-center relative overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={language === 'si' ? item.title_sinhala : (item.title_english || item.title_sinhala)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Icon className="h-16 w-16 mb-2 opacity-50" />
                            <span className="text-sm">{typeLabels[displayType][language]}</span>
                          </div>
                        )}

                        {/* Play overlay for videos */}
                        {item.media_type === 'video' && item.is_youtube && item.youtube_id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="h-8 w-8 text-primary-foreground ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Zoom overlay for photos (not external) */}
                        {item.media_type === 'image' && !isExternal && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <ZoomIn className="h-6 w-6 text-emerald-600" />
                            </div>
                          </div>
                        )}

                        {/* Download overlay for external/drive items */}
                        {isExternal && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Download className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        )}

                        {/* Duration badge */}
                        {item.duration && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </div>
                        )}

                        {/* Type badge */}
                        <div className={`absolute top-2 left-2 ${typeBadgeColors[displayType]} text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md`}>
                          <Icon className="h-3.5 w-3.5" />
                          {typeLabels[displayType][language]}
                        </div>

                        {/* External link badge */}
                        {isExternal && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <ExternalLink className="h-3 w-3" />
                            {language === 'si' ? 'Drive' : 'Drive'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className={`font-semibold text-foreground mb-2 line-clamp-2 ${language === 'si' ? 'font-sinhala text-base' : 'text-sm'}`}>
                          {language === 'si' ? item.title_sinhala : (item.title_english || item.title_sinhala)}
                        </h3>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className={`text-sm font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {formatDate(item.media_date)}
                          </span>
                        </div>

                        {/* Program/Preacher tags */}
                        {(item.program || (item.preachers && item.preachers.length > 0)) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {item.program && (
                              <span className={`text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? item.program.name_sinhala : item.program.name_english}
                              </span>
                            )}
                            {item.preachers && item.preachers.slice(0, 1).map(p => (
                              <span key={p.id} className={`text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? p.profile.name_sinhala : p.profile.name_english}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Download button */}
                        {item.download_enabled && (item.download_url || item.file_url) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={(e) => handleDownload(e, item)}
                          >
                            <Download className="h-4 w-4" />
                            {language === 'si' ? 'බාගන්න' : 'Download'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Empty state */}
            {!isLoading && filteredMedia.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className={`text-lg font-medium text-foreground mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'මාධ්‍ය අයිතම හමු නොවීය' : 'No media items found'}
                </h3>
                <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si'
                    ? 'ඔබේ සෙවුම් නිර්ණායක වෙනස් කර නැවත උත්සාහ කරන්න'
                    : 'Try adjusting your search criteria'}
                </p>
              </motion.div>
            )}
          </div>
        </main>

        {/* Photo Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-8 w-8" />
              </button>

              {photoItems.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2"
                    onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2"
                    onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              <div className="relative max-w-full max-h-[85vh]">
                <img
                  src={lightboxImage}
                  alt={language === 'si' ? photoItems[lightboxIndex]?.title_sinhala : (photoItems[lightboxIndex]?.title_english || photoItems[lightboxIndex]?.title_sinhala)}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Photo info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                  <h3 className={`text-white font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? photoItems[lightboxIndex]?.title_sinhala : (photoItems[lightboxIndex]?.title_english || photoItems[lightboxIndex]?.title_sinhala)}
                  </h3>
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
                {lightboxIndex + 1} / {photoItems.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Modal */}
        {videoModal && (
          <VideoPlayerModal
            isOpen={!!videoModal}
            onClose={() => setVideoModal(null)}
            youtubeId={videoModal.youtubeId}
            title={videoModal.title}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
