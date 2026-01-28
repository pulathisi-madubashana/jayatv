import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Youtube, MessageCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Contact() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    { 
      icon: Mail, 
      label: { si: 'විද්‍යුත් තැපෑල', en: 'Email' }, 
      value: 'info@jayatv.lk',
      href: 'mailto:info@jayatv.lk'
    },
    { 
      icon: Phone, 
      label: { si: 'දුරකථනය', en: 'Phone' }, 
      value: '+94 11 XXX XXXX',
      href: 'tel:+9411XXXXXXX'
    },
    { 
      icon: MapPin, 
      label: { si: 'ලිපිනය', en: 'Address' }, 
      value: language === 'si' ? 'කොළඹ, ශ්‍රී ලංකාව' : 'Colombo, Sri Lanka',
      href: '#'
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/jayatv', label: 'Facebook' },
    { icon: Youtube, href: 'https://youtube.com/jayatv', label: 'YouTube' },
    { icon: TikTokIcon, href: 'https://tiktok.com/@jayatv', label: 'TikTok' },
    { icon: MessageCircle, href: 'https://wa.me/94XXXXXXXXX', label: 'WhatsApp' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: language === 'si' ? 'අසම්පූර්ණයි' : 'Incomplete',
        description: language === 'si' 
          ? 'කරුණාකර සියලු ක්ෂේත්‍ර පුරවන්න' 
          : 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          sender_name: formData.name.trim(),
          sender_email: formData.email.trim(),
          message: formData.message.trim(),
        });

      if (error) throw error;

      toast({
        title: language === 'si' ? 'සාර්ථකයි!' : 'Success!',
        description: language === 'si' 
          ? 'ඔබේ පණිවිඩය සාර්ථකව එවන ලදී' 
          : 'Your message has been sent successfully',
      });

      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      toast({
        title: language === 'si' ? 'දෝෂයක්' : 'Error',
        description: error.message || (language === 'si' 
          ? 'පණිවිඩය එවීමට අසමත් විය' 
          : 'Failed to send message'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{language === 'si' ? 'සම්බන්ධ වන්න - ජය ටීවී' : 'Contact Us - Jaya TV'}</title>
        <meta 
          name="description" 
          content={language === 'si' 
            ? 'ජය ටීවී සමඟ සම්බන්ධ වන්න. ඔබේ අදහස් සහ යෝජනා අප වෙත එවන්න.' 
            : 'Contact Jaya TV. Send us your thoughts and suggestions.'
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
              className="text-center mb-12"
            >
              <h1 className={`text-3xl md:text-5xl font-bold text-foreground mb-4 ${language === 'si' ? 'font-sinhala' : ''}`}>
                {t('nav.contact')}
              </h1>
              <p className={`text-lg text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                {language === 'si' 
                  ? 'ඔබේ අදහස් සහ යෝජනා අප වෙත එවන්න' 
                  : 'Send us your thoughts and suggestions'
                }
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className={`text-xl font-semibold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? 'පණිවිඩයක් එවන්න' : 'Send a Message'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className={`block text-sm font-medium text-foreground mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'ඔබේ නම' : 'Your Name'}
                      </label>
                      <Input 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === 'si' ? 'නම ඇතුළත් කරන්න' : 'Enter your name'}
                        className={language === 'si' ? 'font-sinhala' : ''}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-foreground mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'විද්‍යුත් තැපෑල' : 'Email'}
                      </label>
                      <Input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={language === 'si' ? 'විද්‍යුත් තැපෑල ඇතුළත් කරන්න' : 'Enter your email'}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium text-foreground mb-2 ${language === 'si' ? 'font-sinhala' : ''}`}>
                        {language === 'si' ? 'පණිවිඩය' : 'Message'}
                      </label>
                      <Textarea 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={language === 'si' ? 'ඔබේ පණිවිඩය ලියන්න...' : 'Write your message...'}
                        rows={5}
                        className={language === 'si' ? 'font-sinhala' : ''}
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className={language === 'si' ? 'font-sinhala' : ''}>
                        {isSubmitting 
                          ? (language === 'si' ? 'එවමින්...' : 'Sending...') 
                          : (language === 'si' ? 'එවන්න' : 'Send Message')
                        }
                      </span>
                    </Button>
                  </form>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                {/* Contact Details */}
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className={`text-xl font-semibold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? 'සම්බන්ධතා තොරතුරු' : 'Contact Information'}
                  </h2>

                  <div className="space-y-5">
                    {contactInfo.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="flex items-start gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className={`text-sm text-muted-foreground ${language === 'si' ? 'font-sinhala' : ''}`}>
                            {item.label[language]}
                          </p>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                  <h2 className={`text-xl font-semibold text-foreground mb-6 ${language === 'si' ? 'font-sinhala' : ''}`}>
                    {language === 'si' ? 'සමාජ මාධ්‍ය' : 'Follow Us'}
                  </h2>

                  <div className="flex gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
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