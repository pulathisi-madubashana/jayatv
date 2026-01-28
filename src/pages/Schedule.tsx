import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Globe, Radio, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSriLankaTime, findLiveProgramIndex } from '@/hooks/useSriLankaTime';
import { useScheduleData } from '@/hooks/useScheduleData';
import { daysOfWeek, ScheduleItem, parseTimeToMinutes } from '@/data/scheduleData';

export default function Schedule() {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'today' | 'weekly'>('today');
  
  // Fetch schedule from database
  const { schedule, isLoading } = useScheduleData();
  
  // Update every 30 seconds for accurate live detection
  const sriLankaTime = useSriLankaTime(30000);
  
  // Get today's schedule based on Sri Lanka time
  const todayDayKey = daysOfWeek.keys[sriLankaTime.dayOfWeek];
  const todaySchedule = schedule[todayDayKey] || [];
  
  // Find the currently live program (only for today)
  const liveProgramIndex = findLiveProgramIndex(
    todaySchedule,
    sriLankaTime.hours,
    sriLankaTime.minutes
  );

  if (isLoading) {
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

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'කාලසටහන - ජය ටීවී' : 'Schedule - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී දෛනික සහ සතියික කාලසටහන.' 
            : 'Jaya TV daily and weekly schedule.'
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
              className="text-center mb-8"
            >
              <h1 className={`text-3xl md:text-5xl font-bold text-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('schedule.title')}
              </h1>
              
              {/* Sri Lanka Time Indicator */}
              <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full text-sm">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {language === 'si' ? 'ශ්‍රී ලංකා වේලාව' : 'Sri Lanka Time (IST)'}:
                </span>
                <span className="font-medium font-mono text-foreground">{sriLankaTime.formattedTime}</span>
              </div>
            </motion.div>

            {/* View Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-secondary rounded-full p-1">
                <button
                  onClick={() => setView('today')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                    view === 'today'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  } ${language === 'si' ? 'font-sinhala' : ''}`}
                >
                  {t('schedule.today')}
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                    view === 'weekly'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  } ${language === 'si' ? 'font-sinhala' : ''}`}
                >
                  {t('schedule.weekly')}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Today View */}
              {view === 'today' && (
                <motion.div
                  key="today"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span className={`text-lg font-medium text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {daysOfWeek[language][sriLankaTime.dayOfWeek]}
                      </span>
                    </div>
                    
                    {liveProgramIndex === -1 && (
                      <span className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'දැනට සජීවී වැඩසටහනක් නැත' : 'No Live Program'}
                      </span>
                    )}
                  </div>

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    {todaySchedule.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        {language === 'si' ? 'අද කාලසටහනක් නොමැත' : 'No schedule for today'}
                      </div>
                    ) : (
                      todaySchedule.map((item, index) => {
                        const isLive = index === liveProgramIndex;
                        
                        return (
                          <motion.div
                            key={`${item.time}-${item.endTime}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`relative flex items-center px-6 py-4 transition-all duration-500 ${
                              index !== todaySchedule.length - 1 ? 'border-b border-border' : ''
                            } ${isLive ? 'bg-primary/5' : ''}`}
                          >
                            {/* Live indicator bar */}
                            {isLive && (
                              <motion.div 
                                className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            
                            <div className="flex items-center gap-3 w-36 shrink-0">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className={`text-sm font-mono ${isLive ? 'text-primary font-semibold' : 'text-foreground'}`}>
                                {item.time} - {item.endTime}
                              </span>
                            </div>
                            <div className="flex-1">
                              {item.programId ? (
                                <Link 
                                  to={`/programs/${item.programId}`}
                                  className={`font-medium transition-colors ${isLive ? 'text-primary' : 'text-foreground hover:text-primary'} ${language === 'si' ? 'font-sinhala' : ''}`}
                                >
                                  {item.program[language]}
                                </Link>
                              ) : (
                                <span className={`font-medium text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                                  {item.program[language]}
                                </span>
                              )}
                            </div>
                            {isLive && (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full"
                              >
                                <Radio className="h-3 w-3 animate-pulse" />
                                <span className={`text-xs font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                                  {language === 'si' ? 'සජීවී' : 'Live'}
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* Weekly View */}
              {view === 'weekly' && (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="overflow-x-auto pb-4"
                >
                  <WeeklyScheduleGrid 
                    schedule={schedule}
                    sriLankaTime={sriLankaTime}
                    liveProgramIndex={liveProgramIndex}
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

interface WeeklyScheduleGridProps {
  schedule: Record<string, ScheduleItem[]>;
  sriLankaTime: ReturnType<typeof useSriLankaTime>;
  liveProgramIndex: number;
  language: 'si' | 'en';
}

function WeeklyScheduleGrid({ schedule, sriLankaTime, liveProgramIndex, language }: WeeklyScheduleGridProps) {
  // Get all unique time slots across all days for the grid
  const allTimeSlots = getAllTimeSlots(schedule);
  
  return (
    <div className="min-w-[1000px]">
      {/* Day Headers */}
      <div className="grid grid-cols-8 gap-2 mb-4">
        <div className="p-3 bg-secondary rounded-lg font-medium text-center text-muted-foreground text-sm">
          {language === 'si' ? 'වේලාව' : 'Time'}
        </div>
        {daysOfWeek.keys.map((dayKey, i) => {
          const isToday = i === sriLankaTime.dayOfWeek;
          return (
            <div
              key={dayKey}
              className={`p-3 rounded-lg font-medium text-center text-sm ${
                isToday 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-foreground'
              } ${language === 'si' ? 'font-sinhala' : ''}`}
            >
              {daysOfWeek[language][i]}
              {isToday && (
                <span className="block text-xs opacity-80 mt-0.5 font-mono">
                  {sriLankaTime.formattedTime} IST
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule Grid - Row per time slot */}
      {allTimeSlots.map((timeSlot) => (
        <div key={timeSlot} className="grid grid-cols-8 gap-2 mb-2">
          {/* Time Column */}
          <div className="p-3 bg-card border border-border rounded-lg text-center text-sm font-mono font-medium text-muted-foreground">
            {timeSlot}
          </div>
          
          {/* Day Columns */}
          {daysOfWeek.keys.map((dayKey, dayIndex) => {
            const daySchedule = schedule[dayKey] || [];
            const item = findProgramAtTime(daySchedule, timeSlot);
            const isToday = dayIndex === sriLankaTime.dayOfWeek;
            
            // Only show live on today's column and matching program
            const itemIndex = item ? daySchedule.indexOf(item) : -1;
            const isLive = isToday && itemIndex === liveProgramIndex;
            
            return (
              <div
                key={`${dayKey}-${timeSlot}`}
                className={`relative p-3 border border-border rounded-lg text-xs text-center transition-all duration-500 ${
                  isLive 
                    ? 'bg-primary/10 border-primary' 
                    : isToday 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-card'
                } ${language === 'si' ? 'font-sinhala' : ''}`}
              >
                {item && item.time === timeSlot && (
                  <div className="relative">
                    {item.programId ? (
                      <Link 
                        to={`/programs/${item.programId}`}
                        className={`hover:text-primary transition-colors ${isLive ? 'text-primary font-semibold' : ''}`}
                      >
                        {item.program[language]}
                      </Link>
                    ) : (
                      <span className={isLive ? 'text-primary font-semibold' : ''}>
                        {item.program[language]}
                      </span>
                    )}
                    
                    <span className="block text-[10px] text-muted-foreground mt-1 font-mono">
                      {item.time} - {item.endTime}
                    </span>
                    
                    {isLive && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex items-center gap-0.5 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full"
                      >
                        <Radio className="h-2 w-2 animate-pulse" />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Get all unique start times across all days
function getAllTimeSlots(schedule: Record<string, ScheduleItem[]>): string[] {
  const slots = new Set<string>();
  
  Object.values(schedule).forEach(daySchedule => {
    daySchedule.forEach(item => {
      slots.add(item.time);
    });
  });
  
  return Array.from(slots).sort((a, b) => {
    const aMinutes = parseTimeToMinutes(a);
    const bMinutes = parseTimeToMinutes(b);
    return aMinutes - bMinutes;
  });
}

// Find which program is running at a given time slot
function findProgramAtTime(schedule: ScheduleItem[], timeSlot: string): ScheduleItem | null {
  return schedule.find(item => item.time === timeSlot) || null;
}
