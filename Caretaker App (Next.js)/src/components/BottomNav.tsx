import svgPaths from "../imports/svg-517yboz5zs";

interface BottomNavProps {
  currentScreen: 'home' | 'reminders' | 'memories';
  onNavigate: (screen: 'home' | 'reminders' | 'memories') => void;
}

function LucideHouse() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="lucide/house">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="lucide/house">
          <path d={svgPaths.p27eb6300} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function LucideCalendarSync() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="lucide/calendar-sync">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="lucide/calendar-sync">
          <path d={svgPaths.p385e78a0} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function LucideHeartPlus() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="lucide/heart-plus">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="lucide/heart-plus">
          <path d={svgPaths.p1d1fe800} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[80px] w-full z-50">
      <div className="absolute bg-gradient-to-b from-[rgba(247,251,255,0)] via-[rgba(247,251,255,0.8)] to-[#f7fbff] h-full left-0 top-0 w-full" />
      
      <button 
        onClick={() => onNavigate('home')}
        className="absolute content-stretch flex flex-col items-start left-[64px] top-[20px] w-[24px] cursor-pointer hover:opacity-70 transition-opacity"
      >
        <LucideHouse />
        <p className={`css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[8px] text-center w-[min-content] ${currentScreen === 'home' ? 'text-black font-bold' : 'text-black'}`}>
          Home
        </p>
      </button>

      <button 
        onClick={() => onNavigate('reminders')}
        className="absolute content-stretch flex flex-col gap-px items-center left-[180px] top-[19px] w-[41px] cursor-pointer hover:opacity-70 transition-opacity"
      >
        <LucideCalendarSync />
        <p className={`css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[8px] text-center w-[min-content] ${currentScreen === 'reminders' ? 'text-black font-bold' : 'text-black'}`}>
          Reminders
        </p>
      </button>

      <button 
        onClick={() => onNavigate('memories')}
        className="absolute content-stretch flex flex-col items-center left-[306px] top-[20px] w-[38px] cursor-pointer hover:opacity-70 transition-opacity"
      >
        <LucideHeartPlus />
        <p className={`css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[8px] text-center w-[min-content] ${currentScreen === 'memories' ? 'text-black font-bold' : 'text-black'}`}>
          Memories
        </p>
      </button>
    </div>
  );
}