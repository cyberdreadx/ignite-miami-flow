import React from 'react';
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
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2';
      default:
        return 'grid-cols-2';
    }
  };

  const getItemClasses = (index: number, total: number) => {
    if (total === 3 && index === 0) {
      return 'col-span-2';
    }
    return '';
  };

  return (
    <div className={`grid gap-2 ${getGridClasses(mediaUrls.length)} ${className}`}>
      {mediaUrls.map((url, index) => {
        const type = mediaTypes[index];
        const isVideo = type === 'video';

        return (
          <div
            key={index}
            className={`relative group overflow-hidden rounded-lg bg-muted ${getItemClasses(index, mediaUrls.length)}`}
          >
            {isVideo ? (
              <div className="relative">
                <video
                  src={url}
                  className="w-full h-48 object-cover"
                  controls
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ) : (
                <img
                  src={url}
                  alt="Post media"
                  className="w-full object-contain cursor-pointer transition-transform group-hover:scale-105 max-h-96"
                  onClick={() => window.open(url, '_blank')}
                />
            )}
          </div>
        );
      })}
    </div>
  );
};