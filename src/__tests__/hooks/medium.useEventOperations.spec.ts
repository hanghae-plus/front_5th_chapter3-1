import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
  setupMockHandlerNetworkFailure,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => {
  const actual = require('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const MOCK_EVENT: Event = {
  id: '',
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 0,
};

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation();

  const { result: eventOperations } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual(events);
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();

  const { result: eventOperations } = renderHook(() => useEventOperations(false));

  act(() => {
    eventOperations.current.saveEvent({
      ...MOCK_EVENT,
      id: '2',
    });
  });

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual([...events, { ...MOCK_EVENT, id: '2' }]);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 추가되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result: eventOperations } = renderHook(() => useEventOperations(true));

  act(() => {
    eventOperations.current.saveEvent({
      ...(events[0] as Event),
      title: '새로운 이벤트',
    });
  });

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual([{ ...events[0], title: '새로운 이벤트' }]);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result: eventOperations } = renderHook(() => useEventOperations(true));

  act(() => {
    eventOperations.current.deleteEvent(events[0].id);
  });

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual(events.slice(1));
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 삭제되었습니다.',
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  setupMockHandlerNetworkFailure();

  const { result: eventOperations } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual([]);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerUpdating();

  const { result: eventOperations } = renderHook(() => useEventOperations(true));

  act(() => {
    eventOperations.current.saveEvent({
      ...(MOCK_EVENT as Event),
      id: '123',
    });
  });

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual(events);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerNetworkFailure();

  const { result: eventOperations } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual([]);
  });

  act(() => {
    eventOperations.current.deleteEvent('1');
  });

  await waitFor(() => {
    expect(eventOperations.current.events).toEqual([]);
  });

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
