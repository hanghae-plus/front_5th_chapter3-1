// src/__tests__/hooks/useEventManagement.spec.ts
import { renderHook, act } from '@testing-library/react';

import { useEventManagement } from '../../hooks/useEventManagement';
import { Event, RepeatType } from '../../types';
import * as eventOverlapModule from '../../utils/eventOverlap';

// findOverlappingEvents 함수를 스파이로 설정
const findOverlappingEventsSpy = vi.spyOn(eventOverlapModule, 'findOverlappingEvents');

// useToast 훅 모킹
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('useEventManagement', () => {
  // 테스트에 사용할 기본 props - 타입에 맞게 수정
  const mockProps = {
    title: '테스트 이벤트',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '설명',
    location: '위치',
    category: '업무',
    isRepeating: false,
    repeatType: 'none' as RepeatType, // 타입 명시적 지정
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    events: [],
    resetForm: vi.fn(),
    saveEvent: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    // 스파이 기본값 설정
    findOverlappingEventsSpy.mockReturnValue([]);
  });

  it('필수 필드가 비어있을 때 유효성 검사 오류가 발생해야 한다', async () => {
    const invalidProps = {
      ...mockProps,
      title: '', // 빈 제목
    };

    const { result } = renderHook(() => useEventManagement(invalidProps));

    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
      })
    );

    expect(invalidProps.saveEvent).not.toHaveBeenCalled();
  });

  it('시간 오류가 있을 때 유효성 검사 오류가 발생해야 한다', async () => {
    const propsWithTimeError = {
      ...mockProps,
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };

    const { result } = renderHook(() => useEventManagement(propsWithTimeError));

    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
      })
    );

    expect(propsWithTimeError.saveEvent).not.toHaveBeenCalled();
  });

  it('겹치는 이벤트가 없을 때 바로 저장이 진행되어야 한다', async () => {
    findOverlappingEventsSpy.mockReturnValue([]); // 겹침 없음

    const { result } = renderHook(() => useEventManagement(mockProps));

    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(findOverlappingEventsSpy).toHaveBeenCalled();
    expect(mockProps.saveEvent).toHaveBeenCalled();
    expect(mockProps.resetForm).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('겹치는 이벤트가 있을 때 경고 다이얼로그가 표시되어야 한다', async () => {
    const overlappingEvent: Event = {
      id: 'overlap-1',
      title: '겹치는 이벤트',
      date: '2025-05-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹침',
      location: '위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    findOverlappingEventsSpy.mockReturnValue([overlappingEvent]);

    const { result } = renderHook(() => useEventManagement(mockProps));

    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(findOverlappingEventsSpy).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual([overlappingEvent]);
    expect(mockProps.saveEvent).not.toHaveBeenCalled();
  });

  it('겹침 경고 후 계속 진행을 선택하면 이벤트가 저장되어야 한다', async () => {
    const overlappingEvent: Event = {
      id: 'overlap-1',
      title: '겹치는 이벤트',
      date: '2025-05-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '겹침',
      location: '위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    findOverlappingEventsSpy.mockReturnValue([overlappingEvent]);

    const { result } = renderHook(() => useEventManagement(mockProps));

    // 1. 이벤트 제출 시도 - 겹침 발견
    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    // 2. 계속 진행 선택
    await act(async () => {
      await result.current.handleContinueSaveAfterOverlap();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(mockProps.saveEvent).toHaveBeenCalled();
    expect(mockProps.resetForm).toHaveBeenCalled();
  });

  it('반복 일정 설정이 이벤트 데이터에 올바르게 포함되어야 한다', async () => {
    const repeatingProps = {
      ...mockProps,
      isRepeating: true,
      repeatType: 'weekly' as RepeatType,
      repeatInterval: 2,
      repeatEndDate: '2025-06-15',
    };

    const { result } = renderHook(() => useEventManagement(repeatingProps));

    await act(async () => {
      await result.current.handleSubmitEvent();
    });

    expect(repeatingProps.saveEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        repeat: {
          type: 'weekly',
          interval: 2,
          endDate: '2025-06-15',
        },
      })
    );
  });
});
