import { motion } from 'framer-motion';
import { Facebook, Youtube, MessageCircle } from 'lucide-react';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { icon: Facebook, href: 'https://www.facebook.com/Jayatv.lk', label: 'Facebook', color: 'hover:bg-blue-600' },
  { icon: Youtube, href: 'https://www.youtube.com/@JayaTVLK', label: 'YouTube', color: 'hover:bg-red-600' },
  { icon: TikTokIcon, href: 'https://www.tiktok.com/@jayatv_srilanka', label: 'TikTok', color: 'hover:bg-gray-800' },
  { icon: MessageCircle, href: 'https://wa.me/94716280166', label: 'WhatsApp', color: 'hover:bg-green-600' },
];

export default function SocialFloatingBar() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2"
    >
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
          className={`w-10 h-10 rounded-full bg-background shadow-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white transition-all ${social.color}`}
          aria-label={social.label}
        >
          <social.icon className="h-5 w-5" />
        </motion.a>
      ))}
    </motion.div>
  );
}
