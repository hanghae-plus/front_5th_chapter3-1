import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import { MOCK_DATA } from '../mock';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-13-002', '14:30')).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-13-02', '33:30')).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '')).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  const eventDate = MOCK_DATA[0];
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(eventDate)).toEqual({
      start: parseDateTime('2025-05-20', '10:00'),
      end: parseDateTime('2025-05-20', '11:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(convertEventToDateRange({ ...eventDate, date: '2025-13-002' })).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(convertEventToDateRange({ ...eventDate, startTime: '33:30', endTime: '34:30' })).toEqual(
      {
        start: new Date('Invalid Date'),
        end: new Date('Invalid Date'),
      }
    );
  });
});

describe('isOverlapping', () => {
  const eventTime1 = MOCK_DATA[0];
  const eventTime2 = MOCK_DATA[1];
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(eventTime1, eventTime1)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(eventTime1, eventTime2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const newEvent: Event = {
    id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
    title: '팀 회의',
    date: '2025-05-20',
    startTime: '09:00',
    endTime: '12:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  };
  const events = MOCK_DATA;
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(findOverlappingEvents(newEvent, events)).toEqual([]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents(newEvent, events.slice(-1))).toEqual([]);
  });
});
