import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { setupMockHandlers } from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
const mockEvnets = beforeEach(() => {
  setupMockHandlers();
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  //events의 초기값을 확인한다.
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  //saveEvent검증, eventData로 이벤트를 넘기면  post가 동작하는지 확인
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  //saveEvent검증, eventData로 이벤트 넘기면 put 동작하는지 확인 ('title', 'endTime'은 Event타입)
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  //deleteEvent
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  //fetchEvents에서 fetch를 하는경우 server.use로 에러를 반호나하여 로딩실패를 유도
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  //save에서 존재하지 않는 이벤트 수정하고 에러 유도, 에러 토스트 유도
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  //deleteEvent에서 네트워크유도로 에러 토스트 유도
});
