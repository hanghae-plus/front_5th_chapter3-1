import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, RepeatType } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  // Given: 초기 이벤트 데이터 설정
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none' as RepeatType, interval: 0 },
      notificationTime: 10,
    },
  ];

  setupMockHandlerCreation(mockEvents);

  // When: 훅 렌더링
  const { result } = renderHook(() => useEventOperations(false));

  // Then: 이벤트 데이터가 정상적으로 불러와지는지 확인
  await vi.waitFor(() => {
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].title).toBe('기존 회의');
  });

  // 로딩 완료 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 로딩 완료!',
      status: 'info',
    })
  );
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  // Given: 새 이벤트를 저장할 수 있도록 핸들러 설정
  setupMockHandlerCreation();

  // When: 훅 렌더링 및 이벤트 저장
  const onSaveMock = vi.fn();
  const { result } = renderHook(() => useEventOperations(false, onSaveMock));

  const newEvent: Omit<Event, 'id'> = {
    title: '새 회의',
    date: '2025-10-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none' as RepeatType, interval: 0 },
    notificationTime: 15,
  };

  // Then: 이벤트 저장 실행
  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  // 성공 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 추가되었습니다.',
      status: 'success',
    })
  );

  // onSave 콜백이 호출되었는지 확인
  expect(onSaveMock).toHaveBeenCalled();
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  // Given: 이벤트 업데이트를 위한 핸들러 설정
  setupMockHandlerUpdating();

  // When: 훅 렌더링 및 이벤트 업데이트
  const onSaveMock = vi.fn();
  const { result } = renderHook(() => useEventOperations(true, onSaveMock));

  // 기존 데이터가 로드될 때까지 대기
  await vi.waitFor(() => {
    expect(result.current.events).toHaveLength(2);
  });

  const updatedEvent: Event = {
    ...result.current.events[0],
    title: '업데이트된 회의',
    endTime: '11:00',
  };

  // Then: 이벤트 업데이트 실행
  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  // 성공 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 수정되었습니다.',
      status: 'success',
    })
  );

  // onSave 콜백이 호출되었는지 확인
  expect(onSaveMock).toHaveBeenCalled();
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  // Given: 이벤트 삭제를 위한 핸들러 설정
  setupMockHandlerDeletion();

  // When: 훅 렌더링 및 이벤트 삭제
  const { result } = renderHook(() => useEventOperations(false));

  // 기존 데이터가 로드될 때까지 대기
  await vi.waitFor(() => {
    expect(result.current.events).toHaveLength(1);
  });

  // Then: 이벤트 삭제 실행
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 성공 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정이 삭제되었습니다.',
      status: 'info',
    })
  );

  // 이벤트가 삭제되었는지 확인 (API에서 빈 배열 반환 처리 필요)
  await vi.waitFor(() => {
    expect(result.current.events).toHaveLength(0);
  });
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // Given: 이벤트 로딩 실패 핸들러 설정
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // When: 훅 렌더링
  renderHook(() => useEventOperations(false));

  // Then: 에러 토스트가 표시되었는지 확인
  await vi.waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  // Given: 존재하지 않는 이벤트 업데이트 실패 핸들러 설정
  server.use(
    http.put('/api/events/:id', () => {
      return new HttpResponse(null, { status: 404 });
    })
  );

  // When: 훅 렌더링 및 존재하지 않는 이벤트 업데이트
  const { result } = renderHook(() => useEventOperations(true));

  const nonExistentEvent: Event = {
    id: '999',
    title: '존재하지 않는 이벤트',
    date: '2025-10-25',
    startTime: '14:00',
    endTime: '15:00',
    description: '존재하지 않는 이벤트',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none' as RepeatType, interval: 0 },
    notificationTime: 5,
  };

  // Then: 이벤트 업데이트 실행
  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  // 에러 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 저장 실패',
      status: 'error',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  // Given: 네트워크 오류로 인한 삭제 실패 핸들러 설정
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // When: 훅 렌더링 및 이벤트 삭제 시도
  const { result } = renderHook(() => useEventOperations(false));

  // Then: 이벤트 삭제 실행
  await act(async () => {
    await result.current.deleteEvent('1');
  });

  // 에러 토스트가 표시되었는지 확인
  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
    })
  );
});
