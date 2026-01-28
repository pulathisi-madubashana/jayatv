import { useEffect, useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name_sinhala: string;
  name_english: string;
  photo_url: string | null;
  biography: string | null;
  profile_type: string;
  keywords: string[] | null;
  display_order: number;
}

interface ProgramPreacher {
  program_id: string;
  programs: {
    id: string;
    name_sinhala: string;
    name_english: string;
  } | null;
}

export default function FeaturedMonks() {
  const { t, language } = useLanguage();
  const [monks, setMonks] = useState<Profile[]>([]);
  const [programsByMonk, setProgramsByMonk] = useState<Record<string, ProgramPreacher[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonks = async () => {
      try {
        // Fetch monks (profile_type = 'monk')
        const { data: monksData, error: monksError } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_type', 'monk')
          .order('display_order', { ascending: true })
          .order('name_english', { ascending: true })
          .limit(4);

        if (monksError) throw monksError;
        setMonks(monksData || []);

        // Fetch program associations for these monks
        if (monksData && monksData.length > 0) {
          const monkIds = monksData.map(m => m.id);
          const { data: programData, error: programError } = await supabase
            .from('program_preachers')
            .select('profile_id, program_id, programs(id, name_sinhala, name_english)')
            .in('profile_id', monkIds);

          if (programError) throw programError;

          // Group programs by monk
          const grouped: Record<string, ProgramPreacher[]> = {};
          programData?.forEach((pp: any) => {
            if (!grouped[pp.profile_id]) {
              grouped[pp.profile_id] = [];
            }
            grouped[pp.profile_id].push(pp);
          });
          setProgramsByMonk(grouped);
        }
      } catch (error) {
        console.error('Error fetching monks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonks();

    // Subscribe to real-time changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchMonks();
        }
      )
      .subscribe();

    const programPreachersChannel = supabase
      .channel('program-preachers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'program_preachers',
        },
        () => {
          fetchMonks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(programPreachersChannel);
    };
  }, []);

  const getName = (monk: Profile) =>
    language === 'si' ? monk.name_sinhala : monk.name_english;

  const getPrograms = (monkId: string) => {
    const programs = programsByMonk[monkId] || [];
    return programs.slice(0, 2).map(pp => ({
      name: language === 'si' ? pp.programs?.name_sinhala : pp.programs?.name_english
    }));
  };

  if (loading) {
    return (
      <section className="w-full py-12 md:py-16 lg:py-20 bg-secondary">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border text-center">
                <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-muted animate-pulse" />
                </div>
                <div className="p-3 sm:p-5 pt-0">
                  <div className="h-5 bg-muted animate-pulse rounded mb-2 mx-auto w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (monks.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-secondary">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <div>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
              {t('home.featuredMonks')}
            </h2>
          </div>
          <Button asChild variant="ghost" className="hidden md:flex gap-2">
            <Link to="/monks">
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {t('home.viewAll')}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Monks Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {monks.map((monk) => (
            <Link
              key={monk.id}
              to={`/monks/${monk.id}`}
              className="group block bg-card rounded-xl overflow-hidden border border-border card-hover text-center"
            >
              {/* Monk Photo */}
              <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                  {monk.photo_url ? (
                    <img
                      src={monk.photo_url}
                      alt={getName(monk)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                  )}
                </div>
              </div>

              {/* Monk Info */}
              <div className="p-3 sm:p-5 pt-0">
                <h3 className={`text-sm sm:text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {getName(monk)}
                </h3>
                {/* Show associated programs as tags */}
                <div className="hidden sm:flex flex-wrap justify-center gap-1 mt-2">
                  {getPrograms(monk.id).map((program, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary ${language === 'si' ? 'font-sinhala' : ''}`}
                    >
                      {program.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/monks">
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