import { X } from 'lucide-react';
import imgRectangle13 from "figma:asset/c0adce7f65fc6df1d30d46227d857ce5560f3502.png";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-[16px] shadow-2xl p-6 w-[340px] max-h-[500px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[20px] font-bold text-black">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center mb-2">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-gray-200">
              <img 
                src={imgRectangle13} 
                alt="User profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Name</p>
              <p className="text-[14px] font-semibold text-black">John Smith</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Phone Number</p>
              <p className="text-[14px] font-semibold text-black">(555) 123-4567</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Emergency Contact</p>
              <p className="text-[14px] font-semibold text-black">Jill Smith (Wife)</p>
              <p className="text-[12px] text-gray-600 mt-1">(555) 987-6543</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 mb-1">Address</p>
              <p className="text-[14px] font-semibold text-black">123 Maple Street</p>
              <p className="text-[12px] text-gray-600">Springfield, CA 94102</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
