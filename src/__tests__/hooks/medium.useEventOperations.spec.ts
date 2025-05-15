import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { HandlersBuilder } from '../../__mocks__/handlersUtils.ts';
import { events as jsonEvents } from '../../__mocks__/response/events.json' assert { type: 'json ' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event, EventForm } from '../../types.ts';

const events = jsonEvents as Event[];

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => {
  const actual = vi.importActual('@chakra-ui/react');

  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe.shuffle('useEventOperations', () => {
  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    // describe.concurrent를 적용한다면 의미없는 실행이라 주석처리
    // vi.clearAllMocks();
    // handlersBuilder = new HandlersBuilder(events);
  });

  it(
    '저장되어있는 초기 이벤트 데이터를 적절하게 불러온다',
    server.boundary(async () => {
      // 핸들러 설정
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.createAll());

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);
        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 로딩 완료!',
          status: 'info',
        })
      );
    })
  );

  it(
    '정의된 이벤트 정보를 기준으로 적절하게 저장이 된다',
    server.boundary(async () => {
      // 핸들러 설정
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.createAll());

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);

        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정 로딩 완료!',
            status: 'info',
          })
        );
      });

      const newEvent: EventForm = {
        title: '새 일정',
        date: '2025-07-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '새 일정 설명',
        location: '회의실',
        category: '회의',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(newEvent);
      });

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length + 1);
        expect(result.current.events[result.current.events.length - 1].title).toBe(newEvent.title);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 추가되었습니다.',
          status: 'success',
        })
      );
    })
  );

  it(
    "새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다",
    server.boundary(async () => {
      // 핸들러 설정
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.createAll());

      const { result } = renderHook(() => useEventOperations(true));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);

        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정 로딩 완료!',
            status: 'info',
          })
        );
      });

      const updatedEvent: Event = {
        ...events[0],
        title: '수정된 일정',
        endTime: '15:00',
      };

      await act(async () => {
        await result.current.saveEvent(updatedEvent);
      });

      await waitFor(() => {
        const updatedEventInList = result.current.events.find(
          (event) => event.id === updatedEvent.id
        );
        expect(updatedEventInList).toBeDefined();
        expect(updatedEventInList?.title).toBe(updatedEvent.title);
        expect(updatedEventInList?.endTime).toBe(updatedEvent.endTime);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정이 수정되었습니다.',
            status: 'success',
          })
        );
      });
    })
  );

  it(
    '존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.',
    server.boundary(async () => {
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.createAll());

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);

        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정 로딩 완료!',
            status: 'info',
          })
        );
      });

      await act(async () => {
        await result.current.deleteEvent(events[0].id);
      });

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length - 1);
        // 삭제된 이벤트의 ID로 검색했을 때 없어야 함
        const deletedEventStillExists = result.current.events.some(
          (event) => event.id === events[0].id
        );
        expect(deletedEventStillExists).toBe(false);
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정이 삭제되었습니다.',
            status: 'info',
          })
        );
      });
    })
  );

  it(
    "이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다",
    server.boundary(async () => {
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.scenarios.loadingFailure());

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '이벤트 로딩 실패',
            status: 'error',
          })
        );

        expect(result.current.events).toHaveLength(0);
      });
    })
  );

  it(
    "존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다",
    server.boundary(async () => {
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.scenarios.savingFailure());

      const { result } = renderHook(() => useEventOperations(true));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);

        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정 로딩 완료!',
            status: 'info',
          })
        );
      });

      // 존재하지 않는 이벤트 ID로 업데이트 시도
      const nonExistentEvent = {
        ...events[0],
        id: 'non-existent-id',
        title: '수정된 제목',
      };

      await act(async () => {
        await result.current.saveEvent(nonExistentEvent);
      });

      // 에러 토스트 확인
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 저장 실패',
          status: 'error',
        })
      );

      // 데이터가 변경되지 않았는지 확인
      expect(result.current.events).toHaveLength(events.length);
      expect(result.current.events[0].title).not.toBe('수정된 제목');
    })
  );

  it(
    "네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다",
    server.boundary(async () => {
      const handlersBuilder = new HandlersBuilder(events);
      server.use(...handlersBuilder.scenarios.deletionFailure());

      const { result } = renderHook(() => useEventOperations(false));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);

        for (let i = 0; i < events.length; i++) {
          expect(result.current.events[i].id).toBe(events[i].id);
        }

        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '일정 로딩 완료!',
            status: 'info',
          })
        );
      });

      await act(async () => {
        await result.current.deleteEvent(events[0].id);
      });

      // 에러 토스트 확인
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정 삭제 실패',
          status: 'error',
        })
      );

      // 데이터가 변경되지 않았는지 확인
      await waitFor(() => {
        expect(result.current.events).toHaveLength(events.length);
        const eventStillExists = result.current.events.some((event) => event.id === events[0].id);
        expect(eventStillExists).toBe(true);
      });
    })
  );
});
