import { ChakraProvider } from '@chakra-ui/react';
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

import { useAddOrUpdateEvent } from '../../hooks/useAddOrUpdateEvent';
import { EventForm, Event } from '../../types';

// eslint-disable-next-line no-undef
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

const baseForm: EventForm = {
  title: '회의',
  date: '2025-07-10',
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 1,
    endDate: undefined,
  },
  notificationTime: 10,
};

describe('useAddOrUpdateEvent', () => {
  it('필수 정보가 누락되었을 때 토스트를 표시하고 저장을 막는다.', async () => {
    const saveEvent = vi.fn();
    const resetForm = vi.fn();
    const setOverlappingEvents = vi.fn();
    const setIsOverlapDialogOpen = vi.fn();

    const { result } = renderHook(
      () =>
        useAddOrUpdateEvent({
          eventForm: { ...baseForm, title: '' }, // 제목 누락
          events: [],
          saveEvent,
          resetForm,
          setOverlappingEvents,
          setIsOverlapDialogOpen,
          startTimeError: null,
          endTimeError: null,
          editingEvent: null,
          isRepeating: false,
        }),
      { wrapper }
    );

    await act(() => result.current.addOrUpdateEvent());

    expect(saveEvent).not.toHaveBeenCalled();
    expect(resetForm).not.toHaveBeenCalled();
  });

  it('시간 에러가 있을 경우 저장하지 않는다.', async () => {
    const saveEvent = vi.fn();
    const resetForm = vi.fn();

    const { result } = renderHook(
      () =>
        useAddOrUpdateEvent({
          eventForm: baseForm,
          events: [],
          saveEvent,
          resetForm,
          setOverlappingEvents: vi.fn(),
          setIsOverlapDialogOpen: vi.fn(),
          startTimeError: '오류',
          endTimeError: null,
          editingEvent: null,
          isRepeating: false,
        }),
      { wrapper }
    );

    await act(() => result.current.addOrUpdateEvent());
    expect(saveEvent).not.toHaveBeenCalled();
  });

  it('중복 이벤트가 존재하면 저장하지 않고 다이얼로그를 연다.', async () => {
    const mockEvent: Event = {
      ...baseForm,
      id: '1',
    };

    const setOverlappingEvents = vi.fn();
    const setIsOverlapDialogOpen = vi.fn();

    const { result } = renderHook(
      () =>
        useAddOrUpdateEvent({
          eventForm: baseForm,
          events: [mockEvent],
          saveEvent: vi.fn(),
          resetForm: vi.fn(),
          setOverlappingEvents,
          setIsOverlapDialogOpen,
          startTimeError: null,
          endTimeError: null,
          editingEvent: null,
          isRepeating: false,
        }),
      { wrapper }
    );

    await act(() => result.current.addOrUpdateEvent());

    expect(setOverlappingEvents).toHaveBeenCalledWith([mockEvent]);
    expect(setIsOverlapDialogOpen).toHaveBeenCalledWith(true);
  });

  it('이벤트가 저장되고 폼이 리셋된다.', async () => {
    const saveEvent = vi.fn();
    const resetForm = vi.fn();

    const { result } = renderHook(
      () =>
        useAddOrUpdateEvent({
          eventForm: baseForm,
          events: [],
          saveEvent,
          resetForm,
          setOverlappingEvents: vi.fn(),
          setIsOverlapDialogOpen: vi.fn(),
          startTimeError: null,
          endTimeError: null,
          editingEvent: null,
          isRepeating: false,
        }),
      { wrapper }
    );

    await act(() => result.current.addOrUpdateEvent());

    expect(saveEvent).toHaveBeenCalled();
    expect(resetForm).toHaveBeenCalled();
  });

  it('수정 중인 이벤트의 ID가 유지된다.', async () => {
    const saveEvent = vi.fn();
    const editingEvent = { ...baseForm, id: 'edit-1' };

    const { result } = renderHook(
      () =>
        useAddOrUpdateEvent({
          eventForm: baseForm,
          events: [],
          saveEvent,
          resetForm: vi.fn(),
          setOverlappingEvents: vi.fn(),
          setIsOverlapDialogOpen: vi.fn(),
          startTimeError: null,
          endTimeError: null,
          editingEvent,
          isRepeating: false,
        }),
      { wrapper }
    );

    await act(() => result.current.addOrUpdateEvent());

    expect(saveEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 'edit-1' }));
  });
});
