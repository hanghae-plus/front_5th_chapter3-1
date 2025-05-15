import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerNetworkFail,
  setupMockHandlerUpdating,
} from '@/__mocks__/handlersUtils.ts';
import { events } from '@/__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '@/hooks/useEventOperations.ts';
import { server } from '@/setupTests.ts';
import { Event } from '@/types.ts';

waitFor; // 왜 안될까..

const toastFn = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return { ...actual, useToast: () => toastFn };
});

const flushPromise = () => Promise.resolve(); // waitFor 비동작

const common: Event = {
  id: '',
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
} as const;

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const handlers = setupMockHandlerCreation();
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  await act(flushPromise);
  // await waitFor(() => {});
  expect(result.current.events).toEqual(events);

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const handlers = setupMockHandlerCreation();
  server.use(...handlers);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: Event = { ...common, id: '2' };

  act(() => {
    result.current.saveEvent(newEvent);
  });

  await act(flushPromise);
  // await waitFor(() => {});
  expect(result.current.events.length).toBe(2);
  expect(result.current.events[1]).toEqual(newEvent);
  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 추가되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const handler = setupMockHandlerUpdating();
  server.use(...handler);

  const { result } = renderHook(() => useEventOperations(true));

  const updatedEvent: Event = {
    ...(events[0] as Event),
    title: '수정',
    endTime: ' 12:00',
  };

  act(() => {
    result.current.saveEvent(updatedEvent);
  });
  // await waitFor(() => {});
  await act(flushPromise);
  expect(result.current.events[0]).toEqual(updatedEvent);

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const handler = setupMockHandlerDeletion();
  server.use(...handler);

  const { result } = renderHook(() => useEventOperations(false));

  act(() => {
    result.current.deleteEvent(events[0].id);
  });

  await act(flushPromise);
  // await waitFor(() => {});
  expect(result.current.events.length).toBe(0);

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정이 삭제되었습니다.',
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  const handler = setupMockHandlerNetworkFail();
  server.use(handler.get);

  renderHook(() => useEventOperations(false));

  await act(flushPromise);
  // await waitFor(() => {});

  expect(toastFn).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const handler = setupMockHandlerUpdating();
  server.use(...handler);

  const { result } = renderHook(() => useEventOperations(true));
  await act(flushPromise);
  // await waitFor(() => {});

  const updatedEvent: Event = { ...common, id: '1234' };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const handler = setupMockHandlerNetworkFail();
  server.use(handler.delete);

  const { result } = renderHook(() => useEventOperations(false));

  await act(flushPromise);
  // await waitFor(() => {});

  expect(result.current.events.length).toBe(1);

  await act(async () => {
    await result.current.deleteEvent('1');
  });
  expect(result.current.events.length).toBe(1);

  expect(toastFn).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
