import { ArrowLeft } from 'lucide-react';
import imgRectangle21 from "figma:asset/91c9a7ee01d28072b0aa54fbe327c0322101d29c.png";
import imgRectangle20 from "figma:asset/a05160d36547cdfe1d58ca2b1abbe0d03bbd35c5.png";
import imgRectangle22 from "figma:asset/6782b5e874424f278eb335acb0e4cd7a1eeaed50.png";
import imgRectangle23 from "figma:asset/96c20c19422f3b32394555be7e4e30f29f38d0fd.png";

interface Memory {
  id: string;
  image: string;
  title: string;
}

interface PersonProfileProps {
  name: string;
  relation: string;
  age: string;
  interests: string[];
  facts: string[];
  profileImage: string;
  backgroundImage?: string;
  memories: Memory[];
  onBack: () => void;
}

export function PersonProfile({
  name,
  relation,
  age,
  interests,
  facts,
  profileImage,
  backgroundImage,
  memories,
  onBack
}: PersonProfileProps) {
  return (
    <div className="bg-[#f7fbff] relative size-full overflow-y-auto pb-[80px]">
      {/* Header with background and profile image */}
      <div className="relative h-[200px] w-full">
        {backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-200">
            <img 
              src={backgroundImage} 
              alt="Background" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        {!backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-200" />
        )}
        
        <button 
          onClick={onBack}
          className="absolute left-4 top-8 z-50 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full hover:bg-white transition-colors shadow-lg border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span className="text-[14px] font-semibold text-black">Back</span>
        </button>

        <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-[120px] h-[120px] rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            <img 
              src={profileImage} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-[70px] px-6">
        <h1 className="text-[24px] font-bold text-black text-center mb-1">{name}</h1>
        <p className="text-[14px] text-gray-600 text-center mb-6">{relation}</p>

        {/* Info Cards */}
        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-[10px] text-gray-500 mb-2">Age</p>
            <p className="text-[16px] font-semibold text-black">{age}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-[10px] text-gray-500 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[12px]">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-[10px] text-gray-500 mb-2">Things to Remember</p>
            <ul className="space-y-2">
              {facts.map((fact, idx) => (
                <li key={idx} className="text-[14px] text-black flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Memories Section */}
        <div className="mb-20">
          <h2 className="text-[18px] font-bold text-black mb-4">Recent Memories Together</h2>
          <div className="flex gap-[8px] overflow-x-auto pb-4">
            {memories.map((memory) => (
              <div key={memory.id} className="flex-shrink-0 flex flex-col gap-[2px] items-center">
                <div className="h-[130px] w-[86px] relative rounded-[4px] overflow-hidden">
                  <img 
                    src={memory.image} 
                    alt={memory.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] text-black text-center w-[86px] leading-tight">
                  {memory.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Predefined profile data
export const profileData = {
  john: {
    name: 'John Smith',
    relation: 'Me',
    age: '78 years old',
    interests: ['Gardening', 'Reading', 'Church', 'Coffee'],
    facts: [
      'Retired engineer who worked at Boeing for 35 years',
      'Loves spending time in the garden every morning',
      'Married to Jill for 52 years',
      'Has two children: Mary and Ricky'
    ],
    profileImage: 'figma:asset/c0adce7f65fc6df1d30d46227d857ce5560f3502.png',
    memories: [
      { id: '1', image: imgRectangle21, title: "Grandson Sam's Wedding" },
      { id: '2', image: imgRectangle20, title: "Great grandson Eddie's birthday" },
      { id: '3', image: imgRectangle22, title: "Family vacation in Hawaii" },
      { id: '4', image: imgRectangle23, title: "Daughter Mary's Visit" },
    ]
  },
  joe: {
    name: 'Joe Wilson',
    relation: 'Neighbor & Best Friend',
    age: '76 years old',
    interests: ['Golf', 'Fishing', 'Coffee', 'Woodworking'],
    facts: [
      'Lived next door for 25 years',
      'You both play golf together every Thursday',
      'He helped you build your garden shed',
      'His wife Betty makes amazing apple pie',
      'You served in the Navy together in the 1960s'
    ],
    profileImage: 'figma:asset/2236f7cc6a3079e99dcb27a7af481bf8b4b07353.png',
    memories: [
      { id: '1', image: imgRectangle21, title: 'Golf outing last month' },
      { id: '2', image: imgRectangle22, title: 'Coffee at the diner' },
      { id: '3', image: imgRectangle20, title: 'Fishing trip' },
      { id: '4', image: imgRectangle23, title: 'Building the shed' },
    ]
  },
  wedding: {
    name: "Sam's Wedding",
    relation: 'Special Memory',
    age: 'June 2023',
    interests: ['Family', 'Celebration', 'Love'],
    facts: [
      'Your grandson Sam married Sarah',
      'The ceremony was at St. Mary\'s Church',
      'You gave a touching speech at the reception',
      'The whole family was there to celebrate',
      'It was a beautiful summer day'
    ],
    profileImage: imgRectangle21,
    memories: [
      { id: '1', image: imgRectangle21, title: 'The ceremony' },
      { id: '2', image: imgRectangle22, title: 'Family photo' },
      { id: '3', image: imgRectangle20, title: 'Your speech' },
      { id: '4', image: imgRectangle23, title: 'The reception' },
    ]
  }
};