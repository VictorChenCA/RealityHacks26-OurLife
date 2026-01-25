import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarComponentProps {
  onDateClick: (date: number) => void;
  selectedDate: number | null;
}

export function CalendarComponent({ onDateClick, selectedDate }: CalendarComponentProps) {
  return (
    <div className="h-[331.333px] relative overflow-clip" data-name="Date and Time Picker">
      <div className="h-[290.267px] absolute left-[14.93px] right-[14.93px] top-[41.07px]" data-name="Month">
        {/* Week 5 */}
        <div className="absolute inset-[83.6%_0_0_0]" data-name="Week 5">
          <CalendarDay day={30} position="inset-[0_57.88%_0_27.97%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={29} position="inset-[0_73.31%_0_12.54%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={28} position="inset-[0_88.75%_0_-2.89%]" onDateClick={onDateClick} selectedDate={selectedDate} />
        </div>

        {/* Week 4 */}
        <div className="absolute inset-[65.59%_0_18.01%_0]" data-name="Week 4">
          <CalendarDay day={27} position="inset-[0_-3.54%_0_89.39%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={26} position="inset-[0_11.9%_0_73.95%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={25} position="inset-[0_27.33%_0_58.52%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={24} position="inset-[0_42.44%_0_43.41%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={23} position="inset-[0_57.88%_0_27.97%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={22} position="inset-[0_73.31%_0_12.54%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={21} position="inset-[0_88.75%_0_-2.89%]" onDateClick={onDateClick} selectedDate={selectedDate} />
        </div>

        {/* Week 3 */}
        <div className="absolute inset-[47.59%_0_36.01%_0]" data-name="Week 3">
          <CalendarDay day={20} position="inset-[0_-3.54%_0_89.39%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={19} position="inset-[0_11.9%_0_73.95%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={18} position="inset-[0_27.33%_0_58.52%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={17} position="inset-[0_42.44%_0_43.41%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={16} position="inset-[0_57.88%_0_27.97%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={15} position="inset-[0_73.31%_0_12.54%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={14} position="inset-[0_88.75%_0_-2.89%]" onDateClick={onDateClick} selectedDate={selectedDate} />
        </div>

        {/* Week 2 */}
        <div className="absolute inset-[29.26%_0_54.34%_0]" data-name="Week 2">
          <CalendarDay day={13} position="inset-[0_-3.54%_0_89.39%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={12} position="inset-[0_11.9%_0_73.95%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={11} position="inset-[0_27.33%_0_58.52%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={10} position="inset-[0_42.44%_0_43.41%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={9} position="inset-[0_57.88%_0_27.97%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={8} position="inset-[0_73.31%_0_12.54%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={7} position="inset-[0_88.75%_0_-2.89%]" onDateClick={onDateClick} selectedDate={selectedDate} />
        </div>

        {/* Week 1 */}
        <div className="absolute inset-[11.25%_0_72.35%_0]" data-name="Week 1">
          <CalendarDay day={6} position="inset-[0_-3.54%_0_89.39%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={5} position="inset-[0_11.9%_0_73.95%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={4} position="inset-[0_27.33%_0_58.52%]" isHighlighted onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={3} position="inset-[0_42.44%_0_43.41%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={2} position="inset-[0_57.88%_0_27.97%]" onDateClick={onDateClick} selectedDate={selectedDate} />
          <CalendarDay day={1} position="inset-[0_73.31%_0_12.54%]" onDateClick={onDateClick} selectedDate={selectedDate} />
        </div>

        {/* Day labels */}
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%+154px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">SAT</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%+103.13px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">FRI</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%+51.8px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">THU</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%+0.47px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">WED</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%-50.87px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">TUE</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%-102.67px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">MON</p>
        <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[16.8px] left-[calc(50%-152.6px)] text-[12.13px] text-[rgba(60,60,67,0.3)] text-center top-[calc(50%-138.6px)] translate-x-[-50%]">SUN</p>
      </div>

      {/* Header */}
      <div className="absolute h-[41.067px] left-0 right-0 top-0" data-name="Header">
        <div className="absolute font-['SF_Pro:Medium',sans-serif] font-[510] h-[22.4px] leading-[normal] right-0 text-[#5e8abd] text-[18.67px] text-center top-[13.07px] w-[52.267px]" data-name="Arrows - Next and Previous">
          <ChevronRight className="absolute css-4hzbpn h-[22.4px] right-[5.13px] top-0 translate-x-[50%] w-[14px]" />
          <ChevronLeft className="absolute css-4hzbpn h-[22.4px] right-[45.27px] top-0 translate-x-[50%] w-[14px]" />
        </div>
        <div className="absolute h-[22.4px] left-[14.93px] top-[12.13px] w-[108.267px]" data-name="Month and Year">
          <div className="absolute inset-[0_13.79%_0_76.72%]" data-name="Chevron">
            <p className="absolute css-ew64yg font-['SF_Pro:Bold',sans-serif] font-bold leading-[16.8px] left-[5.13px] text-[#5e8abd] text-[12.13px] text-center top-[calc(50%-8.4px)] translate-x-[-50%]">􀆊</p>
          </div>
          <div className="absolute inset-[0_12.93%_0_0]" data-name="Month and Year">
            <p className="absolute css-ew64yg font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[22.4px] left-0 text-[#5e8abd] text-[15.87px] top-[0.93px]">June 2020</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarDayProps {
  day: number | null;
  position: string;
  isHighlighted?: boolean;
  onDateClick: (date: number) => void;
  selectedDate: number | null;
}

function CalendarDay({ day, position, isHighlighted = false, onDateClick, selectedDate }: CalendarDayProps) {
  if (day === null) {
    return (
      <div className={`absolute ${position}`} data-name="Day">
        <p className="absolute css-ew64yg font-['SF_Pro:Regular',sans-serif] font-normal leading-[normal] left-1/2 text-[#5e8abd] text-[18.67px] text-center top-[calc(50%-11.2px)] translate-x-[-50%]"> </p>
      </div>
    );
  }

  const isClickable = day === 4 || day === 5 || day === 6;
  const isSelected = selectedDate === day;

  return (
    <button
      className={`absolute ${position} ${isClickable ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
      data-name="Day"
      onClick={() => isClickable && onDateClick(day)}
      disabled={!isClickable}
    >
      {(isHighlighted || isSelected) && (
        <div className="absolute bg-[#5e8abd] left-1/2 opacity-12 rounded-[22px] size-[41.067px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Color" />
      )}
      <p className={`absolute css-ew64yg font-['SF_Pro:${isHighlighted || isSelected ? 'Medium' : 'Regular'}',sans-serif] font-${isHighlighted || isSelected ? '[510]' : 'normal'} leading-[normal] left-1/2 text-[#5e8abd] text-[${isHighlighted || isSelected ? '22.4' : '18.67'}px] text-center top-[calc(50%-${isHighlighted || isSelected ? '13.53' : '11.2'}px)] translate-x-[-50%]`}>
        {day}
      </p>
    </button>
  );
}