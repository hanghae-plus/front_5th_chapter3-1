import { describe, it, expect } from 'vitest';
import { createEventData, CreateEventDataParams } from '../../../src/utils/eventDataUtils';
import { Event, RepeatType } from '../../../src/types';

describe('createEventData', () => {
  const baseParams: Omit<CreateEventDataParams, 'editingEvent'> = {
    title: 'Test Event',
    date: '2024-07-25',
    startTime: '10:00',
    endTime: '11:00',
    description: 'Test description',
    location: 'Test location',
    category: 'Test category',
    isRepeating: false,
    repeatType: 'daily' as RepeatType,
    repeatInterval: 1,
    repeatEndDate: null,
    notificationTime: 10,
  };

  it('새 이벤트 생성 시 (editingEvent is null) 올바른 EventForm 객체를 반환해야 합니다.', () => {
    const params: CreateEventDataParams = {
      ...baseParams,
      editingEvent: null,
    };
    const result = createEventData(params);
    expect((result as { id?: string }).id).toBeUndefined();
    expect(result.title).toBe(baseParams.title);
    expect(result.date).toBe(baseParams.date);
    expect(result.startTime).toBe(baseParams.startTime);
    expect(result.endTime).toBe(baseParams.endTime);
    expect(result.description).toBe(baseParams.description);
    expect(result.location).toBe(baseParams.location);
    expect(result.category).toBe(baseParams.category);
    expect(result.repeat.type).toBe('none');
    expect(result.notificationTime).toBe(baseParams.notificationTime);
  });

  it('기존 이벤트 수정 시 (editingEvent is provided) 올바른 Event 객체를 반환해야 합니다.', () => {
    const editingEvent: Event = {
      id: 'event123',
      title: 'Old Title',
      date: '2024-07-20',
      startTime: '09:00',
      endTime: '10:00',
      description: 'Old description',
      location: 'Old location',
      category: 'Old category',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    };
    const params: CreateEventDataParams = {
      ...baseParams,
      editingEvent,
    };
    const result = createEventData(params);
    expect((result as { id?: string }).id).toBe(editingEvent.id);
    expect(result.title).toBe(baseParams.title); // New title
    // ... 다른 필드들도 새로운 값으로 업데이트되었는지 확인
  });

  it('반복 설정이 활성화된 경우 (isRepeating is true) repeat 객체가 올바르게 설정되어야 합니다.', () => {
    const params: CreateEventDataParams = {
      ...baseParams,
      editingEvent: null,
      isRepeating: true,
      repeatType: 'weekly' as RepeatType,
      repeatInterval: 2,
      repeatEndDate: '2024-12-31',
    };
    const result = createEventData(params);
    expect(result.repeat.type).toBe('weekly');
    expect(result.repeat.interval).toBe(2);
    expect(result.repeat.endDate).toBe('2024-12-31');
  });

  it('반복 설정이 비활성화된 경우 (isRepeating is false) repeat.type이 "none"으로 설정되어야 합니다.', () => {
    const params: CreateEventDataParams = {
      ...baseParams,
      editingEvent: null,
      isRepeating: false,
    };
    const result = createEventData(params);
    expect(result.repeat.type).toBe('none');
    // isRepeating이 false일 때 interval과 endDate는 사용되지 않으므로,
    // createEventData 내부 로직에 따라 undefined 또는 기본값이 될 수 있습니다.
    // 현재 로직에서는 repeatInterval (params.repeatInterval)을 그대로 사용하고 endDate는 undefined가 됩니다.
    expect(result.repeat.interval).toBe(baseParams.repeatInterval);
    expect(result.repeat.endDate).toBeUndefined();
  });

  it('반복 종료일(repeatEndDate)이 null인 경우 repeat.endDate가 undefined로 설정되어야 합니다.', () => {
    const params: CreateEventDataParams = {
      ...baseParams,
      editingEvent: null,
      isRepeating: true,
      repeatType: 'monthly' as RepeatType,
      repeatInterval: 1,
      repeatEndDate: null, // 명시적으로 null
    };
    const result = createEventData(params);
    expect(result.repeat.type).toBe('monthly');
    expect(result.repeat.endDate).toBeUndefined();
  });
});
