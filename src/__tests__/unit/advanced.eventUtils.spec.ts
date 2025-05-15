import { Event } from '../../types';
import { getRepeatText } from '../../utils/eventUtils';

describe('getRepeatText', () => {
  it('반복이 없는 경우 null을 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    expect(getRepeatText(event)).toBeNull();
  });

  it('매일 반복되는 일정의 텍스트를 올바르게 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'daily',
        interval: 1,
      },
      notificationTime: 10,
    };

    expect(getRepeatText(event)).toBe('반복: 1일마다');
  });

  it('매주 반복되는 일정의 텍스트를 올바르게 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'weekly',
        interval: 2,
      },
      notificationTime: 10,
    };

    expect(getRepeatText(event)).toBe('반복: 2주마다');
  });

  it('매월 반복되는 일정의 텍스트를 올바르게 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'monthly',
        interval: 1,
      },
      notificationTime: 10,
    };

    expect(getRepeatText(event)).toBe('반복: 1월마다');
  });

  it('종료일이 있는 반복 일정의 텍스트를 올바르게 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '테스트 카테고리',
      repeat: {
        type: 'daily',
        interval: 1,
        endDate: '2024-12-31',
      },
      notificationTime: 10,
    };

    expect(getRepeatText(event)).toBe('반복: 1일마다 (종료: 2024-12-31)');
  });
});
