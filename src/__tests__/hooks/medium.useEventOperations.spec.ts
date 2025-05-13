import * as chakra from '@chakra-ui/react';
import { act, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockToast = vi.fn();
const mockToastFunction = Object.assign(mockToast, {
  update: vi.fn(),
  promise: vi.fn(),
  closeAll: vi.fn(),
  close: vi.fn(),
  isActive: vi.fn(),
});

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToastFunction,
}));

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const onSave = vi.fn();
  const { result } = renderHook(() => useEventOperations(false, onSave));

  const testEvent: EventForm = {
    title: '새로운 이벤트',
    date: '2024-03-21',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 테스트 설명',
    notificationTime: 10,
    location: '새로운 장소',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
  };

  await act(async () => {
    await result.current.saveEvent(testEvent);
  });

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(events.length + 1);

  expect(result.current.events[events.length]).toMatchObject({
    title: testEvent.title,
    date: testEvent.date,
    startTime: testEvent.startTime,
    endTime: testEvent.endTime,
    description: testEvent.description,
    notificationTime: testEvent.notificationTime,
    location: testEvent.location,
    category: testEvent.category,
    repeat: testEvent.repeat,
  });

  expect(onSave).toHaveBeenCalled();
});

it("새로 정의된 'title', 'endTime' 기준으로 일정이 업데이트 된다", async () => {
  const onSave = vi.fn();
  const { result } = renderHook(() => useEventOperations(true, onSave));

  const testEvent: Event = {
    id: '1',
    title: '새로운 이벤트',
    date: '2024-03-21',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 테스트 설명',
    notificationTime: 10,
    location: '새로운 장소',
    category: '미팅',
    repeat: { type: 'none', interval: 0 },
  };

  await act(async () => {
    await result.current.saveEvent(testEvent);
  });

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(events.length);
  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      id: testEvent.id,
      title: testEvent.title,
      date: testEvent.date,
      startTime: testEvent.startTime,
      endTime: testEvent.endTime,
      description: testEvent.description,
      notificationTime: testEvent.notificationTime,
      location: testEvent.location,
      category: testEvent.category,
      repeat: testEvent.repeat,
    })
  );
  expect(onSave).toHaveBeenCalled();
});

it('존재하는 이벤트 삭제시 에러없이 아이템이 삭제된다.', async () => {
  const onSave = vi.fn();
  const { result } = renderHook(() => useEventOperations(true, onSave));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(events.length - 1);
  expect(result.current.events).not.toContainEqual(
    expect.objectContaining({
      id: '1',
    })
  );
  expect(onSave).not.toThrowError();
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  vi.resetModules();

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // toast가 올바른 파라미터로 호출되었는지 확인
  expect(mockToast).toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  vi.resetModules();

  const onSave = vi.fn();

  const { result } = renderHook(() => useEventOperations(true, onSave));

  await act(async () => {
    await result.current.saveEvent({
      id: '9999',
      title: '새로운 이벤트',
      date: '2024-03-21',
      startTime: '14:00',
      endTime: '15:00',
      description: '새로운 테스트 설명',
      notificationTime: 10,
      location: '새로운 장소',
      category: '미팅',
      repeat: { type: 'none', interval: 0 },
    });
  });

  expect(onSave).toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
