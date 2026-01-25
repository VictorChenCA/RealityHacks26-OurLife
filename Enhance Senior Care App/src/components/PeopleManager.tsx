/**
 * People Management Component
 * Allows caretaker to view and manage people profiles from backend
 */

import { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Plus, RefreshCw } from 'lucide-react';
import { backendApi, Contact } from '../services/backendApi';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PeopleManagerProps {
  userId?: string;
}

export function PeopleManager({ userId }: PeopleManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    notes: ''
  });

  useEffect(() => {
    if (userId) {
      backendApi.setUserId(userId);
    }
    loadContacts();
  }, [userId]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const data = await backendApi.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContact(null);
    setFormData({ name: '', relationship: '', notes: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      notes: contact.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData: Contact = {
      name: formData.name,
      relationship: formData.relationship,
      notes: formData.notes,
      mentionCount: editingContact?.mentionCount || 0,
      firstSeen: editingContact?.firstSeen || new Date().toISOString(),
      lastSeen: editingContact?.lastSeen || new Date().toISOString(),
      bestFacePhotoURL: editingContact?.bestFacePhotoURL
    };

    const success = editingContact
      ? await backendApi.updateContact(contactData)
      : await backendApi.addContact(contactData);

    if (success) {
      setIsDialogOpen(false);
      loadContacts();
    }
  };

  const handleDelete = async (contact: Contact) => {
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      const updated = contacts.filter(c => c.name !== contact.name);
      // Would need delete endpoint, for now just update local state
      setContacts(updated);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-[18px] font-bold text-black">People Management</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadContacts}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? 'Edit Person' : 'Add New Person'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.relationship}
                    onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="neighbor">Neighbor</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information about this person..."
                    rows={3}
                  />
                </div>

                {editingContact && (
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>First seen: {formatDate(editingContact.firstSeen)}</p>
                    <p>Last seen: {formatDate(editingContact.lastSeen)}</p>
                    <p>Mentioned: {editingContact.mentionCount || 0} times</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingContact ? 'Update' : 'Add'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-sm text-center py-4">Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No contacts found. Add people from interactions or manually.
        </p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {contacts.map((contact, idx) => (
            <div
              key={contact.name || `contact_${idx}`}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {contact.bestFacePhotoURL ? (
                    <img
                      src={contact.bestFacePhotoURL}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-semibold text-black">{contact.name}</p>
                    <p className="text-[12px] text-gray-600 capitalize">{contact.relationship}</p>
                  </div>
                </div>
                {contact.notes && (
                  <p className="text-[12px] text-gray-500 mt-1">{contact.notes}</p>
                )}
                <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                  <span>Last seen: {formatDate(contact.lastSeen)}</span>
                  <span>Mentions: {contact.mentionCount || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(contact)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
