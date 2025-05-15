import { DEFAULT_EVENT_FORM } from '@/constants/form';
import { Event, EventForm } from '@/types';
import { convertEventToForm, convertFormToEventData } from '@/utils/eventFormUtils';

describe('eventFormUtils', () => {
  const mockEvent: Event = {
    id: '1',
    title: '미팅',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 미팅',
    location: '회의실',
    category: '업무',
    notificationTime: 15,
    repeat: {
      type: 'weekly',
      interval: 2,
      endDate: '2025-06-20',
    },
  };

  describe('convertEventToForm', () => {
    it('이벤트 객체를 폼 데이터로 변환하고 id를 제외한다', () => {
      const result = convertEventToForm(mockEvent);

      expect(result).not.toHaveProperty('id');
      expect(result.title).toBe(mockEvent.title);
      expect(result.date).toBe(mockEvent.date);
      expect(result.repeat).toEqual(mockEvent.repeat);
    });

    it('null/undefined 값이 있는 경우 기본값으로 대체한다', () => {
      const incompleteEvent = {
        id: '1',
        date: '2025-05-20',
        endTime: '11:00',
        description: '',
        notificationTime: 0,
      } as unknown as Event;

      const result = convertEventToForm(incompleteEvent);

      expect(result.title).toBe(DEFAULT_EVENT_FORM.title);
      expect(result.date).toBe('2025-05-20');
      expect(result.startTime).toBe(DEFAULT_EVENT_FORM.startTime);
      expect(result.repeat).toEqual(DEFAULT_EVENT_FORM.repeat);
    });
  });

  describe('convertFormToEventData', () => {
    const mockForm: EventForm = {
      title: '미팅',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실',
      category: '업무',
      notificationTime: 15,
      repeat: {
        type: 'weekly',
        interval: 2,
        endDate: '2025-06-20',
      },
    };

    it('신규 이벤트 생성 시 id가 없어야 한다', () => {
      const result = convertFormToEventData(mockForm, true, null);

      expect(result).not.toHaveProperty('id');
      expect(result.title).toBe(mockForm.title);
      expect(result.repeat.type).toBe('weekly');
    });

    it('기존 이벤트 수정 시 id가 유지되어야 한다', () => {
      const result = convertFormToEventData(mockForm, true, mockEvent);

      expect(result).toHaveProperty('id', '1');
      expect(result.title).toBe(mockForm.title);
    });

    it('반복 여부가 false일 때 repeat.type이 none으로 설정된다', () => {
      const result = convertFormToEventData(mockForm, false, null);

      expect(result.repeat.type).toBe('none');
      expect(result.repeat.interval).toBe(mockForm.repeat.interval);
    });
  });
});
