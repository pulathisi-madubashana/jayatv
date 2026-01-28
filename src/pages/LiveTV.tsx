import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Share2, Facebook, MessageCircle, Clock, Globe, Radio, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSriLankaTime, findLiveProgramIndex } from '@/hooks/useSriLankaTime';
import { useScheduleData } from '@/hooks/useScheduleData';
import { daysOfWeek, ScheduleItem } from '@/data/scheduleData';
import { useToast } from '@/hooks/use-toast';

export default function LiveTV() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Use shared Sri Lanka time hook - updates every 30 seconds
  const sriLankaTime = useSriLankaTime(30000);
  
  // Get schedule from database (with static fallback)
  const { schedule } = useScheduleData();
  
  // Get today's schedule from the SAME data source as home page
  const todaySchedule = schedule[sriLankaTime.dateKey] || schedule.sunday;
  
  // Find the currently live program using SAME logic as home page
  const liveProgramIndex = findLiveProgramIndex(
    todaySchedule,
    sriLankaTime.hours,
    sriLankaTime.minutes
  );
  
  // Get current live program info
  const liveProgram = liveProgramIndex >= 0 ? todaySchedule[liveProgramIndex] : null;

  // Get current page URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Share handlers
  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const shareText = language === 'si' 
      ? `ජය ටීවී සජීවී විකාශය නරඹන්න: ${currentUrl}`
      : `Watch Jaya TV Live: ${currentUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: language === 'si' ? 'සබැඳිය පිටපත් කරන ලදී' : 'Link copied!',
        description: language === 'si' ? 'සබැඳිය ඔබේ ක්ලිප් බෝඩ් එකට පිටපත් කරන ලදී' : 'Link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: language === 'si' ? 'දෝෂයක්' : 'Error',
        description: language === 'si' ? 'සබැඳිය පිටපත් කිරීමට නොහැකි විය' : 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'සජීවී විකාශය - ජය ටීවී' : 'Live TV - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී සජීවී විකාශය නරඹන්න. 24/7 ධර්ම දේශනා, භාවනා සහ බුද්ධ ධර්මය.' 
            : 'Watch Jaya TV live broadcast. 24/7 Dharma sermons, meditation, and Buddhist teachings.'
          } 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Page Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-3xl md:text-4xl font-bold text-foreground mb-8 ${language === 'si' ? 'font-sinhala' : ''}`}
            >
              {t('live.title')}
            </motion.h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-foreground/5 shadow-xl">
                  {/* Live Badge */}
                  {liveProgram && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-primary px-3 py-1.5 rounded-full">
                      <span className="w-2 h-2 bg-primary-foreground rounded-full live-pulse" />
                      <span className={`text-sm font-medium text-primary-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {t('home.liveNow')}
                      </span>
                    </div>
                  )}

                  <iframe
                    src="https://www.youtube.com/embed/0zXte8iwNp4?si=ZyIxF_E1E2dfbi26"
                    title="Jaya TV Live Stream"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Now Playing & Share */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {t('live.watchingNow')}
                    </p>
                    <h2 className={`text-xl font-semibold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {liveProgram 
                        ? liveProgram.program[language]
                        : (language === 'si' ? 'දැනට සජීවී වැඩසටහනක් නැත' : 'No Live Program')
                      }
                    </h2>
                    {liveProgram && (
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {liveProgram.time} - {liveProgram.endTime}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleFacebookShare}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleWhatsAppShare}
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className={language === 'si' ? 'font-sinhala' : ''}>
                        {copied 
                          ? (language === 'si' ? 'පිටපත් කළා' : 'Copied')
                          : (language === 'si' ? 'සබැඳිය' : 'Copy Link')
                        }
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Today's Schedule - SAME DATA SOURCE AS HOME PAGE */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold text-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {t('live.schedule')}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono">{sriLankaTime.formattedTime} IST</span>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden max-h-[600px] overflow-y-auto">
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
                    <div className="px-4 py-3 bg-muted/50 text-center border-t border-border">
                      <span className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'දැනට සජීවී වැඩසටහනක් නැත' : 'No Live Program'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
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
        flex items-center px-4 py-3 relative
        transition-all duration-500 ease-out
        ${!isLast ? 'border-b border-border' : ''}
        ${isLive ? 'bg-primary/5' : ''}
      `}
    >
      {/* Live indicator bar */}
      {isLive && (
        <motion.div 
          layoutId="live-indicator-sidebar"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      <div className="flex items-center gap-2 w-24 shrink-0">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className={`text-sm font-mono ${isLive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
          {item.time}
        </span>
      </div>
      <span className={`flex-1 text-sm font-medium truncate ${isLive ? 'text-primary' : 'text-foreground'} ${language === 'si' ? 'font-sinhala' : ''}`}>
        {item.program[language]}
      </span>
      {isLive && (
        <Badge className="bg-primary text-primary-foreground gap-1 ml-2 px-2 py-0.5">
          <Radio className="h-2.5 w-2.5 animate-pulse" />
          <span className="text-xs">{language === 'si' ? 'සජීවී' : 'LIVE'}</span>
        </Badge>
      )}
    </div>
  );
}
