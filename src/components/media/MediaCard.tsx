import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Headphones, FileText, Play, Image, Download, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaItem, getYouTubeThumbnail } from '@/data/mediaData';
import { programsData } from '@/data/programs';
import { monksData } from '@/data/monks';
import VideoPlayerModal from './VideoPlayerModal';

const typeIcons = {
  video: Video,
  audio: Headphones,
  photo: Image,
  pdf: FileText,
};

const typeLabels = {
  video: { si: 'වීඩියෝ', en: 'Video' },
  audio: { si: 'ශ්‍රව්‍ය', en: 'Audio' },
  photo: { si: 'ඡායාරූප', en: 'Photo' },
  pdf: { si: 'ලේඛනය', en: 'Document' },
};

const typeBadgeColors = {
  video: 'bg-red-600',
  audio: 'bg-amber-600',
  photo: 'bg-emerald-600',
  pdf: 'bg-blue-600',
};

interface MediaCardProps {
  item: MediaItem;
  language: 'si' | 'en';
  index: number;
  onPhotoClick?: () => void;
}

export default function MediaCard({ item, language, index, onPhotoClick }: MediaCardProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const Icon = typeIcons[item.type];
  const program = programsData.find(p => p.id === item.programId);
  const monk = monksData.find(m => m.id === item.monkId);

  // Get thumbnail - use YouTube thumbnail for YouTube videos
  const getThumbnail = () => {
    if (item.thumbnail) return item.thumbnail;
    if (item.youtubeId) return getYouTubeThumbnail(item.youtubeId);
    return null;
  };

  const thumbnail = getThumbnail();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'si' ? 'si-LK' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Colombo'
    });
  };

  const handleCardClick = () => {
    if (item.type === 'photo' && onPhotoClick) {
      onPhotoClick();
    } else if (item.type === 'video' && item.youtubeId) {
      setIsVideoModalOpen(true);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = item.downloadUrl || item.driveDownloadUrl || item.url;
    if (downloadUrl) {
      // Create hidden link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.title[language];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isClickable = item.type === 'photo' || (item.type === 'video' && item.youtubeId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`bg-card rounded-xl border border-border overflow-hidden card-hover group ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="aspect-video bg-secondary flex items-center justify-center relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.title[language]}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Icon className="h-16 w-16 mb-2 opacity-50" />
              <span className="text-sm">{typeLabels[item.type][language]}</span>
            </div>
          )}

          {/* Play overlay for videos */}
          {item.type === 'video' && item.youtubeId && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
            </div>
          )}

          {/* Duration badge */}
          {item.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.duration}
            </div>
          )}

          {/* Type badge */}
          <div className={`absolute top-2 left-2 ${typeBadgeColors[item.type]} text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md`}>
            <Icon className="h-3.5 w-3.5" />
            {typeLabels[item.type][language]}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className={`font-semibold text-foreground mb-2 line-clamp-2 ${language === 'si' ? 'font-sinhala text-base' : 'text-sm'}`}>
            {item.title[language]}
          </h3>

          {/* Date - Larger and more visible */}
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="h-4 w-4 text-primary" />
            <span className={`text-sm font-medium ${language === 'si' ? 'font-sinhala' : ''}`}>
              {formatDate(item.date)}
            </span>
          </div>

          {/* Program/Monk tags */}
          {(program || monk) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {program && (
                <span className={`text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {program.name[language]}
                </span>
              )}
              {monk && (
                <span className={`text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md ${language === 'si' ? 'font-sinhala' : ''}`}>
                  {monk.name[language]}
                </span>
              )}
            </div>
          )}

          {/* Download button */}
          {item.downloadable && (item.downloadUrl || item.driveDownloadUrl || item.url || item.thumbnail) && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              {language === 'si' ? 'බාගන්න' : 'Download'}
            </Button>
          )}
        </div>
      </motion.div>

      {/* YouTube Video Modal */}
      {item.youtubeId && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          youtubeId={item.youtubeId}
          title={item.title[language]}
        />
      )}
    </>
  );
}
