import imgRectangle11 from "figma:asset/91c9a7ee01d28072b0aa54fbe327c0322101d29c.png";
import imgRectangle9 from "figma:asset/a05160d36547cdfe1d58ca2b1abbe0d03bbd35c5.png";
import imgRectangle10 from "figma:asset/6782b5e874424f278eb335acb0e4cd7a1eeaed50.png";
import imgRectangle12 from "figma:asset/96c20c19422f3b32394555be7e4e30f29f38d0fd.png";

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
      <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle11} />
      </div>
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[81px]">Grandson Sam’s Wedding</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
      <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
          <img alt="" className="absolute h-full left-[-6.02%] max-w-none top-0 w-[151.16%]" src={imgRectangle9} />
        </div>
      </div>
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Great grand son Eddie’s birthday</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
      <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle10} />
      </div>
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Family vacation in Hawaii</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
      <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
          <img alt="" className="absolute h-full left-[-75.4%] max-w-none top-[0.32%] w-[293.97%]" src={imgRectangle12} />
        </div>
      </div>
      <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Daughter Mary’s Visit</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full">
      <Frame3 />
      <Frame1 />
      <Frame2 />
      <Frame4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] items-start relative shrink-0 w-full">
      <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-black w-full">Recent Memories</p>
      <Frame />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[3px] items-center opacity-60 relative shrink-0">
      <div className="bg-black rounded-[2px] shrink-0 size-[3px]" />
      <div className="bg-[#d9d9d9] rounded-[2px] shrink-0 size-[3px]" />
      <div className="bg-[#d9d9d9] rounded-[2px] shrink-0 size-[3px]" />
    </div>
  );
}

export default function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[13px] items-center relative size-full">
      <Frame7 />
      <Frame6 />
    </div>
  );
}