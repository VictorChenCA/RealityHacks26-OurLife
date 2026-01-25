/**
 * Location-Based Reminders Component
 * Set reminders that trigger when person reaches specific locations
 */

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { backendApi } from '../services/backendApi';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface LocationReminder {
  location: string;
  message: string;
  enabled: boolean;
  id?: string;
}

interface LocationRemindersProps {
  userId?: string;
}

export function LocationReminders({ userId }: LocationRemindersProps) {
  const [reminders, setReminders] = useState<LocationReminder[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    message: '',
    enabled: true
  });

  useEffect(() => {
    if (userId) {
      backendApi.setUserId(userId);
    }
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    const data = await backendApi.getLocationReminders();
    setReminders(data.map((r, idx) => ({ ...r, id: `loc_${idx}` })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await backendApi.addLocationReminder(
      formData.location,
      formData.message
    );

    if (success) {
      setIsDialogOpen(false);
      setFormData({ location: '', message: '', enabled: true });
      loadReminders();
    }
  };

  const handleToggle = async (location: string, enabled: boolean) => {
    const reminders = await backendApi.getLocationReminders();
    const updated = reminders.map(r => 
      r.location === location ? { ...r, enabled } : r
    );
    localStorage.setItem(`location_reminders_${userId || 'default'}`, JSON.stringify(updated));
    loadReminders();
  };

  const handleDelete = async (location: string) => {
    if (confirm('Are you sure you want to delete this location reminder?')) {
      const reminders = await backendApi.getLocationReminders();
      const filtered = reminders.filter(r => r.location !== location);
      localStorage.setItem(`location_reminders_${userId || 'default'}`, JSON.stringify(filtered));
      loadReminders();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h3 className="text-[18px] font-bold text-black">Location Reminders</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Location Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., @home, bedroom, @123 Church Ave"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Reminder Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="What should be reminded when reaching this location?"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Add Reminder</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No location reminders set</p>
        ) : (
          reminders.map((reminder, idx) => (
            <div
              key={reminder.id || `reminder_${idx}`}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-[14px] font-semibold text-black">
                    {reminder.location}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 ml-6">{reminder.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(reminder.location, !reminder.enabled)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {reminder.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(reminder.location)}
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
