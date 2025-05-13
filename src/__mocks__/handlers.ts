import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  // ✅ GET 이벤트 목록 조회
  http.get('/api/events', () => {
    console.log('✅ GET /api/events 호출됨');
    return HttpResponse.json({ events });
  }),

  // ✅ POST 새로운 이벤트 추가
  http.post('/api/events', async ({ request }) => {
    const newEvent = await request.json();
    console.log(newEvent);
  }),

  // ✅ PUT 이벤트 수정
  http.put('/api/events/:id', async () => {}),

  // ✅ DELETE 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {}),
];
