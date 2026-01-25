/**
 * Demo data for testing timeline display
 * Pre-populated entries for offline demonstration
 */

// Generate timestamps relative to now
const now = new Date();
const minutesAgo = (mins) => new Date(now.getTime() - mins * 60 * 1000);

export const DEMO_TIMELINE = [
    {
        id: 'demo-1',
        timestamp: minutesAgo(60),
        summary: '해커톤 발표 준비 중 - AR 시스템 개발',
        transcript: '오늘 해커톤에서 발표할 AR 시스템을 개발하고 있습니다. 알츠하이머 환자를 위한 기억 보조 시스템이에요.',
        photo: null // Will use placeholder
    },
    {
        id: 'demo-2',
        timestamp: minutesAgo(40),
        summary: '팀원과 코드 리뷰 진행',
        transcript: '팀원들과 코드 리뷰를 진행했습니다. WebXR 부분을 검토하고 몇 가지 버그를 수정했어요.',
        photo: null
    },
    {
        id: 'demo-3',
        timestamp: minutesAgo(20),
        summary: '점심 식사 - 카페에서 샌드위치',
        transcript: '점심을 먹으러 근처 카페에 갔습니다. 샌드위치와 커피를 주문했어요.',
        photo: null
    },
    {
        id: 'demo-4',
        timestamp: minutesAgo(5),
        summary: 'Meta Quest 3에서 AR 테스트 중',
        transcript: 'Quest 3 헤드셋을 착용하고 AR 기능을 테스트하고 있습니다. 타임라인이 잘 보이네요.',
        photo: null
    }
];

/**
 * Generate a unique ID for timeline entries
 */
export function generateEntryId() {
    return `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a demo entry with current timestamp
 */
export function createDemoEntry(index = 0) {
    const activities = [
        '음성 녹음 테스트 진행 중',
        'AR 타임라인 확인 중',
        '시스템 기능 점검 완료',
        '사용자 인터페이스 검토'
    ];

    return {
        id: generateEntryId(),
        timestamp: new Date(),
        summary: activities[index % activities.length],
        transcript: `테스트 항목 ${index + 1}: ${activities[index % activities.length]}`,
        photo: null
    };
}
