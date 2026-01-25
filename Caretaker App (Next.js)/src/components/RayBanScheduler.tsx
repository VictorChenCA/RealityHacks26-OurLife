/**
 * Ray-Ban Scheduler Component
 * Allows caretaker to set times for Ray-Ban glasses to go live and interact
 */

import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { backendApi, ScheduledInteraction } from '../services/backendApi';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface RayBanSchedulerProps {
  userId?: string;
}

export function RayBanScheduler({ userId }: RayBanSchedulerProps) {
  const [interactions, setInteractions] = useState<ScheduledInteraction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    scheduledTime: '',
    duration: '10',
    type: 'reminder' as ScheduledInteraction['type'],
    message: '',
    location: '',
    enabled: true
  });

  useEffect(() => {
    if (userId) {
      backendApi.setUserId(userId);
    }
    loadInteractions();
  }, [userId]);

  const loadInteractions = async () => {
    const data = await backendApi.getScheduledInteractions();
    setInteractions(data.sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledDateTime = new Date(formData.scheduledTime).toISOString();
    
    const id = await backendApi.createScheduledInteraction({
      scheduledTime: scheduledDateTime,
      duration: parseInt(formData.duration),
      type: formData.type,
      message: formData.message,
      location: formData.location || undefined,
      enabled: formData.enabled,
      userId: userId || 'default_user'
    });

    if (id) {
      setIsDialogOpen(false);
      setFormData({
        scheduledTime: '',
        duration: '10',
        type: 'reminder',
        message: '',
        location: '',
        enabled: true
      });
      loadInteractions();
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await backendApi.updateScheduledInteraction(id, { enabled });
    loadInteractions();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled interaction?')) {
      await backendApi.deleteScheduledInteraction(id);
      loadInteractions();
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-[18px] font-bold text-black">Ray-Ban Schedule</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Ray-Ban Interaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="scheduledTime">Date & Time</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Interaction Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ScheduledInteraction['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="check-in">Check-in</SelectItem>
                    <SelectItem value="memory_capture">Memory Capture</SelectItem>
                    <SelectItem value="query">Query</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="60"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="message">Message/Reminder Text</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What should the glasses say or remind about?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., @home, bedroom"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {interactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No scheduled interactions</p>
        ) : (
          interactions.map((interaction) => (
            <div
              key={interaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-semibold text-black">
                    {formatTime(interaction.scheduledTime)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {interaction.type}
                  </span>
                </div>
                {interaction.message && (
                  <p className="text-[12px] text-gray-600">{interaction.message}</p>
                )}
                {interaction.location && (
                  <p className="text-[10px] text-gray-500">📍 {interaction.location}</p>
                )}
                {interaction.duration && (
                  <p className="text-[10px] text-gray-500">Duration: {interaction.duration} min</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(interaction.id, !interaction.enabled)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {interaction.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(interaction.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
