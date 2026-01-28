import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Heart, Eye, Users, Tv } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import jayaTvLogo from '@/assets/jaya-tv-logo.gif';

export default function About() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const stats = [
    { icon: Tv, value: '24/7', label: { si: 'සජීවී විකාශය', en: 'Live Broadcast' } },
    { icon: Users, value: '50+', label: { si: 'ස්වාමීන් වහන්සේලා', en: 'Monks' } },
    { icon: Eye, value: '1M+', label: { si: 'නරඹන්නන්', en: 'Viewers' } },
    { icon: Heart, value: '8+', label: { si: 'වැඩසටහන්', en: 'Programs' } },
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'අප ගැන - ජය ටීවී' : 'About Us - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී - ශ්‍රී ලංකාවේ ප්‍රමුඛ බෞද්ධ රූපවාහිනී නාලිකාව ගැන දැන ගන්න.' 
            : 'Learn about Jaya TV - Sri Lanka\'s leading Buddhist television channel.'
          } 
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto text-center"
              >
                <img 
                  src={jayaTvLogo} 
                  alt="Jaya TV Logo" 
                  className="h-24 md:h-32 w-auto mx-auto mb-8"
                />
                <h1 className={`text-3xl md:text-5xl font-bold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' ? 'ජය ටීවී ගැන' : 'About Jaya TV'}
                </h1>
                <p className={`text-lg text-muted-foreground leading-relaxed ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {language === 'si' 
                    ? 'ජය ටීවී යනු ශ්‍රී ලංකාවේ ප්‍රමුඛ බෞද්ධ රූපවාහිනී නාලිකාවකි. අප ධර්මය ඔබේ නිවසට ගෙන ඒම සඳහා කැපවී සිටිමු. දිවා රෑ 24 පැය, සතියේ දින 7ම ධර්ම දේශනා, භාවනා වැඩසටහන් සහ ආධ්‍යාත්මික අන්තර්ගතය ඔබ වෙත ගෙන එන්නෙමු.'
                    : 'Jaya TV is Sri Lanka\'s leading Buddhist television channel. We are dedicated to bringing Dharma to your home. 24 hours a day, 7 days a week, we deliver Dharma sermons, meditation programs, and spiritual content to you.'
                  }
                </p>
              </motion.div>
            </div>
          </section>

          {/* Stats */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <p className={`text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                      {stat.label[language]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Vision & Mission Section */}
          <section className="py-16 md:py-24 bg-jaya-deep-red">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-16">
                {/* Vision Block */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-block mb-8">
                    <span className={`px-6 py-3 bg-jaya-gold font-bold text-lg md:text-xl rounded-md shadow-lg ${
                      theme === 'light' 
                        ? 'text-jaya-deep-red' 
                        : 'text-jaya-deep-red'
                    }`}>
                      VISION
                    </span>
                  </div>
                  <p className={`sinhala-text text-xl md:text-2xl leading-relaxed mb-4 ${
                    theme === 'light' 
                      ? 'text-gray-900' 
                      : 'text-white'
                  }`}>
                    "ලෞකික ජයග්‍රහණයන් උදෙසා බුද්ධිමය හා තාර්කික මාධ්‍ය ජාලයක් ලෙස කටයුතු කිරීම"
                  </p>
                  <p className={`english-text text-lg md:text-xl italic leading-relaxed ${
                    theme === 'light' 
                      ? 'text-gray-800' 
                      : 'text-white/80'
                  }`}>
                    "To function as an intellectual and logical media network for worldly success"
                  </p>
                </motion.div>

                {/* Divider */}
                <div className="w-24 h-px bg-jaya-gold/50 mx-auto" />

                {/* Mission Block */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="inline-block mb-8">
                    <span className={`px-6 py-3 bg-jaya-gold font-bold text-lg md:text-xl rounded-md shadow-lg ${
                      theme === 'light' 
                        ? 'text-jaya-deep-red' 
                        : 'text-jaya-deep-red'
                    }`}>
                      MISSION
                    </span>
                  </div>
                  <p className={`sinhala-text text-xl md:text-2xl leading-relaxed mb-4 ${
                    theme === 'light' 
                      ? 'text-gray-900' 
                      : 'text-white'
                  }`}>
                    "මාධ්‍ය තාක්ෂණය භාවිතයෙන් බෞද්ධ පුනර්ජීවනය හා සදාචාරය සඳහා විචාරශීලී කථනයට පසුබිම් සැකසීම"
                  </p>
                  <p className={`english-text text-lg md:text-xl italic leading-relaxed ${
                    theme === 'light' 
                      ? 'text-gray-800' 
                      : 'text-white/80'
                  }`}>
                    "To create a platform for critical dialogue on Buddhist revival and ethics using media technology"
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
