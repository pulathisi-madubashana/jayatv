import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { defaultProgramImage } from '@/data/programs';

interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  display_order: number;
}

export default function FeaturedPrograms() {
  const { t, language } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('name_english', { ascending: true })
          .limit(4);

        if (error) throw error;
        setPrograms(data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('programs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'programs',
        },
        () => {
          fetchPrograms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getName = (program: Program) => 
    language === 'si' ? program.name_sinhala : program.name_english;

  const getDescription = (program: Program) => 
    program.description || (language === 'si' ? 'ධර්ම වැඩසටහන' : 'Dharma program');

  if (loading) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-3 sm:p-5">
                  <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (programs.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
              {t('home.featuredPrograms')}
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex gap-2">
            <Link to="/programs">
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {t('home.viewAll')}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {programs.map((program) => (
            <Link
              key={program.id}
              to={`/programs/${program.id}`}
              className="group block bg-card rounded-xl overflow-hidden border border-border card-hover"
            >
              {/* Program Image */}
              <div className="aspect-square relative overflow-hidden bg-secondary">
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img
                  src={program.logo_url || defaultProgramImage}
                  alt={getName(program)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center">
                    <Play className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="p-3 sm:p-5">
                <h3 className={`text-sm sm:text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {getName(program)}
                </h3>
                <p className={`text-xs sm:text-sm text-muted-foreground line-clamp-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {getDescription(program)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/programs">
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {t('home.viewAll')}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}