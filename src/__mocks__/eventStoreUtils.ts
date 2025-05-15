import { http, HttpResponse } from 'msw';

import { Event } from '../types';
// * 공통 이벤트 스토어
export const createEventStore = (initEvents: Event[] = []) => {
  const events = [...initEvents];

  return {
    // * 이벤트 조회 함수
    getEvents: () => events,
    // * 이벤트 추가 함수
    addEvent: (event: Event) => {
      events.push(event);
      return event;
    },

    // * 이벤트 조회 핸들러
    getHandler: http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // * ID 파라미터 처리 유틸리티 함수
    getEventId: (id: string | readonly string[]) => {
      return typeof id === 'string' ? id : id[0];
    },
    // * 이벤트 찾기 유틸리티 함수
    findEventIndex: (eventId: string) => {
      return events.findIndex((event) => event.id === eventId);
    },
    // * 이벤트 필터링 유틸리티 함수
    filterEvents: (eventId: string) => {
      const filteredEvents = events.filter((event) => event.id !== eventId);
      events.length = 0;
      events.push(...filteredEvents);
    },
  };
};
