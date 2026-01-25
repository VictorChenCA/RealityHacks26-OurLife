import { useState } from 'react';
import { Plus, Settings, MapPin, Clock } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { SettingsPopup } from './SettingsPopup';
import { AddHintForm, HintData } from './AddHintForm';
import { LocationReminders } from './LocationReminders';
import { ChatReminder } from './ChatReminder';
import { CalendarComponent } from './CalendarComponent';
import { TaskCard, TaskDetailModal, Task } from './TaskCard';
import { TASKS_BY_DATE, INITIAL_TASKS } from '../data/tasks';
import svgPaths from "../imports/svg-4ft9ih26ix";
import imgImage1 from "figma:asset/1e93821dbfadbd1bd4024b5185794be8309179aa.png";

interface RemindersProps {
  onNavigate: (screen: 'home' | 'reminders' | 'memories') => void;
}

function Icon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="size-[27.995px] cursor-pointer hover:scale-110 transition-transform"
      data-name="Icon"
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.9948 27.9948">
        <g id="Icon">
          <path d={svgPaths.pf926200} fill="var(--fill-0, white)" fillOpacity="0.4" id="Vector" stroke="var(--stroke-0, #246088)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3329" />
          <path d={svgPaths.p1502c880} fill="var(--fill-0, white)" fillOpacity="0.4" id="Vector_2" stroke="var(--stroke-0, #246088)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3329" />
        </g>
      </svg>
    </button>
  );
}

export function Reminders({ onNavigate }: RemindersProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddHintOpen, setIsAddHintOpen] = useState(false);
  const [hints, setHints] = useState<HintData[]>([]);
  const [viewMode, setViewMode] = useState<'time' | 'location'>('time');

  // States for Map Pins
  const [showPin1Alert, setShowPin1Alert] = useState(false);
  const [showPin2Alert, setShowPin2Alert] = useState(false);
  const [showPin3Alert, setShowPin3Alert] = useState(false);
  const [showPin4Alert, setShowPin4Alert] = useState(false);

  // States for Task Management
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(4);

  const handleAddHint = (hint: HintData) => {
    setHints([...hints, hint]);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    console.log('Delete task', id);
  };

  const currentTasks = selectedDate ? TASKS_BY_DATE[selectedDate] || [] : INITIAL_TASKS;

  return (
    <div className="bg-[#f7fbff] relative size-full overflow-hidden flex flex-col">
      {/* Header with Title and Settings */}
      <div className="px-4 pt-[27px] pb-4 shrink-0 flex justify-between items-center z-20 bg-[#f7fbff]">
        <p className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-black">Reminders</p>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <Settings className="w-[24px] h-[24px]" />
          <span className="text-[8px] text-black">Setting</span>
        </button>
      </div>

      {/* Toggle Switch */}
      <div className="px-4 mb-4 shrink-0 z-20">
        <div className="bg-gray-200 p-1 rounded-lg flex items-center">
          <button
            onClick={() => setViewMode('time')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${viewMode === 'time' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Time</span>
          </button>
          <button
            onClick={() => setViewMode('location')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${viewMode === 'location' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Location</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-[80px] relative">

        {viewMode === 'time' ? (
          <div className="px-4 space-y-6">
            {/* Timely Hints */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[16px] text-black">Timely Hints</p>
                <button
                  onClick={() => setIsAddHintOpen(true)}
                  className="bg-blue-100 p-1 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Reminder Interface */}
              <ChatReminder userId="default_user" />
            </div>

            {/* Today Tasks */}
            <div className="space-y-2">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[16px] text-black">Today</p>
              <div className="flex flex-col gap-[8px]">
                {INITIAL_TASKS.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
              </div>
            </div>

            {/* Coming Up */}
            <div className="space-y-2">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[16px] text-black">Coming Up</p>
              <div className="bg-white rounded-[8px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)] mb-4">
                <CalendarComponent onDateClick={setSelectedDate} selectedDate={selectedDate} />
              </div>
              <div className="flex flex-col gap-[8px]">
                {currentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => handleTaskClick(task)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[800px]">
            {/* Location View - Keeping absolute positioning for the map/pins logic */}

            {/* Map Image */}
            <div className="absolute left-[-22px] size-[434px] top-0" data-name="image 1">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
            </div>

            {/* Pin Icons Logic - Adjusted top offset by subtracting header height approx 70px */}
            <div className="absolute left-[calc(33.33%+41px)] top-[361px]">
              <Icon onClick={() => setShowPin1Alert(!showPin1Alert)} />
            </div>
            <div className="absolute left-[calc(50%+11px)] top-[128px]">
              <Icon onClick={() => setShowPin2Alert(!showPin2Alert)} />
            </div>
            <div className="absolute left-[calc(33.33%+27px)] top-[185px]">
              <Icon onClick={() => setShowPin3Alert(!showPin3Alert)} />
            </div>
            <div className="absolute left-[calc(16.67%+10px)] top-[260px]">
              <Icon onClick={() => setShowPin4Alert(!showPin4Alert)} />
            </div>

            {/* Red Alert Box - Only show when pin is clicked */}
            {showPin1Alert && (
              <div className="absolute bg-[#f6e3e3] h-[52px] left-[calc(50%+22px)] rounded-[4px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)] top-[91px] w-[149px] z-10">
                <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[9px] w-[153px]">TV Area</p>
                <p className="absolute css-4hzbpn font-['Inter:Regular',sans-serif] font-normal h-[26px] leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[23px] w-[137px]">Reminder for moving around after sitting more than 1h</p>
              </div>
            )}
            {/* ... other alerts adjusted similarly ... */}
            {showPin2Alert && (
              <div className="absolute bg-[#f6e3e3] h-[52px] left-[calc(50%+22px)] rounded-[4px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)] top-[91px] w-[149px] z-10">
                <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[9px] w-[153px]">Bedroom</p>
                <p className="absolute css-4hzbpn font-['Inter:Regular',sans-serif] font-normal h-[26px] leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[23px] w-[137px]">Remember to take medication before bed</p>
              </div>
            )}
            {showPin3Alert && (
              <div className="absolute bg-[#f6e3e3] h-[52px] left-[calc(50%+22px)] rounded-[4px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)] top-[91px] w-[149px] z-10">
                <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[9px] w-[153px]">Kitchen</p>
                <p className="absolute css-4hzbpn font-['Inter:Regular',sans-serif] font-normal h-[26px] leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[23px] w-[137px]">Turn off stove after cooking</p>
              </div>
            )}
            {showPin4Alert && (
              <div className="absolute bg-[#f6e3e3] h-[52px] left-[calc(50%+22px)] rounded-[4px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.12)] top-[91px] w-[149px] z-10">
                <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[9px] w-[153px]">Bathroom</p>
                <p className="absolute css-4hzbpn font-['Inter:Regular',sans-serif] font-normal h-[26px] leading-[normal] left-[6px] not-italic text-[#c00000] text-[8px] top-[23px] w-[137px]">Remember to brush teeth twice daily</p>
              </div>
            )}

            {/* Location Reminders Component overlaid */}
            <div className="absolute left-[16px] top-[500px] w-[370px] z-20">
              <LocationReminders userId="default_user" />
            </div>
          </div>
        )}
      </div>

      <BottomNav currentScreen="reminders" onNavigate={onNavigate} />
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddHintForm isOpen={isAddHintOpen} onClose={() => setIsAddHintOpen(false)} onAdd={handleAddHint} />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
