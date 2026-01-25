import { Edit2, Trash2 } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  location: string;
  time: string;
  endTime?: string;
  frequency: string;
  description?: string;
  category: string;
  backgroundColor: string;
  frequencyColor: string;
}

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export function TaskCard({ task, onEdit, onDelete, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex items-center justify-between relative shrink-0 w-full hover:opacity-80 transition-opacity"
    >
      <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[8px] text-black w-[46px] text-left">
        <span className="leading-[normal]">{task.time} </span>
        {task.endTime && <span className="leading-[normal] text-[rgba(0,0,0,0.4)]">{task.endTime}</span>}
      </p>
      <div className={`${task.backgroundColor} content-stretch flex flex-col h-[33px] items-start justify-center px-[8px] py-[4px] relative rounded-[6px] shrink-0 w-[320px]`}>
        <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[12px] items-center not-italic relative shrink-0">
          <p className="css-4hzbpn leading-[0] relative shrink-0 text-[0px] text-black w-[208px]">
            <span className="leading-[normal] text-[12px]">{task.title} </span>
            <span className="leading-[normal] text-[8px]">{task.location}</span>
          </p>
          <p className={`css-ew64yg leading-[normal] relative shrink-0 ${task.frequencyColor} text-[8px]`}>{task.frequency}</p>
        </div>
      </div>
    </button>
  );
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, onEdit, onDelete }: TaskDetailModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-[16px] shadow-2xl p-6 w-[340px] max-h-[500px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-black mb-1">{task.title}</h2>
            <p className="text-[12px] text-gray-600">{task.location}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-[24px] leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 mb-1">Time</p>
            <p className="text-[14px] font-semibold text-black">
              {task.time} {task.endTime && `- ${task.endTime}`}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 mb-1">Frequency</p>
            <p className="text-[14px] font-semibold text-black">{task.frequency}</p>
          </div>

          {task.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Description</p>
              <p className="text-[14px] text-black">{task.description}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 mb-1">Category</p>
            <p className="text-[14px] font-semibold text-black capitalize">{task.category}</p>
          </div>
        </div>

        <div className="flex gap-3">
          {onEdit && (
            <button
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-semibold hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  onDelete(task.id);
                  onClose();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-[14px] font-semibold hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
