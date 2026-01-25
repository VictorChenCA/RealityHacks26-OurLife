/**
 * Chat Interface for Setting Reminders
 * Allows caretaker to chat and set reminders naturally
 */

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { backendApi } from '../services/backendApi';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  reminderCreated?: boolean;
}

interface ChatReminderProps {
  userId?: string;
}

export function ChatReminder({ userId }: ChatReminderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I can help you set reminders. Try saying things like:\n• 'Remind John to take medication at 9pm'\n• 'Set a reminder for church on Sunday at 11am'\n• 'Remind about breakfast every day at 8am'",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      backendApi.setUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseReminder = (text: string): {
    time?: string;
    message?: string;
    frequency?: string;
    location?: string;
  } => {
    const lower = text.toLowerCase();
    const result: any = {};

    // Extract time patterns
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/gi,
      /(\d{1,2})\s*(am|pm)/gi,
      /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/gi
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.time = match[0];
        break;
      }
    }

    // Extract frequency
    if (lower.includes('every day') || lower.includes('daily')) {
      result.frequency = 'daily';
    } else if (lower.includes('every week') || lower.includes('weekly')) {
      result.frequency = 'weekly';
    } else if (lower.includes('every sunday')) {
      result.frequency = 'sunday';
    } else if (lower.includes('once')) {
      result.frequency = 'once';
    }

    // Extract location
    const locationMatch = text.match(/@(\w+[\s\w]*)/i);
    if (locationMatch) {
      result.location = locationMatch[0];
    }

    // Extract message (everything except time/frequency/location)
    let message = text;
    if (result.time) message = message.replace(new RegExp(result.time, 'gi'), '').trim();
    if (result.location) message = message.replace(result.location, '').trim();
    message = message.replace(/remind|set|a|reminder|to|about/gi, '').trim();
    if (message) result.message = message;

    return result;
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Parse reminder intent
    const lower = inputText.toLowerCase();
    const isReminder = lower.includes('remind') || lower.includes('set') || lower.includes('schedule');

    if (isReminder) {
      const parsed = parseReminder(inputText);
      
      // Create scheduled interaction
      if (parsed.time || parsed.message) {
        const now = new Date();
        const scheduledTime = parsed.time 
          ? new Date(`${now.toDateString()} ${parsed.time}`).toISOString()
          : new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default: 1 hour from now

        const id = await backendApi.createScheduledInteraction({
          scheduledTime,
          duration: 5,
          type: 'reminder',
          message: parsed.message || inputText,
          location: parsed.location,
          enabled: true,
          userId: userId || 'default_user'
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: id 
            ? `✅ Reminder set! ${parsed.time ? `Time: ${parsed.time}` : ''} ${parsed.message ? `Message: ${parsed.message}` : ''}`
            : '❌ Failed to set reminder. Please try again.',
          sender: 'assistant',
          timestamp: new Date(),
          reminderCreated: !!id
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I couldn't understand the reminder. Please include a time (e.g., '9pm') and message.",
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } else {
      // General chat response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I can help you set reminders. Try saying 'Remind John to take medication at 9pm' or 'Set a reminder for church on Sunday at 11am'.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm flex flex-col h-[500px]">
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-[18px] font-bold text-black">Chat Reminders</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-black'
              }`}
            >
              <p className="text-[14px] whitespace-pre-wrap">{message.text}</p>
              <p className={`text-[10px] mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a reminder... (e.g., 'Remind John to take medication at 9pm')"
          className="flex-1"
        />
        <Button onClick={handleSend} className="px-4">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
