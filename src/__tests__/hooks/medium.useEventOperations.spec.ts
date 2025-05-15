import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlers } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import { events } from '../../__mocks__/response/mockEvents.json' assert { type: 'json' };

const MOCK_EVENTS = events as Event[];

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

beforeEach(() => {
  setupMockHandlers(MOCK_EVENTS);
});
it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => result.current.events.length !== 0);

  expect(result.current.events).toEqual(MOCK_EVENTS);

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 로딩 완료!',
    status: 'info',
    duration: 1000,
  });
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const newEvent: Event = {
    id: `${MOCK_EVENTS.length + 1}`,
    title: '테스트 회의1',
    date: '2025-05-14',
    startTime: '11:00',
    endTime: '23:00',
    description: '기존 팀 미팅 5',
    location: '회의실 F',
    category: '업무 회의',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => await result.current.saveEvent(newEvent));

  const lastEvent = [...result.current.events].pop();

  expect(lastEvent).toEqual(newEvent);

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 추가되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const modifiedEvent = {
    ...MOCK_EVENTS[0],
    title: '테스트 회의2',
    endTime: '23:00',
  };

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(async () => await result.current.saveEvent(modifiedEvent));

  expect(result.current.events[0]).toEqual(modifiedEvent);

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 수정되었습니다.',
    status: 'success',
    duration: 3000,
    isClosable: true,
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => result.current.events.length !== 0);

  const initEventCount = result.current.events.length;

  await waitFor(async () => await result.current.deleteEvent('1'));

  expect(result.current.events.length).toEqual(initEventCount - 1);

  expect(mockToast).toHaveBeenCalledWith({
    title: '일정이 삭제되었습니다.',
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => result.current.events.length !== 0);

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const nonExistedEvent = {
    ...MOCK_EVENTS[0],
    id: '100',
  };

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(async () => await result.current.saveEvent(nonExistedEvent));

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(async () => await result.current.deleteEvent('1'));

  expect(mockToast).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});
