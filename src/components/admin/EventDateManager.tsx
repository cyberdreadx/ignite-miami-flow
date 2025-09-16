import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { format, parseISO, addDays, startOfWeek, isTuesday, nextTuesday } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

interface Event {
  id: string;
  title: string;
  description: string;
  start_at: string;
  is_active: boolean;
  created_at: string;
}

interface NewEventForm {
  title: string;
  description: string;
  date: string;
  time: string;
}

export const EventDateManager: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: '🔥 SkateBurn Tuesdays',
    description: 'Weekly Tuesday night skating session with fire performances, music, and community vibes at the Miami skate park.',
    date: '',
    time: '19:00'
  });
  const { toast } = useToast();
  const TIME_ZONE = 'America/New_York';

  useEffect(() => {
    fetchEvents();
    generateNextTuesday();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: 'Failed to fetch events',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNextTuesday = () => {
    const today = new Date();
    const next = isTuesday(today) ? addDays(today, 7) : nextTuesday(today);
    setNewEvent(prev => ({
      ...prev,
      date: format(next, 'yyyy-MM-dd')
    }));
  };

  const createEvent = async () => {
    try {
      // Combine date and time and assume it's in the Eastern timezone
      const localDateTime = `${newEvent.date}T${newEvent.time}:00`;
      const localDate = new Date(localDateTime);
      
      // Create UTC datetime (assuming the input is already local to the user)
      const utcDateTime = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));

      const { error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          time: newEvent.time, // Keep the original time field
          location: 'Miami Skate Park', // Default location
          start_at: utcDateTime.toISOString(),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Event created successfully',
        description: `New event scheduled for ${format(parseISO(newEvent.date), 'EEEE, MMMM d, yyyy')} at ${newEvent.time}`,
        variant: 'default'
      });

      setShowNewForm(false);
      setNewEvent({
        title: '🔥 SkateBurn Tuesdays',
        description: 'Weekly Tuesday night skating session with fire performances, music, and community vibes at the Miami skate park.',
        date: '',
        time: '19:00'
      });
      generateNextTuesday();
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Failed to create event',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Event updated successfully',
        variant: 'default'
      });

      setEditing(null);
      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Failed to update event',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Event deleted successfully',
        variant: 'default'
      });

      fetchEvents();
    } catch (error: any) {
      toast({
        title: 'Failed to delete event',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    await updateEvent(eventId, { is_active: !currentStatus });
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.start_at);
    const now = new Date();
    
    if (!event.is_active) return 'inactive';
    if (eventDate < now) return 'past';
    if (eventDate.toDateString() === now.toDateString()) return 'today';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'today':
        return <Badge variant="default" className="bg-green-100 text-green-800">Today</Badge>;
      case 'past':
        return <Badge variant="secondary">Past</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return null;
    }
  };

  const formatEventDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: formatInTimeZone(date, TIME_ZONE, 'EEEE, MMMM d, yyyy'),
      time: formatInTimeZone(date, TIME_ZONE, 'h:mm a zzz')
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Date Manager</h3>
          <p className="text-sm text-muted-foreground">
            Manage upcoming Tuesday events and countdown timers
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* New Event Form */}
      {showNewForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Event
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="🔥 SkateBurn Tuesdays"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="time">Time (Eastern)</Label>
              <Input
                id="time"
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full p-3 border border-input rounded-md resize-none"
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createEvent} disabled={!newEvent.title || !newEvent.date}>
                <Save className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewForm(false);
                  generateNextTuesday();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No Events Scheduled</h4>
              <p className="text-muted-foreground">
                Create your first event to start managing the countdown timer.
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const status = getEventStatus(event);
            const { date, time } = formatEventDateTime(event.start_at);
            
            return (
              <Card key={event.id} className={status === 'today' ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.title}</h4>
                        {getStatusBadge(status)}
                        {status === 'today' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-medium">Live!</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{time}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground max-w-md">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEventStatus(event.id, event.is_active)}
                      >
                        {event.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Button>
                      
                      <Button size="sm" variant="outline" onClick={() => setEditing(event.id)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      
                      <Button size="sm" variant="destructive" onClick={() => deleteEvent(event.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {events.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">Event Management Tips:</div>
              <ul className="text-sm space-y-1">
                <li>• Only <strong>active</strong> events appear in the countdown timer</li>
                <li>• The countdown shows the <strong>next upcoming active event</strong></li>
                <li>• Deactivate events to temporarily hide them without deleting</li>
                <li>• Times are automatically converted to Eastern timezone</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};