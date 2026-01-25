/**
 * Backend API Service
 * Connects to RealityHacks backend for memory assistance features
 */

const BACKEND_URL = 'https://memory-backend-328251955578.us-east1.run.app';

export interface Contact {
  name: string;
  relationship: string;
  notes?: string;
  bestFacePhotoURL?: string;
  firstSeen?: string;
  lastSeen?: string;
  mentionCount?: number;
}

export interface MemoryCapture {
  id: string;
  userId: string;
  timestamp: string;
  photoURL?: string;
  audioURL?: string;
  transcription?: string;
  processed: boolean;
  geminiAnalysis?: {
    imageSummary?: string;
    themes?: string[];
    mood?: string;
    location?: string;
    detectedFaces?: any[];
    mentionedNames?: string[];
    keyMoment?: string;
  };
}

export interface DailySummary {
  summary: string;
  timeline: Array<{ time: string; event: string }>;
  themes: string[];
  highlights: Array<{ time: string; description: string }>;
  mood: string;
  peopleInteractions: Array<{ name: string; context: string }>;
  locations: string[];
  accomplishments: string[];
  morningOverview?: string;
  afternoonOverview?: string;
  eveningOverview?: string;
}

export interface ScheduledInteraction {
  id: string;
  userId: string;
  scheduledTime: string; // ISO 8601
  duration?: number; // minutes
  type: 'reminder' | 'check-in' | 'memory_capture' | 'query';
  message?: string;
  location?: string;
  enabled: boolean;
}

class BackendAPI {
  private baseURL: string;
  private userId: string;

  constructor(userId: string = 'default_user') {
    this.baseURL = BACKEND_URL;
    this.userId = userId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // ==================== Contacts/People Management ====================

  async getContacts(): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.baseURL}/user/${this.userId}/contacts`);
      const data = await response.json();
      if (data.status === 'success' && data.data?.contacts) {
        return data.data.contacts;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return [];
    }
  }

  async updateContact(contact: Contact): Promise<boolean> {
    try {
      const contacts = await this.getContacts();
      const updated = contacts.map(c => 
        c.name.toLowerCase() === contact.name.toLowerCase() ? contact : c
      );
      
      const response = await fetch(`${this.baseURL}/user/${this.userId}/contacts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: updated })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to update contact:', error);
      return false;
    }
  }

  async addContact(contact: Contact): Promise<boolean> {
    try {
      const contacts = await this.getContacts();
      contacts.push(contact);
      
      const response = await fetch(`${this.baseURL}/user/${this.userId}/contacts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to add contact:', error);
      return false;
    }
  }

  // ==================== Memory Captures ====================

  async getMemoriesForDate(date: string): Promise<DailySummary | null> {
    try {
      const response = await fetch(`${this.baseURL}/memories/${this.userId}/${date}`);
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch memories:', error);
      return null;
    }
  }

  async getRecentCaptures(limit: number = 10): Promise<MemoryCapture[]> {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      const memories = await this.getMemoriesForDate(today);
      
      // This would need a proper endpoint, for now return empty
      return [];
    } catch (error) {
      console.error('Failed to fetch recent captures:', error);
      return [];
    }
  }

  // ==================== Scheduled Interactions (Ray-Ban Control) ====================

  async getScheduledInteractions(): Promise<ScheduledInteraction[]> {
    try {
      // Store in localStorage for now (would use backend endpoint in production)
      const stored = localStorage.getItem(`scheduled_interactions_${this.userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to fetch scheduled interactions:', error);
      return [];
    }
  }

  async createScheduledInteraction(interaction: Omit<ScheduledInteraction, 'id'>): Promise<string | null> {
    try {
      const interactions = await this.getScheduledInteractions();
      const newId = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newInteraction: ScheduledInteraction = {
        ...interaction,
        id: newId,
        userId: this.userId
      };
      
      interactions.push(newInteraction);
      localStorage.setItem(`scheduled_interactions_${this.userId}`, JSON.stringify(interactions));
      
      // Send to backend via WebSocket or HTTP (would implement proper endpoint)
      await this.sendScheduledInteractionToBackend(newInteraction);
      
      return newId;
    } catch (error) {
      console.error('Failed to create scheduled interaction:', error);
      return null;
    }
  }

  async updateScheduledInteraction(id: string, updates: Partial<ScheduledInteraction>): Promise<boolean> {
    try {
      const interactions = await this.getScheduledInteractions();
      const index = interactions.findIndex(i => i.id === id);
      if (index === -1) return false;
      
      interactions[index] = { ...interactions[index], ...updates };
      localStorage.setItem(`scheduled_interactions_${this.userId}`, JSON.stringify(interactions));
      
      await this.sendScheduledInteractionToBackend(interactions[index]);
      return true;
    } catch (error) {
      console.error('Failed to update scheduled interaction:', error);
      return false;
    }
  }

  async deleteScheduledInteraction(id: string): Promise<boolean> {
    try {
      const interactions = await this.getScheduledInteractions();
      const filtered = interactions.filter(i => i.id !== id);
      localStorage.setItem(`scheduled_interactions_${this.userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete scheduled interaction:', error);
      return false;
    }
  }

  private async sendScheduledInteractionToBackend(interaction: ScheduledInteraction): Promise<void> {
    // This would send to backend via WebSocket or HTTP endpoint
    // For now, we'll prepare the data structure
    console.log('Scheduling Ray-Ban interaction:', interaction);
    
    // In production, this would:
    // 1. Connect to WebSocket /ws/ios/{userId}
    // 2. Send scheduled interaction data
    // 3. Backend would schedule the interaction
  }

  // ==================== Location-Based Reminders ====================

  async getLocationReminders(): Promise<Array<{ location: string; message: string; enabled: boolean }>> {
    try {
      const stored = localStorage.getItem(`location_reminders_${this.userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to fetch location reminders:', error);
      return [];
    }
  }

  async addLocationReminder(location: string, message: string): Promise<boolean> {
    try {
      const reminders = await this.getLocationReminders();
      reminders.push({ location, message, enabled: true });
      localStorage.setItem(`location_reminders_${this.userId}`, JSON.stringify(reminders));
      return true;
    } catch (error) {
      console.error('Failed to add location reminder:', error);
      return false;
    }
  }

  // ==================== Query Backend ====================

  async sendQuery(query: string, imageURL?: string): Promise<string | null> {
    try {
      // This would use WebSocket /ws/query/{userId}
      // For now, return a placeholder
      console.log('Sending query:', query);
      return null;
    } catch (error) {
      console.error('Failed to send query:', error);
      return null;
    }
  }
}

export const backendApi = new BackendAPI();
