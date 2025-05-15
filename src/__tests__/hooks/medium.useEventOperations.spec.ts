import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils';
import { events } from '../../__mocks__/response/events.json';
import { Event } from '../../entities/event/model/types';
import { EventForm, RepeatType } from '../../entities/event/model/types';
import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';

const MOCK_EVENTS = events as Event[];

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  // 초기화 후 events 상태 확인
  await act(async () => {
    await result.current.fetchEvents();
  });

  expect(result.current.events).toHaveLength(1);
  expect(result.current.events[0]).toHaveProperty('title');
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  const newEvent: EventForm = {
    title: '새 미팅',
    date: '2024-03-22',
    startTime: '14:00',
    endTime: '15:00',
    description: '신규 프로젝트 미팅',
    location: '회의실 B',
    category: '프로젝트',
    repeat: { type: 'none' as RepeatType, interval: 0 },
    notificationTime: 15,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toContainEqual(
    expect.objectContaining({
      ...newEvent,
      id: expect.any(String),
    })
  );
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const modifiedEvent = {
    ...MOCK_EVENTS[0],
    title: '테스트 회의2',
    endTime: '23:00',
  };

  const { result } = renderHook(() => useEventOperations(true));

  // 이벤트 수정 및 완료 대기
  await waitFor(async () => await result.current.saveEvent(modifiedEvent));

  // 수정된 이벤트 검증
  expect(result.current.events[0]).toEqual(modifiedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
