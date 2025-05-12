import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

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
  setupMockHandlerCreation();
  const { result } = renderHook(() => useEventOperations(false));
  expect(result.current.events).toEqual([]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정이 추가되었습니다.' })
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();
  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: '1',
      title: '회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정이 수정되었습니다.' })
  );
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('2b7545a6-ebee-426c-b906-2329bc8d62bd');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({ title: '일정이 삭제되었습니다.' })
  );
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => HttpResponse.error()) // 500 오류 시뮬레이션
  );

  renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  server.use(http.put('/api/events/:id', () => HttpResponse.error()));

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () => {
    await result.current.saveEvent({
      id: 'non-existing-id',
      title: '회의',
      date: '2025-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    });
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 3000,
      isClosable: true,
      status: 'error',
      title: '일정 저장 실패',
    })
  );
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(http.delete('/api/events/:id', () => HttpResponse.error()));
  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('non-existing-id');
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 삭제 실패',
      status: 'error',
      duration: 3000,
      isClosable: true,
    })
  );
});
