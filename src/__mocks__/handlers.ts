import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  /**
   * 이벤트 목록 조회
   */
  http.get('/api/events', () => {
    return HttpResponse.json({ events });
  }),

  /**
   * 새로운 이벤트 생성
   * 요청 바디에 이벤트 정보가 담긴 JSON 데이터가 들어오면
   * 이를 배열에 추가하고 생성된 이벤트 정보를 응답
   */
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    events.push(newEvent);
    return HttpResponse.json({ newEvent });
  }),

  /**
   * 이벤트 수정
   * 요청 바디에 이벤트 정보가 담긴 JSON 데이터가 들어오면
   * 이를 배열에 추가하고 생성된 이벤트 정보를 응답
   */
  http.put('/api/events/:id', async ({ request, params }) => {
    const updatedEvent = (await request.json()) as Event;
    const eventIndex = events.findIndex((event) => event.id === params.id);
    if (eventIndex !== -1) {
      events[eventIndex] = updatedEvent;
    }
    return HttpResponse.json({ updatedEvent });
  }),

  /**
   * 이벤트 삭제
   * 이벤트 아이디를 파라미터로 받아 이벤트 아이디에 해당하는
   * 이벤트를 배열에서 삭제하고 삭제된 이벤트 정보를 응답
   */
  http.delete('/api/events/:id', ({ params }) => {
    const eventIndex = events.findIndex((event) => event.id === params.id);
    if (eventIndex !== -1) {
      events.splice(eventIndex, 1);
      return HttpResponse.json(null, { status: 204 });
    }
    return HttpResponse.json({ message: '이벤트 삭제 실패' }, { status: 404 });
  }),
];
