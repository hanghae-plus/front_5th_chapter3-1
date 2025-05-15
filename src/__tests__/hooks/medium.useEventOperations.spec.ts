import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../entities/event/api/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => {
  const actual = require('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

it('새로운 이벤트를 저장하면 이벤트 목록에 추가되어야 한다.', async () => {
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

it('기존 이벤트의 title, endTime을 수정하면 변경된 값이 반영되어야 한다.', async () => {
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

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다.", async () => {
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

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다.", async () => {
  vi.resetModules();

  const { result } = renderHook(() => useEventOperations(true));

  const input: Event = {
    id: 'asd',
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
    return await result.current.saveEvent(input);
  });

  expect(mockToast).toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });
});
