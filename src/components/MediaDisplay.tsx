import React, { useRef, useEffect } from 'react';
import { Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface MediaDisplayProps {
  mediaUrls: string[] | null;
  mediaTypes: string[] | null;
  className?: string;
}

export const MediaDisplay = ({ mediaUrls, mediaTypes, className = '' }: MediaDisplayProps) => {
  if (!mediaUrls || !mediaTypes || mediaUrls.length === 0) {
    return null;
  }

  const getGridClasses = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2';
      default:
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  const getItemClasses = (index: number, total: number) => {
    if (total === 3 && index === 0) {
      return 'sm:col-span-2';
    }
    return '';
  };

  const VideoPlayer = ({ src, index }: { src: string; index: number }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {
                // Autoplay failed, which is fine
              });
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(video);

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <video
        ref={videoRef}
        src={src}
        className="w-full h-96 sm:h-[400px] md:h-[600px] object-cover"
        controls
        preload="metadata"
        muted
        loop
        playsInline
      />
    );
  };

  return (
    <div className={`grid gap-1 ${getGridClasses(mediaUrls.length)} ${className} w-full`}>
      {mediaUrls.map((url, index) => {
        const type = mediaTypes[index];
        const isVideo = type === 'video';

        return (
          <div
            key={index}
            className={`relative group overflow-hidden bg-muted ${getItemClasses(index, mediaUrls.length)} w-full`}
          >
            {isVideo ? (
              <VideoPlayer src={url} index={index} />
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <img
                    src={url}
                    alt="Post media"
                    className="w-full h-96 sm:h-[400px] md:h-[600px] object-cover cursor-pointer transition-transform group-hover:scale-105"
                  />
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <div className="relative">
                    <img
                      src={url}
                      alt="Post media"
                      className="w-full h-auto max-h-[85vh] object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      })}
    </div>
  );
};