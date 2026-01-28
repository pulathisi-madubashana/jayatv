import { Clock, ArrowRight, Globe, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSriLankaTime, findLiveProgramIndex } from '@/hooks/useSriLankaTime';
import { useScheduleData } from '@/hooks/useScheduleData';
import { daysOfWeek, ScheduleItem } from '@/data/scheduleData';

export default function TodaySchedule() {
  const { t, language } = useLanguage();
  // Update every 30 seconds for accurate live detection
  const sriLankaTime = useSriLankaTime(30000);
  
  // Get schedule from database (with static fallback)
  const { schedule } = useScheduleData();
  
  // Get today's schedule based on Sri Lanka time
  const todaySchedule = schedule[sriLankaTime.dateKey] || schedule.sunday;
  
  // Find the currently live program using strict time range comparison
  const liveProgramIndex = findLiveProgramIndex(
    todaySchedule,
    sriLankaTime.hours,
    sriLankaTime.minutes
  );

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className={`text-2xl md:text-3xl font-bold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('home.todaySchedule')}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span className={language === 'si' ? 'font-sinhala' : ''}>
                    {daysOfWeek[language][sriLankaTime.dayOfWeek]}
                  </span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{sriLankaTime.formattedTime} IST</span>
                </div>
              </div>
            </div>
            <Button asChild variant="ghost" className="gap-2">
              <Link to="/schedule">
                <span className={language === 'si' ? 'font-sinhala' : ''}>
                  {t('home.viewAll')}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Schedule List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            {todaySchedule.map((item, index) => (
              <ScheduleRow 
                key={`${item.time}-${item.endTime}-${index}`}
                item={item}
                isLive={index === liveProgramIndex}
                isLast={index === todaySchedule.length - 1}
                language={language}
              />
            ))}
            
            {/* No Live Program State */}
            {liveProgramIndex === -1 && (
              <div className="px-6 py-4 bg-muted/50 text-center">
                <span className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'දැනට සජීවී වැඩසටහනක් නැත' : 'No Live Program'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ScheduleRowProps {
  item: ScheduleItem;
  isLive: boolean;
  isLast: boolean;
  language: 'si' | 'en';
}

function ScheduleRow({ item, isLive, isLast, language }: ScheduleRowProps) {
  return (
    <div
      className={`
        flex items-center px-4 sm:px-6 py-3 sm:py-4 
        transition-colors duration-300
        ${!isLast ? 'border-b border-border' : ''}
        ${isLive ? 'bg-primary/5 relative' : 'hover:bg-muted/50'}
      `}
    >
      {/* Live indicator bar */}
      {isLive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
      
      {/* Time Range */}
      <div className="flex items-center gap-2 w-24 sm:w-32 shrink-0">
        <Clock className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <span className={`text-xs sm:text-sm font-mono ${isLive ? 'text-primary font-semibold' : 'text-foreground'}`}>
          {item.time} - {item.endTime}
        </span>
      </div>

      {/* Program Name */}
      <div className="flex-1 min-w-0 px-2">
        {item.programId ? (
          <Link 
            to={`/programs/${item.programId}`}
            className={`
              text-sm sm:text-base font-medium transition-colors truncate block
              ${isLive ? 'text-primary' : 'text-foreground hover:text-primary'}
              ${language === 'si' ? 'font-sinhala' : ''}
            `}
          >
            {item.program[language]}
          </Link>
        ) : (
          <span className={`text-sm sm:text-base font-medium text-foreground truncate block ${language === 'si' ? 'font-sinhala' : ''}`}>
            {item.program[language]}
          </span>
        )}
      </div>

      {/* Live Badge */}
      {isLive && (
        <Badge className="bg-primary text-primary-foreground gap-1.5 ml-2 shrink-0">
          <Radio className="h-3 w-3" />
          <span className={`text-xs ${language === 'si' ? 'font-sinhala' : ''}`}>
            {language === 'si' ? 'සජීවී' : 'LIVE'}
          </span>
        </Badge>
      )}
    </div>
  );
}
