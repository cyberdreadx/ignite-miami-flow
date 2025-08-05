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

  // Set next SkateBurn event date - you can update this date
  const nextEventDate = new Date('2025-08-08T19:00:00'); // Example: Friday 7PM

  useEffect(() => {
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
  }, [nextEventDate]);

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
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-primary">🔥 Next SkateBurn Event</h3>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatEventDate()}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{formatEventTime()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Days</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Hours</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</div>
            </div>
            <div className="bg-background/50 rounded-lg p-3 border">
              <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Seconds</div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Get ready to drop in! 🛹✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};