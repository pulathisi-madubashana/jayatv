import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ImageModal } from '@/components/ui/ImageModal';
import { supabase } from '@/integrations/supabase/client';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
interface SpecialEvent {
  id: string;
  title_sinhala: string;
  title_english: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  image_url: string | null;
  program_id: string | null;
  is_active: boolean;
  whatsapp_link: string | null;
}
interface Program {
  id: string;
  name_sinhala: string;
  name_english: string;
  logo_url: string | null;
}
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
export default function SpecialEventBanner() {
  const {
    t,
    language
  } = useLanguage();
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, TimeLeft | null>>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');

  // Filter out ended events based on current time
  const activeEvents = events.filter(e => {
    const now = new Date();
    const endTime = new Date(e.end_datetime);
    return e.is_active && endTime > now;
  });

  // Enable carousel if more than 1 event
  const useCarousel = activeEvents.length > 1;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1
  }, [Autoplay({
    delay: 8000,
    stopOnInteraction: false
  })]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [eventsRes, programsRes] = await Promise.all([supabase.from('special_events').select('*').eq('is_active', true).gte('end_datetime', new Date().toISOString()).order('start_datetime', {
          ascending: true
        }), supabase.from('programs').select('id, name_sinhala, name_english, logo_url')]);
        if (eventsRes.data) setEvents(eventsRes.data);
        if (programsRes.data) setPrograms(programsRes.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  // Update countdowns every second using Sri Lanka Time
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const sriLankaTime = new Date(now.toLocaleString('en-US', {
        timeZone: 'Asia/Colombo'
      }));
      const nowMs = sriLankaTime.getTime();
      const newTimeLeftMap: Record<string, TimeLeft | null> = {};
      events.forEach(event => {
        const startTime = new Date(event.start_datetime);
        const sriLankaStart = new Date(startTime.toLocaleString('en-US', {
          timeZone: 'Asia/Colombo'
        }));
        const startMs = sriLankaStart.getTime();
        if (nowMs < startMs) {
          const difference = startMs - nowMs;
          newTimeLeftMap[event.id] = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
            minutes: Math.floor(difference % (1000 * 60 * 60) / (1000 * 60)),
            seconds: Math.floor(difference % (1000 * 60) / 1000)
          };
        } else {
          newTimeLeftMap[event.id] = null;
        }
      });
      setTimeLeftMap(newTimeLeftMap);
    };
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [events]);
  if (isLoading) {
    return <section className="py-16 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(0,75%,30%)] to-[hsl(0,80%,22%)]">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </section>;
  }
  if (activeEvents.length === 0) return null;
  const handleWhatsAppJoin = (event: SpecialEvent) => {
    const whatsappLink = event.whatsapp_link || 'https://wa.me/94771234567';
    const message = encodeURIComponent(language === 'si' ? `ජය ටීවී විශේෂ වැඩසටහනට සම්බන්ධ වීමට කැමැත්තෙමි: ${event.title_sinhala}` : `I would like to join the Jaya TV Special Event: ${event.title_english}`);
    window.open(`${whatsappLink}?text=${message}`, '_blank');
  };

  const handleImageClick = (imageUrl: string, imageAlt: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageAlt(imageAlt);
  };

  const handleCloseModal = () => {
    setSelectedImageUrl(null);
    setSelectedImageAlt('');
  };
  const getProgram = (programId: string | null) => {
    if (!programId) return null;
    return programs.find(p => p.id === programId);
  };
  const TimeBlock = ({
    value,
    label
  }: {
    value: number;
    label: string;
  }) => <div className="text-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[50px] sm:min-w-[65px] border border-white/20">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className={`text-xs text-white/70 mt-1 block ${language === 'si' ? 'font-sinhala' : ''}`}>
        {label}
      </span>
    </div>;
  const EventCard = ({
    event
  }: {
    event: SpecialEvent;
  }) => {
    const program = getProgram(event.program_id);
    const timeLeft = timeLeftMap[event.id];
    const eventDate = new Date(event.start_datetime);
    const isExpanded = expandedEventId === event.id;
    const hasLongDescription = event.description && event.description.length > 200;
    return <div className="w-full py-8 sm:py-10 lg:py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
            {/* LEFT SIDE - Event Image */}
            <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-start">
              <button
                onClick={() => handleImageClick(
                  event.image_url || program?.logo_url || '/placeholder.svg',
                  language === 'si' ? event.title_sinhala : event.title_english
                )}
                className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl cursor-pointer group transition-all duration-300 hover:border-white/40 hover:shadow-2xl active:scale-95"
                title="Click to view full image"
              >
                <img
                  src={event.image_url || program?.logo_url || '/placeholder.svg'}
                  alt={language === 'si' ? event.title_sinhala : event.title_english}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    {language === 'si' ? 'පුරා පරිමාණයෙන් බලන්න' : 'View fullscreen'}
                  </div>
                </div>
              </button>
            </div>

            {/* RIGHT SIDE - Content */}
            <div className="flex-1 text-white text-center lg:text-left">
              {/* Section Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 border border-white/20">
                <Calendar className="h-3.5 w-3.5" />
                <span className={`text-xs font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {t('events.title')}
                </span>
              </div>

              {/* Program Name Tag */}
              {program && <div className="mb-2">
                  <span className={`inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? program.name_sinhala : program.name_english}
                  </span>
                </div>}

              {/* Title */}
              <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight ${language === 'si' ? 'font-sinhala' : ''}`} style={{
              fontFamily: language === 'si' ? 'var(--font-sinhala-display)' : 'var(--font-english)'
            }}>
                {language === 'si' ? event.title_sinhala : event.title_english}
              </h2>

              {/* Description */}
              {event.description && <div className="mb-4">
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-none' : 'max-h-24'}`}>
                    <p className={`text-sm sm:text-base text-white/80 leading-relaxed ${language === 'si' ? 'font-sinhala' : ''} ${!isExpanded ? 'line-clamp-3' : ''}`}>
                      {event.description}
                    </p>
                  </div>
                  
                  {/* Read More / Show Less Toggle */}
                  {hasLongDescription && <button 
                    onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                    className="mt-3 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors duration-200 underline"
                  >
                    {isExpanded ? (language === 'si' ? 'කැඩවලින්න' : 'Show Less') : (language === 'si' ? 'තවත් කියවන්න' : 'Read More')}
                  </button>}
                </div>}

              {/* Date & Time */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white/85 mb-5">
                <Clock className="h-4 w-4" />
                <span className={`text-sm ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {eventDate.toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'Asia/Colombo'
                })}
                  {' • '}
                  {eventDate.toLocaleTimeString(language === 'si' ? 'si-LK' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Asia/Colombo'
                })}
                </span>
              </div>

              {/* Countdown Timer */}
              {timeLeft && <div className="mb-5">
                  <p className={`text-xs text-white/60 mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? 'ආරම්භය දක්වා' : 'Starts in'}
                  </p>
                  <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start">
                    <TimeBlock value={timeLeft.days} label={t('events.days')} />
                    <TimeBlock value={timeLeft.hours} label={t('events.hours')} />
                    <TimeBlock value={timeLeft.minutes} label={t('events.minutes')} />
                    <TimeBlock value={timeLeft.seconds} label={t('events.seconds')} />
                  </div>
                </div>}

              {/* WhatsApp Button */}
              <Button onClick={() => handleWhatsAppJoin(event)} size="default" className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 text-sm px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <MessageCircle className="h-4 w-4" />
                <span className={language === 'si' ? 'font-sinhala' : ''}>
                  {t('events.joinWhatsApp')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>;
  };

  // Single event - no carousel needed
  if (activeEvents.length === 1) {
    return <section className="relative w-full bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(0,75%,30%)] to-[hsl(0,80%,22%)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03)_0%,_transparent_50%)] border-slate-600" />
        
        <EventCard event={activeEvents[0]} />
        
        <ImageModal
          isOpen={selectedImageUrl !== null}
          imageUrl={selectedImageUrl || ''}
          imageAlt={selectedImageAlt}
          onClose={handleCloseModal}
        />
      </section>;
  }

  // Multiple events - carousel with auto-sliding
  return <section className="relative w-full bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(0,75%,30%)] to-[hsl(0,80%,22%)] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

      {/* Carousel */}
      <div className="relative z-10" ref={emblaRef}>
        <div className="flex">
          {activeEvents.map(event => <div key={event.id} className="flex-none w-full">
              <EventCard event={event} />
            </div>)}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20">
        <Button variant="outline" size="icon" className="h-10 w-10 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm" onClick={scrollPrev}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20">
        <Button variant="outline" size="icon" className="h-10 w-10 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm" onClick={scrollNext}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {activeEvents.map((_, index) => <button key={index} onClick={() => emblaApi?.scrollTo(index)} className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} aria-label={`Go to slide ${index + 1}`} />)}
      </div>

      <ImageModal
        isOpen={selectedImageUrl !== null}
        imageUrl={selectedImageUrl || ''}
        imageAlt={selectedImageAlt}
        onClose={handleCloseModal}
      />
    </section>;
}