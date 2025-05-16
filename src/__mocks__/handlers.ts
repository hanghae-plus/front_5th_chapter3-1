import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  /**이벤트 목록 조회 */
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),
  /*새 이벤트 생성 (POST) */
  http.post('/api/events', async ({ request }) => {
    const { event } = (await request.json()) as { event: Event };
    events.push(event);
    return HttpResponse.json({ event });
  }),

  /**이벤트 수정 (PUT) */
  http.put('/api/events/:id', async ({ request, params }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((event) => event.id === id);
    if (index !== -1) {
      events[index] = updatedEvent;
    }
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
  /**이벤트 삭제 (DELETE) */
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((event) => event.id === id);
    if (index !== -1) {
      events.splice(index, 1);
    }
    return HttpResponse.json({ success: true }, { status: 200 });
  }),
];
