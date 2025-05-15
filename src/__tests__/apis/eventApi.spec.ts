import { http, HttpResponse } from 'msw';

import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../apis/eventApi'; // 테스트할 API 함수들의 경로 (프로젝트에 맞게 수정)
import { server } from '../../setupTests';
import { Event, EventForm } from '../../types';

const API_BASE_URL = '/api';

describe('eventApi', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2025-05-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '점심 약속',
      date: '2025-05-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '팀 점심',
      location: '식당 B',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 5,
    },
  ];

  const newEventData: EventForm = {
    title: '새 이벤트',
    date: '2025-05-22',
    startTime: '14:00',
    endTime: '15:00',
    description: '새 이벤트 설명',
    location: '온라인',
    category: '기타',
    repeat: { type: 'daily', interval: 1 },
    notificationTime: 15,
  };

  // 각 테스트 실행 후 MSW 핸들러 리셋
  afterEach(() => server.resetHandlers());

  describe('fetchEvents', () => {
    it('성공적으로 이벤트 목록을 가져와야 한다', async () => {
      server.use(
        http.get(`${API_BASE_URL}/events`, () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      const events = await fetchEvents();
      expect(events).toEqual(mockEvents);
      expect(events.length).toBe(2);
    });

    it('API가 빈 이벤트 목록을 반환할 경우 빈 배열을 반환해야 한다', async () => {
      server.use(
        http.get(`${API_BASE_URL}/events`, () => {
          return HttpResponse.json({ events: [] });
        })
      );

      const events = await fetchEvents();
      expect(events).toEqual([]);
    });

    it('네트워크 에러 발생 시 "Failed to fetch events" 에러를 던져야 한다', async () => {
      server.use(
        http.get(`${API_BASE_URL}/events`, () => {
          return new HttpResponse(null, { status: 500, statusText: 'Server Error' });
        })
      );

      await expect(fetchEvents()).rejects.toThrow('Failed to fetch events');
    });
  });

  describe('createEvent', () => {
    it('성공적으로 이벤트를 생성하고 생성된 이벤트를 반환해야 한다', async () => {
      const createdEvent: Event = { ...newEventData, id: 'new-id-123' };
      server.use(
        http.post(`${API_BASE_URL}/events`, async ({ request }) => {
          const body = (await request.json()) as EventForm;
          expect(body).toEqual(newEventData); // 요청 본문 검증
          return HttpResponse.json(createdEvent, { status: 201 });
        })
      );

      const result = await createEvent(newEventData);
      expect(result).toEqual(createdEvent);
    });

    it('이벤트 생성 실패 시 "Failed to create event" 에러를 던져야 한다', async () => {
      server.use(
        http.post(`${API_BASE_URL}/events`, () => {
          return new HttpResponse(null, { status: 500, statusText: 'Creation Failed' });
        })
      );

      await expect(createEvent(newEventData)).rejects.toThrow('Failed to create event');
    });
  });

  describe('updateEvent', () => {
    const eventToUpdateId = '1';
    const updateData: Partial<EventForm> = {
      title: '수정된 회의 제목',
      description: '설명이 수정되었습니다.',
    };
    const updatedEventResponse: Event = {
      ...mockEvents.find((e) => e.id === eventToUpdateId)!,
      ...updateData,
    };

    it('성공적으로 이벤트를 수정하고 수정된 이벤트를 반환해야 한다', async () => {
      server.use(
        http.put(`${API_BASE_URL}/events/${eventToUpdateId}`, async ({ request }) => {
          const body = (await request.json()) as Event | EventForm;
          // 요청 본문 검증 (일부 필드만 확인하거나 전체 객체 비교)
          expect(body.title).toBe(updateData.title);
          expect(body.description).toBe(updateData.description);
          return HttpResponse.json(updatedEventResponse);
        })
      );

      const result = await updateEvent(eventToUpdateId, {
        // 원본 이벤트 데이터와 업데이트 데이터를 합쳐서 전달
        ...mockEvents.find((e) => e.id === eventToUpdateId)!,
        ...updateData,
      });
      expect(result).toEqual(updatedEventResponse);
    });

    it('존재하지 않는 이벤트 ID로 수정 시도 시 "Failed to update event" 에러를 던져야 한다', async () => {
      const nonExistentId = 'non-existent-id';
      server.use(
        http.put(`${API_BASE_URL}/events/${nonExistentId}`, () => {
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        })
      );

      await expect(updateEvent(nonExistentId, newEventData)).rejects.toThrow(
        'Failed to update event'
      );
    });

    it('수정 중 서버 에러 발생 시 "Failed to update event" 에러를 던져야 한다', async () => {
      server.use(
        http.put(`${API_BASE_URL}/events/${eventToUpdateId}`, () => {
          return new HttpResponse(null, { status: 500, statusText: 'Update Failed' });
        })
      );

      await expect(updateEvent(eventToUpdateId, updateData as EventForm)).rejects.toThrow(
        'Failed to update event'
      );
    });
  });

  describe('deleteEvent', () => {
    const eventToDeleteId = '2';

    it('성공적으로 이벤트를 삭제해야 한다 (void 반환)', async () => {
      let isDeleted = false;
      server.use(
        http.delete(`${API_BASE_URL}/events/${eventToDeleteId}`, () => {
          isDeleted = true;
          return new HttpResponse(null, { status: 204 }); // 성공적으로 삭제되었음을 나타내는 상태 코드
        })
      );

      await deleteEvent(eventToDeleteId);
      expect(isDeleted).toBe(true); // 핸들러가 호출되었는지 간접적으로 확인
    });

    it('존재하지 않는 이벤트 ID로 삭제 시도 시 "Failed to delete event" 에러를 던져야 한다', async () => {
      const nonExistentId = 'non-existent-id';
      server.use(
        http.delete(`${API_BASE_URL}/events/${nonExistentId}`, () => {
          return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        })
      );

      await expect(deleteEvent(nonExistentId)).rejects.toThrow('Failed to delete event');
    });

    it('삭제 중 서버 에러 발생 시 "Failed to delete event" 에러를 던져야 한다', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/events/${eventToDeleteId}`, () => {
          return new HttpResponse(null, { status: 500, statusText: 'Deletion Failed' });
        })
      );

      await expect(deleteEvent(eventToDeleteId)).rejects.toThrow('Failed to delete event');
    });
  });
});
