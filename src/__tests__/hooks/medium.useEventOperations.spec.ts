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
  mockToastInstance.mockClear();
});

const eventsForTest = allEventDataFromFile.events as Event[];

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation(eventsForTest);
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

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {});
