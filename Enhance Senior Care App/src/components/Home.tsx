import { useState } from 'react';
import { Settings } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { SettingsPopup } from './SettingsPopup';
import { TaskCard, TaskDetailModal, Task } from './TaskCard';
import { RayBanScheduler } from './RayBanScheduler';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TASKS_BY_DATE, INITIAL_TASKS } from '../data/tasks';

interface HomeProps {
  onNavigate: (screen: 'home' | 'reminders' | 'memories') => void;
}

export function Home({ onNavigate }: HomeProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // We'll just show default tasks for Today on Home
  const tasks = INITIAL_TASKS;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    // For now, this just updates local state, but in a real app would update store
    console.log('Delete task', id);
  };

  return (
    <div className="bg-[#f7fbff] relative size-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-[27px] pb-[80px]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <p className="css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[24px] text-black">Home</p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <Settings className="w-[24px] h-[24px]" />
              <span className="text-[8px] text-black">Setting</span>
            </button>
          </div>

          {/* Today Section */}
          <div className="mb-8">
            <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[16px] text-black mb-4">Today</p>
            <div className="flex flex-col gap-[8px]">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                />
              ))}
            </div>
          </div>

          {/* Weekly Highlights */}
          <div className="mb-8">
            <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[16px] text-black mb-4">Weekly Highlights</p>
            <div className="flex gap-[8px] overflow-x-auto">
              <div className="flex flex-col gap-[2px] items-center flex-shrink-0">
                <div className="h-[130px] w-[86px] rounded-[4px] overflow-hidden">
                  <ImageWithFallback alt="Lunch at Church" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1600324839804-135dad3a3069?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBsdW5jaCUyMGdhdGhlcmluZ3xlbnwxfHx8fDE3NjkzMDM3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                </div>
                <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[10px] text-black">Lunch at Church</p>
              </div>
              <div className="flex flex-col gap-[2px] items-center flex-shrink-0">
                <div className="h-[130px] w-[86px] rounded-[4px] overflow-hidden">
                  <ImageWithFallback alt="Chat with Joe" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1617336988198-dabef7cab90d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwY29mZmVlJTIwY2hhdHxlbnwxfHx8fDE3NjkzMDM3MjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                </div>
                <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[10px] text-black">Chat with Joe</p>
              </div>
              <div className="flex flex-col gap-[2px] items-center flex-shrink-0">
                <div className="h-[130px] w-[86px] rounded-[4px] overflow-hidden">
                  <ImageWithFallback alt="Coffee" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1645771321012-919d2e7aa858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBtb3JuaW5nfGVufDF8fHx8MTc2OTE4Njg5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                </div>
                <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[10px] text-black">Coffee</p>
              </div>
              <div className="flex flex-col gap-[2px] items-center flex-shrink-0">
                <div className="h-[130px] w-[86px] rounded-[4px] overflow-hidden">
                  <ImageWithFallback alt="Mr.Meow's Nap" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1759588032622-1388cf9505ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBuYXBwaW5nJTIwc2xlZXBpbmd8ZW58MXx8fHwxNzY5MzAzNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                </div>
                <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic text-[10px] text-black">Mr.Meow's Nap</p>
              </div>
            </div>
          </div>

          {/* Ray-Ban Control Section */}
          <div className="mb-6">
            <RayBanScheduler userId="default_user" />
          </div>
        </div>
      </div>

      <BottomNav currentScreen="home" onNavigate={onNavigate} />
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}