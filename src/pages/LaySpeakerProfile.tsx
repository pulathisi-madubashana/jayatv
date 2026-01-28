import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, ExternalLink, Calendar, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultSpeakerPhoto } from '@/data/laySpeakers';

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

export default function LaySpeakerProfile() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [expandedBiography, setExpandedBiography] = useState(false);

  // Fetch speaker details
  const { data: speaker, isLoading: speakerLoading } = useQuery({
    queryKey: ['lay-speaker', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('profile_type', 'lay_speaker')
        .maybeSingle();
      if (error) throw error;
      return data as Preacher | null;
    },
    enabled: !!id,
  });

  // Fetch programs assigned to this speaker
  const { data: speakerPrograms = [] } = useQuery({
    queryKey: ['speaker-programs', id],
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

  // Fetch media items (videos) linked to this speaker via media_preachers
  const { data: mediaVideos = [] } = useQuery({
    queryKey: ['speaker-media-videos', id],
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
    queryKey: ['speaker-youtube-videos', id],
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

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  if (speakerLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
      </div>
    );
  }
  
  if (!speaker) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {language === 'si' ? 'ධර්ම කථිකයා හමු නොවීය' : 'Speaker not found'}
            </h1>
            <Link to="/lay-speakers">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'si' ? 'ආපසු යන්න' : 'Go Back'}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const speakerName = language === 'si' ? speaker.name_sinhala : speaker.name_english;

  return (
    <>
      <Helmet>
        <title>{speakerName} - Jaya TV</title>
        <meta name="description" content={speaker.biography || speakerName} />
      </Helmet>

      <div className="w-screen bg-background overflow-x-hidden">
        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Remove boxed card visuals - keep transparent */
          .profile-card-glass {
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Subtle red accent ring + glow for avatar (no card) */
          .avatar-ring {
            display: inline-block;
            border-radius: 9999px;
            padding: 4px; /* space for ring */
            background: transparent;
            box-shadow: 0 8px 30px rgba(239,68,68,0.08);
            border: 3px solid rgba(239,68,68,0.14);
          }
          .avatar-ring img {
            display: block;
            border-radius: 9999px;
          }

          .videos-section-animate {
            animation: fadeInUp 0.8s ease-out 0.2s both;
          }

          .video-card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .video-card-hover:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          }

          /* Desktop full-width layout */
          @media (min-width: 1366px) {
            .videos-grid-desktop {
              display: grid;
              grid-template-columns: repeat(7, minmax(0, 1fr));
              gap: 1.5rem;
            }
          }

          @media (min-width: 1024px) and (max-width: 1365px) {
            .videos-grid-desktop {
              display: grid;
              grid-template-columns: repeat(6, minmax(0, 1fr));
              gap: 1.5rem;
            }
          }

          @media (max-width: 1023px) {
            .videos-grid-desktop {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 1rem;
            }
          }
        `}</style>

        <Header />
        
        <main className="w-full pt-6 pb-10 md:pt-8 md:pb-12">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            {/* Back Button */}
            <Link 
              to="/lay-speakers" 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {language === 'si' ? 'ආපසු යන්න' : 'Back to Lay Speakers'}
              </span>
            </Link>

            {/* Profile Card Section - Centered */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="profile-card-glass rounded-2xl p-6 md:p-8 max-w-md w-full text-center">
                {/* Circular Profile Image */}
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl mb-4 flex-shrink-0">
                  <img 
                    src={speaker.photo_url || defaultSpeakerPhoto} 
                    alt={speaker.name_english}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name & Role */}
                <h1 className={`text-3xl md:text-4xl font-bold text-foreground mb-1 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {speakerName}
                </h1>
                <p className={`text-lg text-primary/80 mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'ගිහි දේශක' : 'Lay Speaker'}
                </p>

                {/* Biography */}
                {speaker.biography && (
                  <div className="mb-4">
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedBiography ? 'max-h-none' : 'max-h-20'}`}>
                      <p className={`text-sm text-muted-foreground leading-relaxed ${language === 'si' ? 'font-sinhala' : ''} ${!expandedBiography ? 'line-clamp-3' : ''}`}>
                        {speaker.biography}
                      </p>
                    </div>
                    {speaker.biography && speaker.biography.length > 150 && (
                      <button
                        onClick={() => setExpandedBiography(!expandedBiography)}
                        className="mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                      >
                        {expandedBiography ? (language === 'si' ? 'කැඩවලින්න' : 'Show Less') : (language === 'si' ? 'තවත් කියවන්න' : 'Read More')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Filter Buttons - Centered */}
            {speakerPrograms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex justify-center mb-6"
              >
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setSelectedProgram(null)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedProgram === null
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                        : 'bg-secondary/60 text-foreground hover:bg-secondary/80'
                    } ${language === 'si' ? 'font-sinhala' : ''}`}
                  >
                    {language === 'si' ? 'සියල්ල' : 'All'}
                  </button>
                  {speakerPrograms.map((program) => (
                    <button
                      key={program.id}
                      onClick={() => setSelectedProgram(program.id)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedProgram === program.id
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'bg-secondary/60 text-foreground hover:bg-secondary/80'
                      } ${language === 'si' ? 'font-sinhala' : ''}`}
                    >
                      {language === 'si' ? program.name_sinhala : program.name_english}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Videos Section */}
            {filteredVideos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="videos-section-animate"
              >
                <h2 className={`text-2xl md:text-3xl font-bold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'වීඩියෝ' : 'Videos'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-5 lg:gap-6">
                  {filteredVideos.map((video, index) => {
                    const program = speakerPrograms.find((p) => p.id === video.program_id);
                    return (
                      <motion.a
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group video-card-hover rounded-lg overflow-hidden bg-card border border-border/50 flex flex-col h-full"
                      >
                        {/* Thumbnail - 16:9 Ratio */}
                        <div className="relative w-full aspect-video bg-secondary/50 overflow-hidden">
                          <img
                            src={getYouTubeThumbnail(video.youtube_id!)}
                            alt={language === 'si' ? video.title_sinhala : (video.title_english || video.title_sinhala)}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                              <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
                            </div>
                          </div>
                          {/* Duration Badge */}
                          {video.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                              {video.duration}
                            </span>
                          )}
                        </div>

                        {/* Info Section */}
                        <div className="p-2 md:p-3 flex flex-col flex-1">
                          {/* Title */}
                          <h4 className={`font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-xs md:text-sm mb-2 flex-shrink-0 ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {language === 'si' ? video.title_sinhala : (video.title_english || video.title_sinhala)}
                          </h4>

                          {/* Meta Info */}
                          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground mt-auto">
                            {/* Program Badge */}
                            {program && (
                              <span className={`inline-flex px-2 py-0.5 rounded bg-primary/15 text-primary/90 font-medium w-fit text-xs ${language === 'si' ? 'font-sinhala' : ''}`}>
                                {language === 'si' ? program.name_sinhala : program.name_english}
                              </span>
                            )}
                            {/* Date */}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {video.media_date}
                            </span>
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center py-8"
              >
                <div className="bg-secondary/20 rounded-lg p-8 text-center max-w-md">
                  <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' 
                      ? 'මෙම වැඩසටහන සඳහා වීඩියෝ නොමැත' 
                      : 'No videos available'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
