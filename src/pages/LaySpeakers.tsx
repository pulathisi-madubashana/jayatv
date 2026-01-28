import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultSpeakerPhoto } from '@/data/laySpeakers';

interface LaySpeaker {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  biography: string | null;
  display_order: number;
}

export default function LaySpeakers() {
  const { t, language } = useLanguage();

  const { data: speakers = [], isLoading } = useQuery({
    queryKey: ['lay-speakers-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'lay_speaker')
        .order('display_order', { ascending: true })
        .order('name_english', { ascending: true });
      if (error) throw error;
      return data as LaySpeaker[];
    },
  });

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'ධර්ම කථිකයන් - ජය ටීවී' : 'Lay Speakers - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී හි ගෞරවනීය ධර්ම කථිකයන්. ධර්ම දේශනා සහ මඟපෙන්වීම.' 
            : 'Lay Dharma speakers of Jaya TV. Dharma teachings and guidance.'
          } 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className={`text-3xl md:text-5xl font-bold text-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('laySpeakers.title')}
              </h1>
              <p className={`text-lg text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('laySpeakers.subtitle')}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {speakers.map((speaker, index) => (
                  <motion.div
                    key={speaker.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/lay-speakers/${speaker.id}`}
                      className="group block bg-card rounded-xl overflow-hidden border border-border card-hover text-center h-full"
                    >
                      {/* Speaker Photo */}
                      <div className="pt-8 pb-4 px-6 bg-secondary/30">
                        <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg group-hover:shadow-xl transition-shadow">
                          {speaker.photo_url ? (
                            <img 
                              src={speaker.photo_url} 
                              alt={speaker.name_english} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = defaultSpeakerPhoto;
                              }}
                            />
                          ) : (
                            <User className="h-14 w-14 text-primary" />
                          )}
                        </div>
                      </div>

                      {/* Speaker Info */}
                      <div className="p-6">
                        <h3 className={`text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? speaker.name_sinhala : speaker.name_english}
                        </h3>
                        <p className={`text-sm text-muted-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? 'ගිහි දේශක' : 'Lay Speaker'}
                        </p>
                        {speaker.biography && (
                          <p className={`text-sm text-muted-foreground line-clamp-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {speaker.biography}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && speakers.length === 0 && (
              <div className="text-center py-20">
                <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'ධර්ම කථිකයන් නොමැත' : 'No lay speakers available'}
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
