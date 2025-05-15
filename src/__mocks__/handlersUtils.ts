import { http, HttpResponse, RequestHandler } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

type ErrorType = 'GET_ERROR' | 'DELETE_ERROR';
type OperationType = 'GET' | 'CREATE' | 'UPDATE' | 'DELETE';
type HandlerType = OperationType | ErrorType;

export const setupMockHandlerCreation = (initEvents = [] as Event[]): RequestHandler[] =>
  setupMockHandlers(initEvents, ['GET', 'CREATE']);

export const setupMockHandlerUpdating = (initEvents = [] as Event[]): RequestHandler[] =>
  setupMockHandlers(initEvents, ['GET', 'UPDATE']);

export const setupMockHandlerDeletion = (initEvents = [] as Event[]): RequestHandler[] =>
  setupMockHandlers(initEvents, ['GET', 'DELETE']);

export const setupMockHandlerFetchError = (): RequestHandler[] =>
  setupMockHandlers([], ['GET_ERROR']);

export const setupMockHandlerDeletionError = (initEvents = [] as Event[]): RequestHandler[] =>
  setupMockHandlers(initEvents, ['GET', 'DELETE_ERROR']);

/**
 * 이벤트 핸들러 생성 팩토리 함수
 * @param initEvents 초기 이벤트 목록
 * @param operations 생성할 핸들러 타입
 * @returns MSW에 등록할 이벤트 핸들러 목록
 */
const setupMockHandlers = (
  initEvents: Event[] = [],
  operations: HandlerType[] = ['GET']
): RequestHandler[] => {
  const events = [...initEvents];

  const handlerMap: Record<HandlerType, RequestHandler[]> = {
    GET: [http.get('/api/events', () => HttpResponse.json({ events }))],

    CREATE: [
      http.post('/api/events', async ({ request }) => {
        const newEvent = (await request.json()) as Event;
        events.push(newEvent);
        return HttpResponse.json({ events });
      }),
    ],

    UPDATE: [
      http.put('/api/events/:id', async ({ request, params }) => {
        const updated = (await request.json()) as Event;
        const idx = events.findIndex((e) => e.id === params.id);

        if (idx < 0) return HttpResponse.json({ error: 'Not found' }, { status: 404 });

        events[idx] = updated;
        return HttpResponse.json(updated);
      }),
    ],

    DELETE: [
      http.delete('/api/events/:id', ({ params }) => {
        const idx = events.findIndex((e) => e.id === params.id);

        if (idx < 0) return HttpResponse.json({ error: 'Not found' }, { status: 404 });

        events.splice(idx, 1);
        return HttpResponse.json({ events });
      }),
    ],

    GET_ERROR: [
      http.get('/api/events', () =>
        HttpResponse.json({ error: '이벤트 로딩 실패' }, { status: 500 })
      ),
    ],

    DELETE_ERROR: [
      http.delete('/api/events/:id', () =>
        HttpResponse.json({ error: '이벤트 삭제 실패' }, { status: 500 })
      ),
    ],
  };

  return operations.flatMap((op) => handlerMap[op]);
};
