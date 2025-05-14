import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import allEventDataFromFile from '../../__tests__/dummy/dummyMockEvents.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const mockToastInstance = vi.fn();

vi.mock('@chakra-ui/react', async (importOriginal) => {
  // 실제 모듈의 다른 부분들은 유지하고 싶을 수 있으므로 importOriginal 사용 (선택적)
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return {
    ...actual,
    // useToast가 호출되면 mockToastInstance를 반환하도록 설정
    useToast: () => mockToastInstance,
  };
});

beforeEach(() => {
  setupMockHandlerCreation(eventsForTest);
});

afterEach(() => {
  mockToastInstance.mockClear();
});

const eventsForTest = allEventDataFromFile.events as Event[];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    // 1. 이벤트 데이터 확인
    expect(result.current.events).toEqual(eventsForTest);

    // 2. 성공 토스트 호출 확인
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 로딩 완료!',
        status: 'info',
        duration: 1000,
      })
    );
  });
  // 추가적으로, 토스트가 정확히 한 번 호출되었는지 등을 확인
  expect(mockToastInstance).toHaveBeenCalledTimes(1);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const { result } = renderHook(() => useEventOperations(false)); // editing을 false로 변경

  const newEvent: Event = {
    id: '1',
    title: '새로운 이벤트',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '15:00',
    description: '새로운 이벤트 설명',
    location: '새로운 이벤트 장소',
    category: '새로운 이벤트 카테고리',
    notificationTime: 0,
    repeat: {
      type: 'daily',
      interval: 1,
    },
  };

  // 초기 이벤트 로딩 확인
  await waitFor(() => {
    expect(result.current.events).toEqual(eventsForTest);
  });

  // saveEvent는 비동기 함수이므로 act 내에서 await 사용
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // 토스트 호출 검증 전에 모든 비동기 작업이 완료되도록 대기
  await waitFor(() => {
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  // 추가로 이벤트가 실제로 추가되었는지도 검증
  await waitFor(() => {
    expect(result.current.events.length).toBe(eventsForTest.length + 1);
  });
});

it("이벤트의 'title'과 'endTime'이 성공적으로 업데이트되어야 한다", async () => {
  setupMockHandlerUpdating(eventsForTest);

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(eventsForTest);
  });

  const originalEvent = result.current.events[0]; // 현재 로딩된 이벤트에서 선택
  const updatedEvent = {
    ...originalEvent,
    title: '수정된 이벤트 제목',
    endTime: '18:30',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  await waitFor(() => {
    const updatedEventInList = result.current.events.find((e) => e.id === originalEvent.id);

    // null 체크 먼저
    expect(updatedEventInList).not.toBeNull();
    expect(updatedEventInList).toBeDefined();

    // 이벤트가 있을 때만 필드 검증
    if (updatedEventInList) {
      expect(updatedEventInList.title).toBe('수정된 이벤트 제목');
      expect(updatedEventInList.endTime).toBe('18:30');
    }

    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion(eventsForTest);

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(eventsForTest);
  });

  await act(async () => {
    await result.current.deleteEvent(eventsForTest[0].id);
  });

  // 이벤트가 삭제되었는지 확인
  await waitFor(() => {
    expect(result.current.events.length).toBe(eventsForTest.length - 1);
  });

  await waitFor(() => {
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  expect(result.current.events).toHaveLength(0);

  // 테스트 종료 후 핸들러 초기화 (다른 테스트에 영향 주지 않도록)
  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(JSON.stringify({ message: '이벤트를 찾을 수 없습니다.' }), {
        status: 404,
      });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(eventsForTest);
  });

  const nonExistentEvent: Event = {
    id: 'non-existent-id-12345',
    title: '존재하지 않는 이벤트',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '15:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '테스트',
    notificationTime: 0,
    repeat: {
      type: 'none',
      interval: 0,
    },
  };

  // 존재하지 않는 이벤트 수정 시도
  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  await waitFor(() => {
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  // 테스트 후 핸들러 초기화
  server.resetHandlers();
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
    })
  );

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toEqual(eventsForTest);
  });

  await act(async () => {
    await result.current.deleteEvent(eventsForTest[0].id);
  });

  await waitFor(() => {
    expect(mockToastInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  // 테스트 후 핸들러 초기화
  server.resetHandlers();
});
