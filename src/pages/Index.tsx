import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import SpecialEventBanner from '@/components/home/SpecialEventBanner';
import FeaturedPrograms from '@/components/home/FeaturedPrograms';
import FeaturedMonks from '@/components/home/FeaturedMonks';
import TodaySchedule from '@/components/home/TodaySchedule';
import SocialFloatingBar from '@/components/home/SocialFloatingBar';

const Index = () => {
  const { language } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'ජය ටීවී' : 'Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී - ශ්‍රී ලංකාවේ ප්‍රමුඛ බෞද්ධ රූපවාහිනී නාලිකාව. සජීවී ධර්ම දේශනා, භාවනා වැඩසටහන්.' 
            : 'Jaya TV - Sri Lanka\'s leading Buddhist television channel. Live Dharma sermons, meditation programs.'
          } 
        />
      </Helmet>

      <div className="min-h-screen w-full flex flex-col">
        <Header />
        
        <main className="flex-1">
          <HeroSection />
          <SpecialEventBanner />
          <FeaturedPrograms />
          <FeaturedMonks />
          <TodaySchedule />
        </main>

        <Footer />
        <SocialFloatingBar />
      </div>
    </>
  );
};

export default Index;
