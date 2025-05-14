import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// 2. 목(mock) 토스트 함수 설정
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  // 1. 테스트용 초기 이벤트 데이터 설정
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: '2024-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  // 2. setupMockHandlerCreation 함수를 사용하여 핸들러 설정
  // 초기 이벤트 데이터를 가져오는 것이므로 Creation 핸들러 사용
  setupMockHandlerCreation(mockEvents);

  // 3. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // 4. 초기 데이터 로딩 대기
  await act(async () => {
    await Promise.resolve();
  });

  // 5. 이벤트 데이터 검증
  expect(result.current.events).toEqual(mockEvents);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  // 1. 새로 저장할 이벤트 데이터 정의
  const newEvent: Event = {
    id: '1',
    title: '새로운 이벤트',
    date: '2024-01-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '새 이벤트 설명',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // 2. MSW 핸들러 설정
  setupMockHandlerCreation([]);

  // 3. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // 4. 이벤트 저장 실행
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // 5. 저장된 이벤트 확인
  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0]).toMatchObject({
    ...newEvent,
    id: expect.any(String), // ID는 서버에서 생성되므로 아무 문자열이나 허용
  });
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // 1. 초기 이벤트 데이터 설정
  const initialEvent: Event = {
    id: '1',
    title: '기존 이벤트',
    date: '2024-01-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '이벤트 설명',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // 2. 업데이트할 이벤트 데이터 정의
  const updatedEvent: Event = {
    ...initialEvent,
    title: '수정된 이벤트 제목', // 제목 수정
    endTime: '16:00', // 종료 시간 수정
  };

  // 3. MSW 핸들러 설정 (초기 이벤트로 설정)
  setupMockHandlerUpdating([initialEvent]);

  // 4. 훅 렌더링 (editing 모드를 true로 설정)
  const { result } = renderHook(() => useEventOperations(true));
  console.log('result', result.current.events);

  // 5. 이벤트 수정 실행
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  // 6. 수정된 이벤트 확인
  expect(result.current.events[0]).toMatchObject({
    ...updatedEvent,
    title: '수정된 이벤트 제목',
    endTime: '16:00',
  });
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // 1. 초기 이벤트 데이터 설정
  const initialEvent: Event = {
    id: '1',
    title: '삭제될 이벤트',
    date: '2024-01-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '이벤트 설명',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // 2. MSW 핸들러 설정 (초기 이벤트로 설정)
  setupMockHandlerDeletion([initialEvent]);

  // 3. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // 4. 초기 데이터 로딩 대기
  await act(async () => {
    await Promise.resolve();
  });

  // 5. 초기 상태 확인
  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0]).toEqual(initialEvent);

  // 6. 이벤트 삭제 실행
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 7. 삭제 후 상태 확인
  expect(result.current.events).toHaveLength(0);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // 1. 에러 응답을 반환하는 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // 2. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // 3. 초기 데이터 로딩 대기
  await act(async () => {
    await Promise.resolve();
  });

  // 4. 토스트가 올바른 메시지와 함께 호출되었는지 확인
  expect(mockToast).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  // 5. 이벤트 배열이 비어있는지 확인
  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // 1. 존재하지 않는 이벤트 데이터 설정
  const nonExistentEvent: Event = {
    id: 'non-existent-id',
    title: '존재하지 않는 이벤트',
    date: '2024-01-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '이벤트 설명',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // 2. 404 에러를 반환하는 핸들러 설정
  server.use(
    // GET 요청에 대한 핸들러 추가
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [] });
    }),
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  // 3. mockToast 초기화
  mockToast.mockClear();

  // 4. 훅 렌더링 (editing 모드를 true로 설정)
  const { result } = renderHook(() => useEventOperations(true));

  // 5. 초기 데이터 로딩 대기
  await act(async () => {
    await Promise.resolve();
  });

  // 5. 존재하지 않는 이벤트 수정 시도
  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  // 6. 에러 토스트가 올바르게 표시되었는지 확인
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 저장 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  // 7. 이벤트 목록이 변경되지 않았는지 확인
  expect(result.current.events).toHaveLength(0);
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // 1. 초기 이벤트 데이터 설정
  const initialEvent: Event = {
    id: '1',
    title: '삭제 실패할 이벤트',
    date: '2024-01-01',
    startTime: '14:00',
    endTime: '15:00',
    description: '이벤트 설명',
    location: '회의실 A',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  // 2. 네트워크 오류를 시뮬레이션하는 핸들러 설정
  server.use(
    // GET 요청에 대한 핸들러 - 초기 데이터 반환
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [initialEvent] });
    }),
    // DELETE 요청에 대한 핸들러 - 네트워크 오류 반환
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // 3. mockToast 초기화
  mockToast.mockClear();

  // 4. 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // 5. 초기 데이터 로딩 대기
  await act(async () => {
    await Promise.resolve();
  });

  // 6. 초기 상태 확인
  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0]).toEqual(initialEvent);

  // 7. 이벤트 삭제 시도
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 8. 에러 토스트가 올바르게 표시되었는지 확인
  expect(mockToast).toHaveBeenCalledWith({
    title: '일정 삭제 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  });

  // 9. 이벤트가 여전히 존재하는지 확인 (삭제되지 않았는지)
  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0]).toEqual(initialEvent);
});
