import { HttpResponse, http } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const mockEvents: Event[] = [...initEvents];
  const createHandlers = [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = String(mockEvents.length + 1);
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];

  server.use(...createHandlers);
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  const mockEvents = [...initEvents];
  const createHandlers = [
    http.get('/api/events', async () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };

      return HttpResponse.json(mockEvents[index]);
    }),
  ];

  server.use(...createHandlers);
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  const mockEvents = [...initEvents];
  const createHandlers = [
    http.get('/api/events', async () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.delete('/api/events/:id', async ({ params }) => {
      const { id } = params;
      const index = mockEvents.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockEvents.splice(index, 1);

      return new HttpResponse(null, { status: 204 });
    }),
  ];

  server.use(...createHandlers);
};
