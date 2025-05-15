import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

const events: Event[] = [
  {
    "id": "1",
    "title": "기존 회의",
    "date": "2025-10-15",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 10
  },
  {
    "id": "2",
    "title": "이벤트 2",
    "date": "2025-07-03",
    "startTime": "10:00",
    "endTime": "11:30",
    "description": "신규 프로젝트 시작 회의",
    "location": "회의실 A",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 15
  },
  {
    "id": "3",
    "title": "헬스장 예약",
    "date": "2025-07-10",
    "startTime": "18:00",
    "endTime": "19:00",
    "description": "PT 트레이닝 세션",
    "location": "헬스장 2관",
    "category": "개인",
    "repeat": { "type": "weekly", "interval": 1 },
    "notificationTime": 30
  },
  {
    "id": "4",
    "title": "부서 점심 회식",
    "date": "2025-07-19",
    "startTime": "12:30",
    "endTime": "14:00",
    "description": "부서 단합을 위한 점심 식사",
    "location": "홍대 맛집",
    "category": "사교",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 60
  },
  {
    "id": "5",
    "title": "디자인 리뷰",
    "date": "2025-08-01",
    "startTime": "15:00",
    "endTime": "16:00",
    "description": "UI/UX 최종 검토",
    "location": "Zoom",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 10
  },
  {
    "id": "6",
    "title": "치과 진료",
    "date": "2025-07-25",
    "startTime": "09:30",
    "endTime": "10:00",
    "description": "정기 스케일링",
    "location": "강남 치과",
    "category": "개인",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 20
  },
  {
    "id": "7",
    "title": "정기 세미나",
    "date": "2025-09-12",
    "startTime": "14:00",
    "endTime": "16:00",
    "description": "기술 동향 발표 및 토론",
    "location": "세미나실 C",
    "category": "업무",
    "repeat": { "type": "monthly", "interval": 1 },
    "notificationTime": 15
  },
  {
    "id": "8",
    "title": "친구 생일 파티",
    "date": "2025-07-30",
    "startTime": "19:00",
    "endTime": "22:00",
    "description": "민지 생일 파티 참석",
    "location": "이태원 라운지",
    "category": "사교",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 120
  },
  {
    "id": "9",
    "title": "재택근무 일정",
    "date": "2025-08-16",
    "startTime": "09:00",
    "endTime": "18:00",
    "description": "전사 재택근무일",
    "location": "자택",
    "category": "업무",
    "repeat": { "type": "weekly", "interval": 1 },
    "notificationTime": 5
  }
]

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(events, '이벤트 2', new Date('2025-07-01'), 'month');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'week');

    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-10'), 'month');

    expect(result.map((e) => e.id).sort()).toEqual(['2', '3', '4']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(events, '이벤트', new Date('2025-07-01'), 'week');

    expect(result.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-07-01'), 'month');

    expect(result.map((e) => e.id)).toEqual(['2', '3', '4']);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(events, 'quick_meeting', new Date('2025-07-01'), 'month');

    expect(result.map((e) => e.id)).toEqual(['4']);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(events, '', new Date('2025-06-01'), 'month');

    expect(result.map((e) => e.id)).toEqual(['1']);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '', new Date('2025-07-01'), 'month');

    expect(result).toEqual([]);
  });
});
