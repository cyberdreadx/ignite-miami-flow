/**
 * Handle external links in PWA to open in main browser instead of new PWA window
 * This addresses the Safari PWA issue where external links create new PWA instances
 */

export const openExternalLink = (url: string) => {
  // Check if we're in a PWA context
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
               (window.navigator as any).standalone || 
               document.referrer.includes('android-app://');

  if (isPWA && isExternalUrl(url)) {
    // For PWAs, force external links to open in main browser
    // This creates a new tab/window in the main browser instead of a new PWA window
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Add specific attributes for iOS Safari PWA
    link.setAttribute('data-external', 'true');
    
    // Temporarily add to DOM and click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // For regular browser, use normal behavior
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
};

/**
 * Hook to handle clicks on external links
 */
export const useExternalLinkHandler = () => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.href;
    
    if (isExternalUrl(href)) {
      event.preventDefault();
      openExternalLink(href);
    }
  };

  return { handleExternalClick: handleClick };
};