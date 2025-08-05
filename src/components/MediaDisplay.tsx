import React, { useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

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
        className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
        controls
        preload="metadata"
        muted
        loop
        playsInline
      />
    );
  };

  return (
    <div className={`grid gap-2 ${getGridClasses(mediaUrls.length)} ${className} max-w-full overflow-hidden`}>
      {mediaUrls.map((url, index) => {
        const type = mediaTypes[index];
        const isVideo = type === 'video';

        return (
          <div
            key={index}
            className={`relative group overflow-hidden rounded-lg bg-muted ${getItemClasses(index, mediaUrls.length)} max-w-full`}
          >
            {isVideo ? (
              <VideoPlayer src={url} index={index} />
            ) : (
              <img
                src={url}
                alt="Post media"
                className="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer transition-transform group-hover:scale-105 rounded-lg"
                onClick={() => window.open(url, '_blank')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};