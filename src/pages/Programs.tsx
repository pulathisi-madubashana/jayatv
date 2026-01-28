import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultProgramImage } from '@/data/programs';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  is_active: boolean;
  display_order: number;
}

export default function Programs() {
  const { t, language } = useLanguage();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name_english', { ascending: true });
      if (error) throw error;
      return data as Program[];
    },
  });

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'වැඩසටහන් - ජය ටීවී' : 'Programs - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී ධර්ම වැඩසටහන්. විනිවිද, සමාහිත, ආවර්ජනා සහ තවත් බොහෝ වැඩසටහන්.' 
            : 'Jaya TV Dharma programs. Vinivida, Samahitha, Awarjana and many more programs.'
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
                {t('programs.title')}
              </h1>
              <p className={`text-lg text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('programs.subtitle')}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {programs.map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      to={`/programs/${program.id}`}
                      className="group block bg-card rounded-xl overflow-hidden border border-border card-hover h-full"
                    >
                      {/* Program Logo Area */}
                      <div className="aspect-square relative overflow-hidden bg-secondary">
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                        <img
                          src={program.logo_url || defaultProgramImage}
                          alt={language === 'si' ? program.name_sinhala : program.name_english}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                            <Play className="h-6 w-6 text-primary-foreground ml-1" />
                          </div>
                        </div>
                      </div>

                      {/* Program Info */}
                      <div className="p-5">
                        {program.category && (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {program.category}
                          </span>
                        )}
                        <h3 className={`font-semibold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors ${language === 'si' ? 'font-sinhala' : ''}`}>
                          {language === 'si' ? program.name_sinhala : program.name_english}
                        </h3>
                        {program.description && (
                          <p className={`text-sm text-muted-foreground line-clamp-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {program.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && programs.length === 0 && (
              <div className="text-center py-20">
                <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'වැඩසටහන් නොමැත' : 'No programs available'}
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
