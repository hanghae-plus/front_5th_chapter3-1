// src/hooks/__tests__/useEventValidation.test.ts
import { renderHook } from '@testing-library/react';

import { useEventValidation } from '../../hooks';
import { Event, EventForm } from '../../types';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useEventValidation', () => {
  const mockEvents: Event[] = [
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

  const mockOnSave = vi.fn();
  const mockOnReset = vi.fn();
  const mockOpenOverlapDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 정보가 누락된 경우 토스트 메시지를 표시하고 저장하지 않아야 함', async () => {
    const { result } = renderHook(() =>
      useEventValidation({
        events: mockEvents,
        onSave: mockOnSave,
        onReset: mockOnReset,
        openOverlapDialog: mockOpenOverlapDialog,
      })
    );

    const incompleteEvent: EventForm = {
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

    await result.current.validateAndSaveEvent(incompleteEvent);

    expect(mockToast).toHaveBeenCalledWith({
      title: '필수 정보를 모두 입력해주세요.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnReset).not.toHaveBeenCalled();
  });

  it('시간이 겹치는 일정이 있는 경우 중복 다이얼로그를 열어야 함', async () => {
    const { result } = renderHook(() =>
      useEventValidation({
        events: mockEvents,
        onSave: mockOnSave,
        onReset: mockOnReset,
        openOverlapDialog: mockOpenOverlapDialog,
      })
    );

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

    await result.current.validateAndSaveEvent(overlappingEvent);

    expect(mockOpenOverlapDialog).toHaveBeenCalledWith(mockEvents, overlappingEvent);
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnReset).not.toHaveBeenCalled();
  });

  it('유효한 일정인 경우 저장하고 폼을 초기화해야 함', async () => {
    const { result } = renderHook(() =>
      useEventValidation({
        events: mockEvents,
        onSave: mockOnSave,
        onReset: mockOnReset,
        openOverlapDialog: mockOpenOverlapDialog,
      })
    );

    const validEvent: EventForm = {
      title: '새로운 일정',
      date: '2025-05-17',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명ㅋ',
      location: '위치',
      category: '카테고리',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await result.current.validateAndSaveEvent(validEvent);

    expect(mockOnSave).toHaveBeenCalledWith(validEvent);
    expect(mockOnReset).toHaveBeenCalled();
    expect(mockOpenOverlapDialog).not.toHaveBeenCalled();
  });

  it('기존 일정 수정 시에도 동일한 검증 로직이 적용되어야 함', async () => {
    const { result } = renderHook(() =>
      useEventValidation({
        events: mockEvents,
        onSave: mockOnSave,
        onReset: mockOnReset,
        openOverlapDialog: mockOpenOverlapDialog,
      })
    );

    const updatingEvent: Event = {
      id: '1',
      title: '수정된 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await result.current.validateAndSaveEvent(updatingEvent);

    expect(mockOnSave).toHaveBeenCalledWith(updatingEvent);
    expect(mockOnReset).toHaveBeenCalled();
    expect(mockOpenOverlapDialog).not.toHaveBeenCalled();
  });
});
