import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdateById,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toEqual(initEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(false));

  const newEvent = {
    title: '새로운 이벤트',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '새로운 이벤트 설명',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  } as EventForm;

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  await act(async () => {
    await result.current.fetchEvents();
  });

  // 전체 이벤트 개수가 1 증가했는지 확인
  expect(result.current.events.length).toBe(initEvents.length + 1);

  // 새로 저장된 이벤트 찾기
  const savedEvent = result.current.events.find(
    (event) => event.title === newEvent.title && event.date === newEvent.date
  );

  // 새 이벤트가 존재하는지 확인
  expect(savedEvent).toBeDefined();

  // ID가 자동 생성되었는지 확인
  expect(savedEvent?.id).toBeDefined();
  expect(typeof savedEvent?.id).toBe('string');

  // 나머지 필드들이 입력한 값과 일치하는지 확인
  expect(savedEvent).toMatchObject(newEvent);

  // 기존 이벤트들이 그대로 유지되었는지 확인
  const existingEvents = result.current.events.filter((event) => event.id !== savedEvent?.id);
  expect(existingEvents).toEqual(initEvents);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const initEvents = [...events] as Event[];
  setupMockHandlerCreation(initEvents);

  const { result } = renderHook(() => useEventOperations(false));
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
