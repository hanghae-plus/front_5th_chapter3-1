import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export const setupMockHandlers = (initialEvents: Event[] = []) => {
  // 클로저를 통한 독립적인 상태 관리
  let events = [...initialEvents];

  // 서버에 핸들러 설정
  server.use(
    // GET - 이벤트 목록 조회
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // POST - 이벤트 생성
    http.post('/api/events', async ({ request }) => {
      const eventData = (await request.json()) as Omit<Event, 'id'>;
      const newEvent = {
        ...eventData,
        id: String(events.length + 1),
      } as Event;

      events.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),

    // PUT - 이벤트 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updateData = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events[index] = { ...events[index], ...updateData };
      return HttpResponse.json(events[index]);
    }),

    // DELETE - 이벤트 삭제
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = events.findIndex((event) => event.id === id);

      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      events.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    })
  );

  // 테스트에서 사용할 유틸리티 함수 반환
  return {
    getEvents: () => events,
    reset: () => {
      events = [...initialEvents];
    },
  };
};

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  return setupMockHandlers(initEvents);
};

export const setupMockHandlerUpdating = () => {
  return setupMockHandlers([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의2',
      date: '2025-10-15',
      startTime: '11:00',
      endTime: '12:00',
      description: '기존 팀 미팅 2',
      location: '회의실 C',
      category: '업무 회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ]);
};

export const setupMockHandlerDeletion = () => {
  return setupMockHandlers([
    {
      id: '1',
      title: '삭제할 이벤트',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '삭제할 이벤트입니다',
      location: '어딘가',
      category: '기타',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
};
