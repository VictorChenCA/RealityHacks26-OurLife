import { X } from 'lucide-react';
import { useState } from 'react';

interface AddHintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (hint: HintData) => void;
}

export interface HintData {
  id: string;
  event: string;
  date: string;
  time: string;
  endTime: string;
  frequency: string;
  location: string;
  people: string;
  notes: string;
  category: string;
}

export function AddHintForm({ isOpen, onClose, onAdd }: AddHintFormProps) {
  const [formData, setFormData] = useState<Partial<HintData>>({
    event: '',
    date: '',
    time: '',
    endTime: '',
    frequency: 'once',
    location: 'home',
    people: '',
    notes: '',
    category: 'personal'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHint: HintData = {
      id: Date.now().toString(),
      event: formData.event || '',
      date: formData.date || '',
      time: formData.time || '',
      endTime: formData.endTime || '',
      frequency: formData.frequency || 'once',
      location: formData.location || 'home',
      people: formData.people || '',
      notes: formData.notes || '',
      category: formData.category || 'personal'
    };
    onAdd(newHint);
    setFormData({
      event: '',
      date: '',
      time: '',
      endTime: '',
      frequency: 'once',
      location: 'home',
      people: '',
      notes: '',
      category: 'personal'
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-[16px] shadow-2xl p-6 w-[360px] max-h-[700px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-bold text-black">Add New Hint</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              required
              value={formData.event}
              onChange={(e) => setFormData({ ...formData, event: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Doctor's Appointment"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Frequency *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="once">Once</option>
              <option value="daily">Every day</option>
              <option value="weekly">Every week</option>
              <option value="biweekly">Every other week</option>
              <option value="monthly">Every month</option>
              <option value="other-day">Every other day</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Location *
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="home">Home</option>
              <option value="grocery-store">Grocery Store</option>
              <option value="park">Park</option>
              <option value="church">Church</option>
              <option value="new-place">New Place</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              People Involved
            </label>
            <input
              type="text"
              value={formData.people}
              onChange={(e) => setFormData({ ...formData, people: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Dr. Johnson, Jill"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">Personal</option>
              <option value="medical">Medical</option>
              <option value="social">Social</option>
              <option value="errands">Errands</option>
              <option value="meals">Meals</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-700 mb-1">
              Notes/Description
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details or reminders..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-[14px] font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Hint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
