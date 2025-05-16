import { http, HttpResponse } from 'msw';

import { Event, RepeatType } from '../types';
import eventsJson from './response/events.json' assert { type: 'json' };

// 초기 JSON 데이터 → 타입 강제 변환 (repeat.type as RepeatType)
let events: Event[] = eventsJson.events.map((e) => ({
  ...e,
  repeat: {
    type: e.repeat.type as RepeatType,
    interval: e.repeat.interval,
  },
}));

export const handlers = [
  // 전체 이벤트 목록 조회
  http.get('/api/events', () => {
    return HttpResponse.json(events);
  }),

  // 새로운 이벤트 생성
  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = `${events.length + 1}`;
    events.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  // 특정 이벤트 수정
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    events[index] = updatedEvent;
    return HttpResponse.json(updatedEvent);
  }),

  // 특정 이벤트 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    events.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
