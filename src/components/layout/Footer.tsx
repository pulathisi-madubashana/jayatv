import { Link } from 'react-router-dom';
import { Facebook, Youtube, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import jayaTvLogo from '@/assets/jaya-tv-logo.png';

// TikTok icon component since Lucide doesn't have it
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const { t, language } = useLanguage();

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/Jayatv.lk', label: 'Facebook' },
    { icon: Youtube, href: 'https://www.youtube.com/@JayaTVLK', label: 'YouTube' },
    { icon: TikTokIcon, href: 'https://www.tiktok.com/@jayatv_srilanka', label: 'TikTok' },
    { icon: MessageCircle, href: 'https://wa.me/94716280166', label: 'WhatsApp' },
  ];

  return (
    <footer className="w-full bg-secondary">
      {/* Elegant Red Glow Line (thin, full-width, subtle shimmer) */}
      <div className="w-full h-px relative overflow-hidden">
        {/* Soft base line (very low opacity red) */}
        <div className="absolute inset-0 bg-[rgba(220,36,36,0.08)]" />

        {/* Slow moving shimmer - gentle left-to-right gradient */}
        <div
          className="absolute -left-1/4 top-0 h-px w-1/2 rounded-full bg-gradient-to-r from-transparent via-[rgba(220,36,36,0.55)] to-transparent opacity-90 blur-sm"
          style={{ animation: 'shimmer-slow 8s linear infinite', willChange: 'transform, opacity' }}
        />

        {/* Ambient glow for soft bloom (non-animated, subtle) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: '0 0 18px rgba(220,36,36,0.06), 0 0 6px rgba(220,36,36,0.03)' }}
        />
      </div>

      {/* Main Footer Content - balanced 4-column grid */}
      <div className="w-full px-6 sm:px- lg:px-10 py-8 lg:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-8 items-start">
          {/* Column 1: Logo + description */}
          <div className="flex flex-col items-center lg:items-start space-y-4">
            {/* reserve heading height so all headings align */}
            <h3 className="invisible text-white text-xl font-semibold mb-3">Logo</h3>
            <img src={jayaTvLogo} alt="Jaya TV Logo" className="h-16 w-auto object-contain" />
            <p className={`text-base text-gray-700 dark:text-gray-300 ${language === 'si' ? 'font-sinhala leading-7' : 'leading-relaxed'}`}>
              {t('footer.quote')}
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={`text-black dark:text-white text-xl font-semibold mb-3 ${language === 'si' ? 'font-sinhala' : ''}`}>{language === 'si' ? 'සබැඳි' : 'Links'}</h3>
            <nav className="flex flex-col space-y-3">
              <Link to="/programs" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.programs')}</Link>
              <Link to="/monks" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.monks')}</Link>
              <Link to="/schedule" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.schedule')}</Link>
              <Link to="/request-dharma-deshana" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{language === 'si' ? 'ධර්ම දේශනා' : 'Request Dharma'}</Link>
              <Link to="/contact" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.contact')}</Link>
            </nav>
          </div>

          {/* Column 3: Programs */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className={`text-black dark:text-white text-xl font-semibold mb-3 ${language === 'si' ? 'font-sinhala' : ''}`}>{language === 'si' ? 'වැඩසටහන්' : 'Programs'}</h3>
            <nav className="flex flex-col space-y-3">
              <Link to="/live" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.liveTV')}</Link>
              <Link to="/media" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.mediaLibrary')}</Link>
              <Link to="/about" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.about')}</Link>
              <Link to="/lay-speakers" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.laySpeakers')}</Link>
              <Link to="/programs" className={`text-base text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-200 ${language === 'si' ? 'font-sinhala' : ''}`}>{t('nav.programs')}</Link>
            </nav>
          </div>

          {/* Column 4: Contact (balanced) */}
          <div className="flex flex-col items-center sm:items-start space-y-4">
            <h3 className="text-black dark:text-white text-xl font-semibold mb-3">{t('footer.contact')}</h3>
            <div className={`flex flex-col items-center sm:items-start space-y-3 text-base text-gray-800 dark:text-gray-200 ${language === 'si' ? 'font-sinhala leading-7' : 'leading-relaxed'}`}>
              <a href="mailto:info@jayatv.lk" className="flex items-center gap-3 hover:text-primary transition-colors duration-200">
                <span className="flex-none w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M22 6l-10 7L2 6" /></svg>
                </span>
                <span className="text-gray-800 dark:text-gray-200">jayamagam@gmail.com</span>
              </a>

              <a href="tel:+94716280166" className="flex items-center gap-3 hover:text-primary transition-colors duration-200">
                <span className="flex-none w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.97.38 1.91.76 2.79a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.29-1.29a2 2 0 0 1 2.11-.45c.88.38 1.82.64 2.79.76A2 2 0 0 1 22 16.92z" /></svg>
                </span>
                <span className="text-gray-800 dark:text-gray-200">+94 71 628 0166</span>
              </a>

              <div className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                <span className="flex-none w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] dark:bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </span>
                <span className="text-gray-800 dark:text-gray-200">International Vipassana Meditation Centre, No.180, Vijerama Road, Colombo 7</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-2 justify-center sm:justify-start">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#0b0b0b] flex items-center justify-center text-gray-300 hover:text-primary hover:bg-[rgba(220,36,36,0.08)] transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-border">
          <p className={`text-center text-sm lg:text-base text-gray-600 dark:text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
            {t('footer.copyright')}{' '}
            <a 
              href="https://pulathisi-madubashana.github.io/site/index.html#home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors duration-200"
            >
              {t('footer.designedBy')}
            </a>
          </p>
        </div>
      </div>

      <style>{`
        /* Slow, subtle shimmer that moves left->right using transform+opacity for better perf */
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-30%);
            opacity: 0.45;
          }
          50% {
            transform: translateX(30%);
            opacity: 0.85;
          }
          100% {
            transform: translateX(130%);
            opacity: 0.45;
          }
        }
      `}</style>
    </footer>
  );
}
