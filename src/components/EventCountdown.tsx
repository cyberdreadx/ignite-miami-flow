import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const EventCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEventPassed, setIsEventPassed] = useState(false);

  // Calculate next Tuesday at 7:00 PM
  const getNextTuesday = () => {
    const now = new Date();
    const nextTuesday = new Date();
    
    // Get current day (0 = Sunday, 1 = Monday, 2 = Tuesday, etc.)
    const currentDay = now.getDay();
    
    // Calculate days until next Tuesday
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
      if (daysUntilTuesday === 0) daysUntilTuesday = 7; // If result is 0, next Tuesday is 7 days away
    }
    
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
    nextTuesday.setHours(19, 0, 0, 0); // 7:00 PM
    
    return nextTuesday;
  };

  useEffect(() => {
    const nextEventDate = getNextTuesday();
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const eventTime = nextEventDate.getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsEventPassed(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEventPassed(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array to prevent infinite loop

  const nextEventDate = getNextTuesday();

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

  if (isEventPassed) {
    return (
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">🔥 SkateBurn is Live!</h3>
            <p className="text-muted-foreground">The event is happening now! See you on the ramps!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-primary">🔥 Next SkateBurn Event</h3>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatEventDate()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatEventTime()}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-background/50 rounded-lg p-2 border min-w-[60px]">
              <div className="text-xl font-bold text-primary tabular-nums">{timeLeft.days}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Days</div>
            </div>
            <div className="bg-background/50 rounded-lg p-2 border min-w-[60px]">
              <div className="text-xl font-bold text-primary tabular-nums">{timeLeft.hours}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Hours</div>
            </div>
            <div className="bg-background/50 rounded-lg p-2 border min-w-[60px]">
              <div className="text-xl font-bold text-primary tabular-nums">{timeLeft.minutes}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</div>
            </div>
            <div className="bg-background/50 rounded-lg p-2 border min-w-[60px]">
              <div className="text-xl font-bold text-primary tabular-nums">{timeLeft.seconds}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Seconds</div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Get ready to drop in! 🛹✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};