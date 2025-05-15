import { Event, EventForm } from '../../types';
import { validateEventFields, validateEventTime } from '../../utils/eventValidation';

describe('validateEventFields', () => {
  it('모든 필수 필드가 있는 경우 유효한 결과를 반환해야 함', () => {
    const validEvent: EventForm = {
      title: '테스트 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = validateEventFields(validEvent);
    expect(result.isValid).toBe(true);
  });

  it('필수 필드가 누락된 경우 오류 메시지를 반환해야 함', () => {
    const invalidEvent: EventForm = {
      title: '',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = validateEventFields(invalidEvent);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('필수 정보를 모두 입력해주세요.');
  });
});

describe('validateEventTime', () => {
  const existingEvents: Event[] = [
    {
      id: '1',
      title: '기존 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('시간이 겹치지 않는 경우 유효한 결과를 반환해야 함', () => {
    const newEvent: EventForm = {
      title: '새로운 일정',
      date: '2025-05-16',
      startTime: '11:00',
      endTime: '12:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = validateEventTime(newEvent, existingEvents);
    expect(result.isValid).toBe(true);
  });

  it('시간이 겹치는 경우 오류 메시지와 겹치는 이벤트를 반환해야 함', () => {
    const overlappingEvent: EventForm = {
      title: '겹치는 일정',
      date: '2025-05-16',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const result = validateEventTime(overlappingEvent, existingEvents);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('시간이 겹치는 일정이 있습니다.');
    expect(result.overlappingEvents).toHaveLength(1);
  });
});
