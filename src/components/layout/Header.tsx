import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import jayaTvLogo from '@/assets/jaya-tv-logo.png';
import SearchDialog from '@/components/search/SearchDialog';

interface NavItem {
  key: string;
  path?: string;
  dropdown?: { key: string; path: string }[];
}

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreachersOpen, setIsPreachersOpen] = useState(false);
  const [mobilePreachersOpen, setMobilePreachersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const navItems: NavItem[] = [
    { key: 'nav.home', path: '/' },
    { key: 'nav.liveTV', path: '/live' },
    { key: 'nav.programs', path: '/programs' },
    { 
      key: 'nav.preachers',
      dropdown: [
        { key: 'nav.monks', path: '/monks' },
        { key: 'nav.laySpeakers', path: '/lay-speakers' },
      ]
    },
    { key: 'nav.schedule', path: '/schedule' },
    { key: 'nav.mediaLibrary', path: '/media' },
    { key: 'nav.about', path: '/about' },
    { key: 'nav.contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isPreachersActive = location.pathname === '/monks' || location.pathname === '/lay-speakers';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPreachersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={jayaTvLogo} 
                alt="Jaya TV Logo" 
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                item.dropdown ? (
                  <div key={item.key} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsPreachersOpen(!isPreachersOpen)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        language === 'si' ? 'font-sinhala' : ''
                      } ${
                        isPreachersActive
                          ? 'text-primary bg-primary/5'
                          : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {t(item.key)}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isPreachersOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isPreachersOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setIsPreachersOpen(false)}
                              className={`block px-4 py-3 text-sm font-medium transition-colors ${
                                language === 'si' ? 'font-sinhala' : ''
                              } ${
                                isActive(subItem.path)
                                  ? 'text-primary bg-primary/10'
                                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                              }`}
                            >
                              {t(subItem.key)}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path!}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      language === 'si' ? 'font-sinhala' : ''
                    } ${
                      isActive(item.path!)
                        ? 'text-primary bg-primary/5'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                )
              ))}
              
              {/* Request Dharma Deshana CTA Button */}
              <Link
                to="/request-dharma-deshana"
                className={`ml-2 px-4 py-2 text-sm font-medium rounded-md transition-all bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 ${
                  language === 'si' ? 'font-sinhala' : ''
                } ${
                  isActive('/request-dharma-deshana')
                    ? 'text-primary bg-primary/20 border-primary/50'
                    : 'text-primary'
                }`}
              >
                {t('nav.requestDharmaDeshana')}
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-foreground/70 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Language Toggle */}
              <div className="flex items-center bg-secondary rounded-full p-1">
                <button
                  onClick={() => setLanguage('si')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    language === 'si'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  සිං
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-background"
            >
              <nav className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-1">
                {navItems.map((item) => (
                  item.dropdown ? (
                    <div key={item.key}>
                      <button
                        onClick={() => setMobilePreachersOpen(!mobilePreachersOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                          language === 'si' ? 'font-sinhala' : ''
                        } ${
                          isPreachersActive
                            ? 'text-primary bg-primary/5'
                            : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                        }`}
                      >
                        {t(item.key)}
                        <ChevronDown className={`h-5 w-5 transition-transform ${mobilePreachersOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {mobilePreachersOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pl-4 space-y-1"
                          >
                            {item.dropdown.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  setMobilePreachersOpen(false);
                                }}
                                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                                  language === 'si' ? 'font-sinhala' : ''
                                } ${
                                  isActive(subItem.path)
                                    ? 'text-primary bg-primary/5'
                                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                                }`}
                              >
                                {t(subItem.key)}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path!}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        language === 'si' ? 'font-sinhala' : ''
                      } ${
                        isActive(item.path!)
                          ? 'text-primary bg-primary/5'
                          : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {t(item.key)}
                    </Link>
                  )
                ))}
                
                {/* Mobile Request Dharma Deshana CTA */}
                <Link
                  to="/request-dharma-deshana"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-all bg-primary/10 border border-primary/30 mt-2 ${
                    language === 'si' ? 'font-sinhala' : ''
                  } ${
                    isActive('/request-dharma-deshana')
                      ? 'text-primary bg-primary/20 border-primary/50'
                      : 'text-primary'
                  }`}
                >
                  {t('nav.requestDharmaDeshana')}
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Dialog */}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
