import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const AdminEventDateCard = () => {
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  const [currentStartAt, setCurrentStartAt] = useState<Date | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const TIME_ZONE = "America/New_York";

  useEffect(() => {
    const loadActiveEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, start_at, title")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Failed to load active event:", error);
        toast({ title: "Error", description: "Could not load active event.", variant: "destructive" });
        return;
      }

      if (data) {
        setEventId(data.id);
        if (data.start_at) {
          const d = new Date(data.start_at as string);
          setCurrentStartAt(d);
          setInputValue(formatInTimeZone(d, TIME_ZONE, "yyyy-MM-dd'T'HH:mm"));
        }
      }
    };

    loadActiveEvent();
  }, [toast]);

  const handleSave = async () => {
    if (!eventId || !inputValue) {
      toast({ title: "Missing data", description: "No active event or date selected.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      // Interpret the typed value as Eastern Time and convert to UTC
      const parts = inputValue.split(/[-T:]/).map(Number);
      const naive = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4] || 0, 0);
      const utcDate = fromZonedTime(naive, TIME_ZONE);

      const { error } = await supabase
        .from("events")
        .update({ start_at: utcDate.toISOString() })
        .eq("id", eventId);

      if (error) throw error;

      setCurrentStartAt(utcDate);
      toast({ title: "Event date updated", description: "Countdown now uses the new Eastern time." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Save failed", description: e.message || "Could not update date.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Schedule</CardTitle>
        <CardDescription>Set the next event date/time (America/New_York)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="event-datetime">Next Event (ET)</Label>
          <Input
            id="event-datetime"
            type="datetime-local"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Current: {currentStartAt ? formatInTimeZone(currentStartAt, TIME_ZONE, "EEE, MMM d yyyy, h:mm a 'ET'") : "Not set"}
        </div>
        <Button onClick={handleSave} disabled={saving || !eventId}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminEventDateCard;
