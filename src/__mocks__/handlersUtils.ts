import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initialEvents: Event[]) => {
  const events: Event[] = [...initialEvents];
  const randomId = (Math.floor(Math.random() * 90) + 10).toString();

  const handlers = [
    // 목록 조회
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // 새 이벤트 생성

    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      events.push({
        ...newEvent,
        id: randomId,
      });
      return HttpResponse.json(newEvent);
    }),
  ];

  return { handlers, getEvents: () => events };
};

/**
 * 업데이트 전용: GET + PUT 핸들러
 */
export const setupMockHandlerUpdating = (initialEvents: Event[]) => {
  const events: Event[] = [...initialEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updated = (await request.json()) as Event;
      const idx = events.findIndex((e) => e.id === id);
      if (idx > -1) {
        events[idx] = { ...events[idx], ...updated };
        return HttpResponse.json(events[idx]);
      }
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }),
  ];

  return { handlers, getEvents: () => events };
};

/**
 * 삭제 전용: GET + DELETE 핸들러
 */
export const setupMockHandlerDeletion = (initialEvents: Event[]) => {
  const events: Event[] = [...initialEvents];

  const handlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const idx = events.findIndex((e) => e.id === id);
      if (idx > -1) {
        events.splice(idx, 1);
        return HttpResponse.json(null, { status: 200 });
      }
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }),
  ];

  return { handlers, getEvents: () => events };
};
