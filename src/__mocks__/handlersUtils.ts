import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

// 테스트 마다 초기 상태를 받아 독립적인 mockEvents를 사용하는 생성 핸들러
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  const mockEvents = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      newEvent.id = randomUUID();
      mockEvents.push(newEvent);
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];
};

// 기존 mockEvents에서 특정 id 이벤트를 수정하는 핸들러
export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  const mockEvents = [...initEvents];
  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params; //params로 동적 경로 (:id) 값 추출
      const eventIndex = mockEvents.findIndex((event) => event.id === id);
      const updatedEvent = (await request.json()) as Event;

      mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...updatedEvent };
      if (eventIndex > -1) {
        return HttpResponse.json(mockEvents[eventIndex]);
      } else {
        return new HttpResponse(null, { status: 404 });
      }
    }),
  ];
};

// 기존 mockEvents에서 특정 id 이벤트를 삭제하는 핸들러
export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  const mockEvents = [...initEvents];

  return [
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockEvents }, { status: 200 });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const eventIndex = mockEvents.findIndex((event) => event.id === id);
      mockEvents.splice(eventIndex, 1);
      return HttpResponse.json(null, { status: 204 });
    }),
  ];
};
