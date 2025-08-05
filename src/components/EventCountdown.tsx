import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const EventCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventHappening, setIsEventHappening] = useState(false);
  const [timeUntilEventEnds, setTimeUntilEventEnds] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Get the next event date - Aug 19th, 2025 at 7:00 PM
  const getNextEventDate = () => {
    const now = new Date();
    const nextEvent = new Date(2025, 7, 19, 19, 0, 0, 0); // Aug 19, 2025, 7:00 PM
    
    // If the Aug 19th event hasn't happened yet, return it
    if (now < nextEvent) {
      return nextEvent;
    }
    
    // If Aug 19th has passed, calculate next Tuesday at 7:00 PM
    const nextTuesday = new Date();
    const currentDay = now.getDay();
    
    let daysUntilTuesday;
    if (currentDay === 2) {
      // It's Tuesday - check if event time has passed
      if (now.getHours() >= 19) {
        // Past 7 PM, so next Tuesday is in 7 days
        daysUntilTuesday = 7;
      } else {
        // Before 7 PM, so today is the event day
        daysUntilTuesday = 0;
      }
    } else {
      // Not Tuesday - calculate days until next Tuesday
      daysUntilTuesday = (2 - currentDay + 7) % 7;
      if (daysUntilTuesday === 0) daysUntilTuesday = 7;
    }
    
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    nextTuesday.setHours(19, 0, 0, 0); // 7:00 PM
    
    return nextTuesday;
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextEventDate = getNextEventDate();
      const eventEndTime = new Date(nextEventDate.getTime() + (4 * 60 * 60 * 1000)); // Event + 4 hours
      
      const currentTime = now.getTime();
      const eventStartTime = nextEventDate.getTime();
      const eventEndTimeMs = eventEndTime.getTime();

      // Check if event is currently happening (between start and start + 4 hours)
      if (currentTime >= eventStartTime && currentTime <= eventEndTimeMs) {
        // Event is happening now
        setIsEventHappening(true);
        
        // Calculate time until event ends
        const timeUntilEnd = eventEndTimeMs - currentTime;
        const hours = Math.floor(timeUntilEnd / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilEnd % (1000 * 60)) / 1000);
        
        setTimeUntilEventEnds({ days: 0, hours, minutes, seconds });
      } else {
        // Event is not happening, show countdown to next event
        setIsEventHappening(false);
        
        const difference = eventStartTime - currentTime;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextEventDate = getNextEventDate();

  const formatEventDate = () => {
    return nextEventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatEventTime = () => {
    return nextEventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isEventHappening) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-background to-emerald-500/10 border border-green-500/30 shadow-lg">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 mb-4">
            <span className="text-3xl animate-pulse">🔥</span>
          </div>
          <h3 className="text-2xl font-bold text-green-500 mb-2">Happening Now!</h3>
          <p className="text-muted-foreground mb-4">SkateBurn is live! The event is happening right now!</p>
          
          {/* Time until event ends */}
          <div className="inline-flex items-center gap-2 text-sm text-green-600 bg-green-500/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-500/30 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Ends in {String(timeUntilEventEnds.hours).padStart(2, '0')}:{String(timeUntilEventEnds.minutes).padStart(2, '0')}:{String(timeUntilEventEnds.seconds).padStart(2, '0')}</span>
          </div>
          
          <p className="text-xs text-muted-foreground">See you on the ramps! 🛹✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/20 shadow-lg">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-xl"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-3">
            <span className="text-xl">🔥</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Next SkateBurn Event</h3>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{formatEventDate()}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatEventTime()}</span>
            </div>
          </div>
        </div>
        
        {/* Countdown Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: timeLeft.days, label: 'D' },
            { value: timeLeft.hours, label: 'H' },
            { value: timeLeft.minutes, label: 'M' },
            { value: timeLeft.seconds, label: 'S' }
          ].map((item, index) => (
            <div 
              key={item.label}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-background/80 backdrop-blur-sm rounded-lg border border-border/40 p-4 text-center transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:scale-105">
                <div className="text-2xl font-bold text-primary mb-1 font-mono tracking-tight">
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {item.label}
                </div>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"></div>
            </div>
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-background/40 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30">
            <span>Get ready to drop in!</span>
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>🛹</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};