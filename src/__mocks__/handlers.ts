import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { events } from './response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {}),

  http.post('/api/events', async ({ request }) => {}),

  http.put('/api/events/:id', async () => {}),

  http.delete('/api/events/:id', ({ params }) => {}),
];
