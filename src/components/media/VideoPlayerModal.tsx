import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeId: string;
  title: string;
}

export default function VideoPlayerModal({ isOpen, onClose, youtubeId, title }: VideoPlayerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Title */}
            <div className="absolute -top-12 left-0 text-white font-medium truncate max-w-[80%]">
              {title}
            </div>

            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
