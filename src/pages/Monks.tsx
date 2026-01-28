import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultMonkPhoto } from '@/data/monks';

interface Monk {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  biography: string | null;
  display_order: number;
}

export default function Monks() {
  const { t, language } = useLanguage();

  const { data: monks = [], isLoading } = useQuery({
    queryKey: ['monks-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('profile_type', 'monk')
        .order('display_order', { ascending: true })
        .order('name_english', { ascending: true });
      if (error) throw error;
      return data as Monk[];
    },
  });

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'ස්වාමීන් වහන්සේලා - ජය ටීවී' : 'Monks - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී හි ගෞරවනීය ස්වාමීන් වහන්සේලා. ධර්ම දේශනා සහ මඟපෙන්වීම.' 
            : 'Venerable monks of Jaya TV. Dharma teachings and guidance.'
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
                {t('monks.title')}
              </h1>
              <p className={`text-lg text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('monks.subtitle')}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {monks.map((monk, index) => (
                  <motion.div
                    key={monk.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/monks/${monk.id}`}
                      className="group block bg-card rounded-xl overflow-hidden border border-border card-hover text-center h-full"
                    >
                      {/* Monk Photo */}
                      <div className="pt-8 pb-4 px-6 bg-secondary/30">
                        <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg group-hover:shadow-xl transition-shadow">
                          {monk.photo_url ? (
                            <img 
                              src={monk.photo_url} 
                              alt={monk.name_english} 
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = defaultMonkPhoto;
                              }}
                            />
                          ) : (
                            <User className="h-14 w-14 text-primary" />
                          )}
                        </div>
                      </div>

                      {/* Monk Info */}
                      <div className="p-6">
                        <h3 className={`text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? monk.name_sinhala : monk.name_english}
                        </h3>
                        {monk.biography && (
                          <p className={`text-sm text-muted-foreground line-clamp-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {monk.biography}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && monks.length === 0 && (
              <div className="text-center py-20">
                <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'ස්වාමීන් වහන්සේලා නොමැත' : 'No monks available'}
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
