import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';

import type { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  // 초기 이벤트 설정
  const mockEvents: { events: Event[] } = { events: initEvents };

  // GET 핸들러 설정
  server.use(
    http.get('/api/events', () => HttpResponse.json(mockEvents)),

    http.post('/api/events', async ({ request }) => {
      const eventData = (await request.json()) as Event;
      const newEvent = { ...eventData, id: '1' };

      mockEvents.events = [...mockEvents.events, newEvent];
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};

export const setupMockHandlerUpdating = () => {
  const mockEvents: { events: Event[] } = {
    events: [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  };

  // PUT 핸들러 설정
  server.use(
    http.get('/api/events', () => HttpResponse.json(mockEvents)),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const eventData = (await request.json()) as Event;

      const targetEvent = mockEvents.events.find((event) => event.id === id);
      if (!targetEvent) {
        return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
      }

      mockEvents.events = mockEvents.events.map((event) =>
        event.id === id ? { ...event, ...eventData } : event
      );

      return HttpResponse.json(mockEvents.events.find((event) => event.id === id));
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const mockEvents: { events: Event[] } = {
    events: [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ],
  };

  // DELETE 핸들러 설정
  server.use(
    http.get('/api/events', () => HttpResponse.json(mockEvents)),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      mockEvents.events = mockEvents.events.filter((event) => event.id !== id);

      return new HttpResponse(null, { status: 204 });
    })
  );
};
