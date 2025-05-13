import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
let eventStore = [] as Event[];
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const events: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      events.push({ ...newEvent, id: String(events.length + 1) });
      return HttpResponse.json(newEvent, { status: 201 });
    })
  );
};
const common: Event = {
  id: '1',
  title: '이벤트 1',
  date: '2025-10-01',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 0,
} as const;

export const setupMockHandlerUpdating = () => {
  const events: Event[] = [
    { ...common, id: '1', title: '이벤트 1', startTime: '10:00', endTime: '11:00' },
    { ...common, id: '2', title: '이벤트 2', startTime: '11:00', endTime: '12:00' },
    { ...common, id: '3', title: '이벤트 3', startTime: '13:00', endTime: '14:00' },
  ];
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      }

      return new HttpResponse(null, { status: 404 });
    })
  );
};

export const setupMockHandlerDeletion = () => {
  const events: Event[] = [{ ...common }];
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return new HttpResponse(null, { status: 404 });
    })
  );
};
