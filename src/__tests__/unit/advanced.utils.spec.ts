import { describe, it, expect } from 'vitest';

import { Event } from '../../types.ts';
import { getEventStyles, getNotificationLabel } from '../utils.ts';

describe('getNotificationLabel', () => {
  it('옵션 목록에서 일치하는 값이 있으면 해당 라벨을 반환한다', () => {
    const notificationTime = 10;
    const options = [
      { value: 5, label: '5분 전' },
      { value: 10, label: '10분 전' },
      { value: 15, label: '15분 전' },
      { value: 30, label: '30분 전' },
    ];

    const result = getNotificationLabel(notificationTime, options);
    expect(result).toBe('10분 전');
  });
});

describe('getEventStyles', () => {
  it('알림을 받은 이벤트는 알맞는 스타일을 반환한다', () => {
    const event = { id: 'event1', title: '테스트 이벤트' } as Event;
    const notifiedEvents = ['event1', 'event2', 'event3'];
    const styles = getEventStyles(event, notifiedEvents);

    expect(styles.bg).toBe('red.100');
    expect(styles.fontWeight).toBe('bold');
    expect(styles.color).toBe('red.500');
  });
});
