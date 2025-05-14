import { describe, expect, it } from 'vitest';
import { Event } from '../types';

describe('MSW 핸들러 검증', () => {
  it('GET /api/events 요청에 대한 응답이 정확한지 확인합니다.', async () => {
    const response = await fetch('/api/events');
    const data = await response.json();

    // __mocks__/response/events.json 파일의 내용을 가져와 비교
    const eventsModule = await import('../__mocks__/response/events.json');
    expect(data).toEqual({ events: eventsModule.events });
  });

  it('POST /api/events 요청으로 새로운 이벤트가 추가된다.', async () => {
    const newEventData: Partial<Event> = {
      title: '생성할 테스트 이벤트',
      startTime: '2025-05-14T10:00:00Z',
      endTime: '2025-05-14T12:00:00Z',
      description: '테스트 설명',
      location: '테스트 장소',
    };

    // 이벤트 생성 요청하기
    const postResponse = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEventData),
    });
    expect(postResponse.status).toBe(201);
    const createdEvent = await postResponse.json();

    // 생성된 이벤트에 id 속성이 포함되어야 함
    expect(createdEvent).toHaveProperty('id');
    expect(createdEvent.title).toBe(newEventData.title);

    // GET 요청 시 새 이벤트의 포함 여부 확인
    const getResponse = await fetch('/api/events');
    const getData = await getResponse.json();
    expect(getData.events).toContainEqual(createdEvent);
  });

  it('PUT /api/events/:id 요청으로 이벤트가 업데이트된다.', async () => {
    // 기존 이벤트 조회
    const getResponse = await fetch('/api/events');
    const getData = await getResponse.json();
    const existingEvent = getData.events[0];

    // 수정할 이벤트 데이터
    const updateData: Partial<Event> = {
      title: '수정된 이벤트 제목',
      endTime: '2025-05-14T13:00:00Z',
    };

    // 기존 이벤트 업데이트
    const putResponse = await fetch(`/api/events/${existingEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    expect(putResponse.status).toBe(200);

    // 업데이트 응답 결과 확인
    const updatedEvent = await putResponse.json();
    expect(updatedEvent.title).toBe(updateData.title);
    expect(updatedEvent.endTime).toBe(updateData.endTime);

    // GET 요청을 통해 변경된 내용 반영 여부 확인
    const getResponseAfterPut = await fetch('/api/events');
    const getDataAfterPut = await getResponseAfterPut.json();
    expect(getDataAfterPut.events).toContainEqual(updatedEvent);
  });

  it('DELETE /api/events/:id 요청으로 이벤트가 삭제된다.', async () => {
    // 삭제할 이벤트 생성
    const newEventData: Partial<Event> = {
      title: '삭제할 테스트 이벤트',
      startTime: '2025-05-14T10:00:00Z',
      endTime: '2025-05-14T12:00:00Z',
      description: '테스트 설명',
      location: '테스트 장소',
    };

    const postResponse = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEventData),
    });
    const createdEvent = await postResponse.json();
    expect(createdEvent).toHaveProperty('id');

    // 생성된 이벤트 삭제
    const deleteResponse = await fetch(`/api/events/${createdEvent.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);

    // GET 요청 시 삭제된 이벤트는 더 이상 포함되지 않아야 함
    const getResponseAfterDelete = await fetch('/api/events');
    const getDataAfterDelete = await getResponseAfterDelete.json();
    expect(getDataAfterDelete.events).not.toContainEqual(createdEvent);
  });
});
