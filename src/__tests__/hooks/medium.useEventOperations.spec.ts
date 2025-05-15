import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// Chakra UI의 toast 함수를 대체할 모의 함수
// 호출 횟수, 전달된 인자 등을 추적할 수 있음
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

// 각 테스트 전에 toast 모의 함수 초기화
beforeEach(() => {
  toastFn.mockClear();
});

it('저장되어있는 초기 이벤트 데이터를 제대로 불러오는지 확인하고 로딩 완료 토스트가 표시된다', async () => {
  // events.json 파일에서 불러온 이벤트 데이터 사용
  setupMockHandlerCreation(events);

  // renderHook: React 훅을 직접 테스트할 수 있게 해줌
  const { result } = renderHook(() => useEventOperations(false));

  // 이벤트 데이터를 가져오는 비동기 API 호출을 하고 그 작업이 모두 완료될 때까지 기다림
  await act(async () => {
    await result.current.fetchEvents();
  });

  // 이벤트 데이터가 올바르게 로드되었는지 검증
  expect(result.current.events).toHaveLength(events.length);

  // 첫 번째 이벤트 검증
  expect(result.current.events[0].id).toBe(events[0].id);
  expect(result.current.events[0].title).toBe(events[0].title);

  // 로딩 완료 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    })
  );
});

it('기존 이벤트 목록에 새 일정을 추가하면 정확한 필드값으로 저장되고 목록에 추가되고 추가 성공 토스트가 표시된다', async () => {
  setupMockHandlerCreation(events);
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // 초기 이벤트 수
  const initialEventCount = result.current.events.length;
  expect(result.current.events).toHaveLength(initialEventCount);

  // 새로 추가할 일정
  const newEvent: Omit<Event, 'id'> = {
    title: '중요 프로젝트 킥오프 미팅',
    date: '2025-10-22',
    startTime: '13:00',
    endTime: '14:30',
    description: '신규 프로젝트 시작 논의 및 담당자 배정',
    location: '본사 회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 15,
  };

  // 새 일정 추가
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // 이벤트 목록에 일정이 추가되었는지 확인
  expect(result.current.events).toHaveLength(initialEventCount + 1);
  // 새로 추가된 일정이 목록의 마지막에 있는지 확인
  const addedEvent = result.current.events[result.current.events.length - 1];
  // 새 일정에 ID가 할당이 되었는지 확인
  expect(addedEvent.id).toBe(String(events.length + 1));

  // 성공 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("기존 이벤트의 'title'과 'endTime'이 수정되고 성공 토스트가 표시된다", async () => {
  // 기존 일정이 있는 상태로 시작
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  // 기존 일정 불러오기
  await act(async () => {
    await result.current.fetchEvents();
  });

  // 불러온 초기 데이터 확인
  expect(result.current.events).toHaveLength(2);

  // 수정할 일정의 원본 데이터 저장
  const originalEvent = { ...result.current.events[0] };

  // 수정할 필드만 포함한 업데이트 객체 생성
  const updatedEvent: Event = {
    ...originalEvent,
    title: '업데이트한 회의 제목',
    endTime: '10:30',
  };

  // 일정 업데이트 함수 호출
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  const updatedEventResult = result.current.events.find((e) => e.id === originalEvent.id);
  expect(updatedEventResult).toBeDefined();

  // 변경된 필드가 올바르게 업데이트되었는지 확인
  expect(updatedEventResult?.title).toBe('업데이트한 회의 제목');
  expect(updatedEventResult?.endTime).toBe('10:30');

  // 성공 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  );
});

it('존재하는 이벤트를 삭제할 경우, 기존 이벤트가 제거되고 삭제 완료 토스트가 표시된다', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  // 초기 데이터 확인
  expect(result.current.events).toHaveLength(1);

  // 삭제할 이벤트 ID
  const idToDelete = result.current.events[0].id;

  // 이벤트 삭제
  await act(async () => {
    await result.current.deleteEvent(idToDelete);
  });

  // 이벤트가 삭제 되었는지 확인
  expect(result.current.events).toHaveLength(0);

  // 성공 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 에러 응답을 모킹
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(0);

  // 에러 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '이벤트 로딩 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  setupMockHandlerCreation(events);
  const { result } = renderHook(() => useEventOperations(true));

  // 404 에러 응답 모킹
  server.use(
    http.put('/api/events/2', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  // 기존 일정 불러오기
  await act(async () => {
    await result.current.fetchEvents();
  });

  // 불러온 초기 데이터 확인
  expect(result.current.events).toHaveLength(1);

  // 수정할 일정의 원본 데이터 저장
  const originalEvent = { ...result.current.events[0] };

  // 수정할 필드만 포함한 업데이트 객체 생성
  const updatedEvent: Event = {
    ...originalEvent,
    id: '2',
    title: '업데이트한 회의 제목',
  };

  // 일정 업데이트 함수 호출
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  // 에러 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerDeletion();
  // 네트워크 오류 모킹
  server.use(
    http.delete('/api/events/1', () => {
      return new HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 에러 toast 메시지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});
