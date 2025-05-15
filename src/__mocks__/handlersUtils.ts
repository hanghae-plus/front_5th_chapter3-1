import { http, HttpResponse } from 'msw';

import { Event } from '../types';
import { createEventStore } from './eventStoreUtils';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
// * 각 테스트에서 독립적인 이벤트 저장소를 사용하기 위한 클로저 패턴 적용
// * 클로저를 사용하여 각 테스트 케이스마다 독립적인 이벤트 배열을 생성

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const store = createEventStore(initEvents);

  //* 이벤트 생성 핸들러
  const handler = http.post('/api/events', async ({ request }) => {
    const eventData = (await request.json()) as Omit<Event, 'id'>;
    const newEvent = {
      id: String(store.getEvents().length + 1),
      ...eventData,
    };

    store.addEvent(newEvent);

    return HttpResponse.json({ event: newEvent });
  });

  return {
    handler,
    getHandler: store.getHandler,
  };
};

export const setupMockHandlerUpdating = (initEvents: Event[] = []) => {
  const store = createEventStore(initEvents);

  //* 이벤트 수정 핸들러
  const handler = http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    if (!id) return new HttpResponse(null, { status: 404 });

    const eventId = store.getEventId(id);
    const updatedEvent = (await request.json()) as Partial<Event>;
    const index = store.findEventIndex(eventId);

    if (index === -1) return new HttpResponse(null, { status: 404 });

    //* 이벤트 업데이트
    const events = store.getEvents();
    events[index] = { ...events[index], ...updatedEvent, id: eventId };

    return HttpResponse.json({ event: events[index] });
  });

  return {
    handler,
    getHandler: store.getHandler,
  };
};

export const setupMockHandlerDeletion = (initEvents: Event[] = []) => {
  const store = createEventStore(initEvents);

  //* 이벤트 삭제 핸들러
  const handler = http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    if (!id) return new HttpResponse(null, { status: 404 });

    const eventId = store.getEventId(id);
    const index = store.findEventIndex(eventId);

    if (index === -1) return new HttpResponse(null, { status: 404 });

    //* 이벤트 삭제
    store.filterEvents(eventId);

    return new HttpResponse(null, { status: 204 });
  });

  return {
    handler,
    getHandler: store.getHandler,
  };
};
