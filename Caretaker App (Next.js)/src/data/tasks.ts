export interface Task {
  id: string;
  title: string;
  location: string;
  time: string;
  endTime: string;
  frequency: string;
  description: string;
  category: 'medical' | 'social' | 'errands' | 'personal';
  backgroundColor: string;
  frequencyColor: string;
}

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Church & Lunch',
    location: '@123 Church Ave',
    time: '11:00AM',
    endTime: '2:00PM',
    frequency: '🔁 Every Sunday',
    description: 'Weekly church service followed by lunch with congregation members.',
    category: 'social',
    backgroundColor: 'bg-[#e1eef9]',
    frequencyColor: 'text-[#1b318b]',
  },
  {
    id: '2',
    title: "Cleaning Lady's Visit",
    location: '@home',
    time: '4:00PM',
    endTime: '6:00PM',
    frequency: '🔁 Every other Sunday',
    description: 'Maria comes to help clean the house.',
    category: 'personal',
    backgroundColor: 'bg-[rgba(255,226,167,0.1)]',
    frequencyColor: 'text-[#8b581b]',
  },
  {
    id: '3',
    title: 'Medication',
    location: '@home, bedroom',
    time: '9:00PM',
    endTime: '',
    frequency: '🔁 Every other day',
    description: 'Take evening medication before bed.',
    category: 'medical',
    backgroundColor: 'bg-[rgba(119,199,159,0.1)]',
    frequencyColor: 'text-[#277343]',
  },
];

export const TASKS_BY_DATE: Record<number, Task[]> = {
  4: INITIAL_TASKS,
  5: [
    {
      id: '4',
      title: 'Doctor Appointment',
      location: '@Medical Center',
      time: '10:00AM',
      endTime: '11:00AM',
      frequency: '🔁 Once',
      description: 'Regular checkup with Dr. Johnson.',
      category: 'medical',
      backgroundColor: 'bg-[rgba(119,199,159,0.1)]',
      frequencyColor: 'text-[#277343]',
    },
    {
      id: '5',
      title: 'Lunch with Mary',
      location: '@Olive Garden',
      time: '12:30PM',
      endTime: '2:00PM',
      frequency: '🔁 Once',
      description: 'Meeting daughter Mary for lunch.',
      category: 'social',
      backgroundColor: 'bg-[#e1eef9]',
      frequencyColor: 'text-[#1b318b]',
    },
  ],
  6: [
    {
      id: '6',
      title: 'Grocery Shopping',
      location: '@Neighborhood Mart',
      time: '9:00AM',
      endTime: '10:30AM',
      frequency: '🔁 Every Saturday',
      description: 'Weekly grocery shopping.',
      category: 'errands',
      backgroundColor: 'bg-[rgba(255,226,167,0.1)]',
      frequencyColor: 'text-[#8b581b]',
    },
  ],
};
