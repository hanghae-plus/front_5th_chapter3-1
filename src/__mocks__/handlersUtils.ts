import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import type { Event } from '../types';

// 어떻게 해야할지 모르겠어서 여기는 배꼈습니다 .. medium에 잘나와있네요 .. ㅎ
export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const mockEvents = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      console.group('🚀 GET /api/events ( setupMockHandlerCreation )');
      console.log('🚀 events >> ', mockEvents);
      console.groupEnd();

      return HttpResponse.json({ events: mockEvents });
    }),
    http.post<{}, Event>('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);

      console.group('🚀 POST /api/events ( setupMockHandlerCreation )');
      console.log('🚀 newEvent >> ', newEvent);
      console.groupEnd();

      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {};

export const setupMockHandlerDeletion = () => {};
