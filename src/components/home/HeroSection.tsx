import { Play, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import BuddhistBackground from './BuddhistBackground';
import heroBackground from '@/assets/hero-background.jpg';
import jayaTvLogo from '@/assets/jaya-tv-logo.png';

export default function HeroSection() {
  const { t, language } = useLanguage();

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Buddhist themed background animation */}
      <BuddhistBackground />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Home Logo */}
            <div className="mb-8 flex justify-center lg:justify-start">
              <img
                src={jayaTvLogo}
                alt="Jaya TV Logo"
                className="h-20 sm:h-24 md:h-28 lg:h-32 object-contain"
              />
            </div>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {language === 'si' ? 'සජීවී ප්‍රසාරණය' : 'Live Broadcasting'}
            </span>
            
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 lg:mb-6"
              style={{ fontFamily: language === 'si' ? 'var(--font-sinhala-display)' : 'var(--font-english)' }}
            >
              {t('home.hero.title')}
            </h1>
            <p className={`text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 lg:mb-8 max-w-lg mx-auto lg:mx-0 ${language === 'si' ? 'font-sinhala' : ''}`}>
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-base gap-2">
                <Link to="/live">
                  <Play className="h-5 w-5" />
                  <span className={language === 'si' ? 'font-sinhala' : ''}>
                    {t('home.hero.watchLive')}
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base gap-2 border-primary/30 hover:bg-primary/10">
                <Link to="/schedule">
                  <Calendar className="h-5 w-5" />
                  <span className={language === 'si' ? 'font-sinhala' : ''}>
                    {t('home.hero.viewSchedule')}
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Live Stream Preview */}
          <div className="relative w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
              {/* Live Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2 bg-primary px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                <span className="w-2 h-2 bg-primary-foreground rounded-full live-pulse" />
                <span className={`text-xs sm:text-sm font-medium text-primary-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {t('home.liveNow')}
                </span>
              </div>

              {/* YouTube Embed Placeholder - Replace with actual embed */}
              <iframe
                src="https://www.youtube.com/embed/0zXte8iwNp4?si=rRfV80yfpSl-CmEd"
                title="Jaya TV Live Stream"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
