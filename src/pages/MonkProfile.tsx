import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultMonkPhoto } from '@/data/monks';

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  biography: string | null;
}

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
}

interface MediaItem {
  id: string;
  title_sinhala: string;
  title_english: string | null;
  youtube_id: string | null;
  is_youtube: boolean;
  media_date: string;
  duration: string | null;
  program_id: string | null;
}

export default function MonkProfile() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [expandedBiography, setExpandedBiography] = useState(false);

  // Fetch monk details
  const { data: monk, isLoading: monkLoading } = useQuery({
    queryKey: ['monk', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'monk')
        .maybeSingle();
      if (error) throw error;
      return data as Preacher | null;
    },
    enabled: !!id,
  });

  // Fetch programs assigned to this monk
  const { data: relatedPrograms = [] } = useQuery({
    queryKey: ['monk-programs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_preachers')
        .select('programs(*)')
        .eq('profile_id', id);
      if (error) throw error;
      return (data || []).map(d => d.programs).filter(Boolean) as Program[];
    },
    enabled: !!id,
  });

  // Fetch media items (videos) linked to this monk via media_preachers
  const { data: mediaVideos = [] } = useQuery({
    queryKey: ['monk-media-videos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_preachers')
        .select('media_items(*)')
        .eq('profile_id', id);
      if (error) throw error;
      return (data || [])
        .map(d => d.media_items)
        .filter(item => item !== null && item.is_youtube && !!item.youtube_id)
        .sort((a, b) => new Date(b!.media_date).getTime() - new Date(a!.media_date).getTime()) as MediaItem[];
    },
    enabled: !!id,
  });

  // Also fetch from youtube_videos table
  const { data: youtubeVideos = [] } = useQuery({
    queryKey: ['monk-youtube-videos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('profile_id', id)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      // Map to MediaItem format
      return (data || []).map(v => ({
        id: v.id,
        title_sinhala: v.title,
        title_english: v.title,
        youtube_id: v.youtube_id,
        is_youtube: true,
        media_date: v.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        duration: v.duration,
        program_id: v.program_id,
      })) as MediaItem[];
    },
    enabled: !!id,
  });

  // Merge videos and remove duplicates by youtube_id
  const videos = [...mediaVideos, ...youtubeVideos].reduce((acc, video) => {
    if (!acc.find(v => v.youtube_id === video.youtube_id)) {
      acc.push(video);
    }
    return acc;
  }, [] as MediaItem[]);

  const filteredVideos = selectedProgram 
    ? videos.filter(v => v.program_id === selectedProgram) 
    : videos;

  const getYouTubeThumbnail = (youtubeId: string) => 
    `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  if (monkLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!monk) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Monk not found</h1>
            <Button asChild>
              <Link to="/monks">Back to Monks</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const monkName = language === 'si' ? monk.name_sinhala : monk.name_english;

  return (
    <>
      <Helmet>
        <title>{`${monkName} - ${language === 'si' ? 'ජය ටීවී' : 'Jaya TV'}`}</title>
        <meta name="description" content={monk.biography || monkName} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link to="/monks" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {language === 'si' ? 'ස්වාමීන් වහන්සේලා වෙත' : 'Back to Monks'}
              </span>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:order-1"
              >
                <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-24">
                  <div className="bg-secondary/30 pt-8 pb-6 px-6 text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg mb-4">
                      <img 
                        src={monk.photo_url || defaultMonkPhoto} 
                        alt={monk.name_english} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = defaultMonkPhoto;
                        }}
                      />
                    </div>
                    <h1 className={`text-xl font-bold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {monkName}
                    </h1>
                  </div>

                  <div className="p-6">
                    {relatedPrograms.length > 0 && (
                      <div>
                        <h3 className={`text-sm font-medium text-muted-foreground mb-3 ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? 'වැඩසටහන් අනුව පෙරන්න' : 'Filter by Program'}
                        </h3>
                        <div className="space-y-2">
                          <button
                            onClick={() => setSelectedProgram(null)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              !selectedProgram 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-secondary text-foreground hover:bg-primary/10'
                            } ${language === 'si' ? 'font-sinhala' : ''}`}
                          >
                            {language === 'si' ? 'සියල්ල' : 'All Programs'}
                          </button>
                          {relatedPrograms.map(program => (
                            <button
                              key={program.id}
                              onClick={() => setSelectedProgram(program.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedProgram === program.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-secondary text-foreground hover:bg-primary/10'
                              } ${language === 'si' ? 'font-sinhala' : ''}`}
                            >
                              {language === 'si' ? program.name_sinhala : program.name_english}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-2 lg:order-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {monk.biography && (
                    <div className="mb-12">
                      <h2 className={`text-2xl font-bold text-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'ජීවන චරිතය' : 'Biography'}
                      </h2>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedBiography ? 'max-h-none' : 'max-h-32'}`}>
                        <p className={`text-foreground/80 leading-relaxed ${language === 'si' ? 'font-sinhala' : ''} ${!expandedBiography ? 'line-clamp-4' : ''}`}>
                          {monk.biography}
                        </p>
                      </div>
                      {monk.biography && monk.biography.length > 300 && (
                        <button
                          onClick={() => setExpandedBiography(!expandedBiography)}
                          className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 underline"
                        >
                          {expandedBiography ? (language === 'si' ? 'කැඩවලින්න' : 'Show Less') : (language === 'si' ? 'තවත් කියවන්න' : 'Read More')}
                        </button>
                      )}
                    </div>
                  )}

                  <div>
                    <h2 className={`text-xl font-bold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {t('monks.allSermons')}
                    </h2>

                    {filteredVideos.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {filteredVideos.map((video) => (
                          <a
                            key={video.id}
                            href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex gap-4 p-4 bg-card rounded-lg border border-border card-hover"
                          >
                            <div className="w-28 h-20 rounded-md bg-secondary flex items-center justify-center shrink-0 overflow-hidden relative">
                              <img 
                                src={getYouTubeThumbnail(video.youtube_id!)}
                                alt={video.title_english || video.title_sinhala}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="h-8 w-8 text-white fill-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? video.title_sinhala : (video.title_english || video.title_sinhala)}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(video.media_date).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US')}
                              </p>
                              {video.duration && (
                                <p className="text-xs text-muted-foreground mt-1">{video.duration}</p>
                              )}
                              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                                <ExternalLink className="h-3 w-3" />
                                <span>YouTube</span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-secondary/30 rounded-lg">
                        <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? 'මෙම වැඩසටහන සඳහා වීඩියෝ නොමැත' : 'No videos available'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
