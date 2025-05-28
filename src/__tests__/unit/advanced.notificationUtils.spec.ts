import { getNotificationLabel } from '../../utils/notificationUtils';

describe('getNotificationLabel', () => {
  it('알림 시간이 1분일 때 "1분 전"을 반환한다', () => {
    const label = getNotificationLabel(1);

    expect(label).toBe('1분 전');
  });

  it('알림 시간이 10분일 때 "10분 전"을 반환한다', () => {
    const label = getNotificationLabel(10);

    expect(label).toBe('10분 전');
  });

  it('알림 시간이 60분일 때 "1시간 전"을 반환한다', () => {
    const label = getNotificationLabel(60);

    expect(label).toBe('1시간 전');
  });

  it('알림 시간이 120분일 때 "2시간 전"을 반환한다', () => {
    const label = getNotificationLabel(120);

    expect(label).toBe('2시간 전');
  });

  it('알림 시간이 1440분일 때 "1일 전"을 반환한다', () => {
    const label = getNotificationLabel(1440);

    expect(label).toBe('1일 전');
  });
});
