import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Play, Video, Loader2, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultProgramImage } from '@/data/programs';
import { defaultMonkPhoto } from '@/data/monks';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
}

interface Preacher {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  profile_type: string;
}

interface MediaItem {
  id: string;
  title_sinhala: string;
  title_english: string | null;
  youtube_id: string | null;
  is_youtube: boolean;
  media_date: string;
  duration: string | null;
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();

  // Fetch program details
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Program | null;
    },
    enabled: !!id,
  });

  // Fetch preachers assigned to this program
  const { data: preachers = [] } = useQuery({
    queryKey: ['program-preachers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_preachers')
        .select('profiles(*)')
        .eq('program_id', id);
      if (error) throw error;
      return (data || []).map(d => d.profiles).filter(Boolean) as Preacher[];
    },
    enabled: !!id,
  });

  // Fetch media items (videos) for this program from media_items table
  const { data: mediaVideos = [] } = useQuery({
    queryKey: ['program-media-videos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('program_id', id)
        .eq('media_type', 'video')
        .eq('is_youtube', true)
        .order('media_date', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as MediaItem[];
    },
    enabled: !!id,
  });

  // Also fetch from youtube_videos table and merge
  const { data: youtubeVideos = [] } = useQuery({
    queryKey: ['program-youtube-videos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('program_id', id)
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

  if (programLoading) {
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
  
  if (!program) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Program not found</h1>
            <Button asChild>
              <Link to="/programs">Back to Programs</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const programName = language === 'si' ? program.name_sinhala : program.name_english;

  return (
    <>
      <Helmet>
        <title>{`${programName} - ${language === 'si' ? 'ජය ටීවී' : 'Jaya TV'}`}</title>
        <meta name="description" content={program.description || programName} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Link to="/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {language === 'si' ? 'වැඩසටහන් වෙත' : 'Back to Programs'}
              </span>
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Program Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 border border-border">
                      <img
                        src={program.logo_url || defaultProgramImage}
                        alt={programName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      {program.category && (
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {program.category}
                        </span>
                      )}
                      <h1 className={`text-2xl md:text-4xl font-bold text-foreground mt-3 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {programName}
                      </h1>
                    </div>
                  </div>

                  {/* Description */}
                  {program.description && (
                    <div className="prose prose-lg max-w-none mb-12">
                      <p className={`text-foreground/80 leading-relaxed ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {program.description}
                      </p>
                    </div>
                  )}

                  {/* Program Videos */}
                  <div className="mt-12">
                    <h2 className={`text-xl font-semibold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {language === 'si' ? 'මෑත කථාංග' : 'Recent Episodes'}
                    </h2>
                    {videos.length > 0 ? (
                      <div className="space-y-4">
                        {videos.map((video) => (
                          <a
                            key={video.id}
                            href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-4 p-4 bg-card rounded-lg border border-border card-hover cursor-pointer"
                          >
                            <div className="w-32 h-20 rounded-md overflow-hidden bg-secondary shrink-0 relative">
                              <img
                                src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`}
                                alt={language === 'si' ? video.title_sinhala : (video.title_english || video.title_sinhala)}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 hover:bg-foreground/30 transition-colors">
                                <Play className="h-6 w-6 text-primary-foreground" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-medium text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? video.title_sinhala : (video.title_english || video.title_sinhala)}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(video.media_date).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US')}
                                {video.duration && ` • ${video.duration}`}
                              </p>
                            </div>
                            <Video className="h-5 w-5 text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-muted/30 rounded-lg">
                        <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? 'මෙම වැඩසටහන සඳහා වීඩියෝ තවම නොමැත' : 'No videos available for this program yet'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Featured Preachers */}
                  {preachers.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-6 mb-6">
                      <h3 className={`font-semibold text-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'ධර්ම දේශකයින්' : 'Featured Preachers'}
                      </h3>
                      <div className="space-y-4">
                        {preachers.map(preacher => (
                          <Link
                            key={preacher.id}
                            to={preacher.profile_type === 'monk' ? `/monks/${preacher.id}` : `/lay-speakers/${preacher.id}`}
                            className="flex items-center gap-3 hover:bg-secondary p-2 rounded-lg transition-colors"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-border">
                              <img
                                src={preacher.photo_url || defaultMonkPhoto}
                                alt={language === 'si' ? preacher.name_sinhala : preacher.name_english}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className={`font-medium text-foreground text-sm ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? preacher.name_sinhala : preacher.name_english}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {preacher.profile_type === 'monk' 
                                  ? (language === 'si' ? 'ස්වාමීන් වහන්සේ' : 'Monk')
                                  : (language === 'si' ? 'ගිහි දේශක' : 'Lay Speaker')
                                }
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Watch Live CTA */}
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 text-center">
                    <h3 className={`font-semibold text-foreground mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {language === 'si' ? 'සජීවීව නරඹන්න' : 'Watch Live'}
                    </h3>
                    <p className={`text-sm text-muted-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {language === 'si' ? 'දැන් ජය ටීවී සජීවීව නරඹන්න' : 'Watch Jaya TV live now'}
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/live">
                        <Play className="mr-2 h-4 w-4" />
                        {language === 'si' ? 'සජීවී විකාශය' : 'Live TV'}
                      </Link>
                    </Button>
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
