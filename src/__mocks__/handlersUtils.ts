import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      mockEvents.push(newEvent);
      return HttpResponse.json({ newEvent });
    })
  );
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents]; // 테스트용 이벤트 복사

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    }),
    http.put('/api/events/:id', async ({ request, params }) => {
      const updatedEvent = (await request.json()) as Event;
      const index = mockEvents.findIndex((e) => e.id === params.id);

      if (index !== -1) {
        mockEvents[index] = updatedEvent;
        return HttpResponse.json({ updatedEvent }, { status: 200 });
      }

      return HttpResponse.json({ message: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    })
  );
};
export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const mockEvents: Event[] = [...initEvents];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents });
    })
  );

  server.use(
    http.delete('/api/events/:id', async ({ params }) => {
      const index = mockEvents.findIndex((e) => e.id === params.id);
      if (index !== -1) {
        mockEvents.splice(index, 1);
        return HttpResponse.json(
          { message: '이벤트가 성공적으로 삭제되었습니다.' },
          { status: 200 }
        );
      }

      return HttpResponse.json({ message: '이벤트를 찾을 수 없습니다.' }, { status: 404 });
    })
  );
};
