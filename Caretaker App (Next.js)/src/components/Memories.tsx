import { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { BottomNav } from './BottomNav';
import { SettingsPopup } from './SettingsPopup';
import { PersonProfile, profileData } from './PersonProfile';
import { PeopleManager } from './PeopleManager';
import { backendApi, Contact } from '../services/backendApi';
import imgRectangle10 from "figma:asset/2236f7cc6a3079e99dcb27a7af481bf8b4b07353.png";
import imgRectangle9 from "figma:asset/89d1b03f5f57438854570da8a0c839940b92b2c4.png";
import imgRectangle11 from "figma:asset/12fc743c50682ea9bcdb602bd44c80cfdd96d2d6.png";
import imgRectangle12 from "figma:asset/89d1b03f5f57438854570da8a0c839940b92b2c4.png";
import imgRectangle13 from "figma:asset/c0adce7f65fc6df1d30d46227d857ce5560f3502.png";
import imgRectangle14 from "figma:asset/9ad339ae90aa4fcf4debe0c3dba0629744ecb5a6.png";
import imgRectangle15 from "figma:asset/511dc782aafdcc192c93724d190a6927390e6c28.png";
import imgRectangle16 from "figma:asset/1e424d8facb04a0f68ba30468301280e94d4637e.png";
import imgRectangle17 from "figma:asset/72ae79d5bc77152841746064266d1f0648c4a03c.png";
import imgRectangle18 from "figma:asset/f92ec46d7b3dd990afa99262af818854b3c42dbe.png";
import imgRectangle19 from "figma:asset/697582ee25af8bb828cd80b97cca803b0086d01e.png";
import imgRectangle20 from "figma:asset/a05160d36547cdfe1d58ca2b1abbe0d03bbd35c5.png";
import imgRectangle21 from "figma:asset/91c9a7ee01d28072b0aa54fbe327c0322101d29c.png";
import imgRectangle22 from "figma:asset/6782b5e874424f278eb335acb0e4cd7a1eeaed50.png";
import imgRectangle23 from "figma:asset/96c20c19422f3b32394555be7e4e30f29f38d0fd.png";

interface MemoriesProps {
  onNavigate: (screen: 'home' | 'reminders' | 'memories') => void;
}

export function Memories({ onNavigate }: MemoriesProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<'john' | 'joe' | 'wedding' | null>(null);
  const [backendContacts, setBackendContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const contacts = await backendApi.getContacts();
    setBackendContacts(contacts);
  };

  if (selectedProfile) {
    return (
      <PersonProfile
        {...profileData[selectedProfile]}
        onBack={() => setSelectedProfile(null)}
      />
    );
  }

  return (
    <div className="bg-[#f7fbff] relative size-full overflow-y-auto pb-[80px]">
      <div className="absolute left-[16px] top-[27px] right-[16px] flex justify-between items-center">
        <p className="css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic text-[24px] text-black">Memories</p>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <Settings className="w-[24px] h-[24px]" />
          <span className="text-[8px] text-black">Setting</span>
        </button>
      </div>

      {/* Recent Memories Section */}
      <div className="absolute content-stretch flex flex-col gap-[13px] items-center left-[16px] top-[71px] w-[370px]">
        <div className="content-stretch flex flex-col gap-[13px] items-start relative shrink-0 w-full">
          <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-black w-full">Recent Memories</p>
          <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full">
            <button
              onClick={() => setSelectedProfile('wedding')}
              className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle21} />
              </div>
              <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[81px]">Grandson Sam's Wedding</p>
            </button>
            <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
              <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                  <img alt="" className="absolute h-full left-[-6.02%] max-w-none top-0 w-[151.16%]" src={imgRectangle20} />
                </div>
              </div>
              <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Great grand son Eddie's birthday</p>
            </div>
            <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
              <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle22} />
              </div>
              <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Family vacation in Hawaii</p>
            </div>
            <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
              <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                  <img alt="" className="absolute h-full left-[-75.4%] max-w-none top-[0.32%] w-[293.97%]" src={imgRectangle23} />
                </div>
              </div>
              <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[86px]">Daughter Mary's Visit</p>
            </div>
          </div>
        </div>
        
        <div className="content-stretch flex gap-[3px] items-center opacity-60 relative shrink-0">
          <div className="bg-black rounded-[2px] shrink-0 size-[3px]" />
          <div className="bg-[#d9d9d9] rounded-[2px] shrink-0 size-[3px]" />
          <div className="bg-[#d9d9d9] rounded-[2px] shrink-0 size-[3px]" />
        </div>
      </div>

      <button 
        className="absolute left-[calc(83.33%+27px)] size-[24px] top-[71px] cursor-pointer hover:scale-110 transition-transform"
      >
        <Plus className="w-full h-full" />
      </button>

      <p className="absolute css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[16px] not-italic text-[18px] text-black top-[285px]">People</p>
      
      {/* People Management Section */}
      <div className="absolute left-[16px] top-[310px] w-[370px] z-10">
        <PeopleManager userId="default_user" />
      </div>

      {/* Family Section */}
      <div className="absolute content-stretch flex flex-col gap-[6px] h-[307px] items-center justify-center left-[16px] top-[327px] w-[370px]">
        <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-[370px]">Family</p>
        
        <div className="content-center flex flex-wrap gap-[8px] h-[309px] items-center relative shrink-0 w-full">
          <button
            onClick={() => setSelectedProfile('john')}
            className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle13} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">John (Me)</p>
          </button>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                <img alt="" className="absolute h-full left-[-101.93%] max-w-none top-0 w-[226.89%]" src={imgRectangle14} />
              </div>
            </div>
            <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[78px]">Jill (Wife)</p>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle15} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Ricky (Son)</p>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                <img alt="" className="absolute h-full left-[-86.66%] max-w-none top-[-0.32%] w-[226.18%]" src={imgRectangle16} />
              </div>
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Mary (Daughter)</p>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle17} />
            </div>
            <div className="css-g0mm18 font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">
              <p className="css-ew64yg mb-0">Tom (Son-in-law, </p>
              <p className="css-ew64yg">Marry's husband)</p>
            </div>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle18} />
            </div>
            <div className="css-g0mm18 font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">
              <p className="css-ew64yg mb-0">Sam (Grandson)</p>
              <p className="css-ew64yg">&nbsp;</p>
            </div>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle19} />
            </div>
            <div className="css-g0mm18 font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">
              <p className="css-ew64yg mb-0">Sarah (Grand</p>
              <p className="css-ew64yg">daughter-in-law)</p>
            </div>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4px]">
                <img alt="" className="absolute h-full left-[-6.02%] max-w-none top-0 w-[151.16%]" src={imgRectangle20} />
              </div>
            </div>
            <p className="css-4hzbpn font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black text-center w-[78px]">Eddie (Great grand son)</p>
          </div>
        </div>
      </div>

      <button 
        className="absolute inset-[32.49%_3.98%_64.76%_90.05%] cursor-pointer hover:scale-110 transition-transform"
      >
        <Plus className="w-full h-full" />
      </button>

      {/* Friends Section */}
      <div className="absolute content-stretch flex flex-col gap-[6px] items-start left-[16px] top-[664px] w-[370px]">
        <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-black w-full">Friends</p>
        
        <div className="content-center flex flex-wrap gap-[2.9858014583587646px_2.986px] items-center relative shrink-0 w-full">
          <button
            onClick={() => setSelectedProfile('joe')}
            className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle10} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Joe (neighbor)</p>
          </button>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle9} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Peter (neighbor)</p>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle11} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Mike (bestfriend)</p>
          </div>
          
          <div className="content-stretch flex flex-col gap-[2px] items-center justify-center relative shrink-0">
            <div className="h-[130px] relative rounded-[4px] shrink-0 w-[86px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[4px] size-full" src={imgRectangle12} />
            </div>
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[10px] text-black">Leo (best friend)</p>
          </div>
        </div>
      </div>

      <BottomNav currentScreen="memories" onNavigate={onNavigate} />
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}