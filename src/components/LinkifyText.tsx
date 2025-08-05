import React from 'react';

interface LinkifyTextProps {
  text: string;
  className?: string;
}

export const LinkifyText = ({ text, className = '' }: LinkifyTextProps) => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
};