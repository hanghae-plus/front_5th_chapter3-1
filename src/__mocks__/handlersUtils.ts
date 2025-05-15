import { Event } from '../types';
import { server } from '../setupTests';
import { http, HttpResponse } from 'msw';

// 테코에서 동작하는애를 만듬 데이터 조작
// 가짜 데이터 조작
// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  // 현재 저장된 이벤트들을 추적하기 위한 클로저 변수
  let events: Event[] = [...initEvents];

  server.use(
    // GET 요청 처리 - 이벤트 목록 조회
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // POST 요청 처리 - 새 이벤트 생성
    http.post('/api/events', async ({ request }) => {
      const newEvent = await request.json();
      // 새 이벤트에 ID 추가 (실제 서버에서 하는 작업 모사)
      const eventWithId = {
        ...(newEvent as Event),
        id: crypto.randomUUID(),
      };

      // 이벤트 배열에 추가
      events = [...events, eventWithId];
      console.log('handlersUtils - events', events);
      console.log('eventWithId', eventWithId);

      return HttpResponse.json(eventWithId, { status: 201 });
    })
  );

  // 핸들러 초기화를 위한 cleanup 함수 반환
  return () => {
    events = [];
  };
};

export const setupMockHandlerUpdating = (initEvents = [] as Event[]) => {
  // 현재 저장된 이벤트들을 추적하기 위한 클로저 변수
  let events = [...initEvents];
  console.log('events', events);

  server.use(
    // GET 요청 처리 - 이벤트 목록 조회
    http.get('/api/events', () => {
      console.log('handlersUtils - GET 요청 실행');
      return HttpResponse.json({ events });
    }),

    // PUT 요청 처리 - 이벤트 수정
    http.put('/api/events/:id', async ({ params, request }) => {
      console.log('handlersUtils - PUT 요청 실행');
      const { id } = params;
      const updatedEvent = await request.json();

      // 이벤트 배열에서 해당 ID를 가진 이벤트 찾아 수정
      const eventIndex = events.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        console.log('이벤트 업데이트 실패');
        return new HttpResponse(null, { status: 404 });
      }
      // 이벤트 업데이트
      events = [
        ...events.slice(0, eventIndex),
        { ...(updatedEvent as Event), id: id as string }, // ID는 유지하고 string 타입으로 명시
        ...events.slice(eventIndex + 1),
      ];

      console.log('업데트트 된 events', events);

      return HttpResponse.json(events[eventIndex], { status: 200 });
    })
  );

  // 핸들러 초기화를 위한 cleanup 함수 반환
  return () => {
    events = [];
  };
};

export const setupMockHandlerDeletion = (initEvents = [] as Event[]) => {
  // 현재 저장된 이벤트들을 추적하기 위한 클로저 변수
  let events = [...initEvents];
  console.log('events', events);

  server.use(
    // GET 요청 처리 - 이벤트 목록 조회
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    }),

    // DELETE 요청 처리 - 이벤트 삭제
    http.delete('/api/events/:id', ({ params }) => {
      console.log('handlersUtils - delete 요청 실행');
      const { id } = params;

      // 삭제할 이벤트가 존재하는지 확인
      const eventIndex = events.findIndex((event) => event.id === id);

      if (eventIndex === -1) {
        // 이벤트가 존재하지 않으면 404 반환
        return new HttpResponse(null, { status: 404 });
      }

      // 이벤트 삭제
      events = events.filter((event) => event.id !== id);
      console.log('삭제된 events', events);
      // 성공적인 삭제를 나타내는 204 상태 코드 반환
      return new HttpResponse(null, { status: 204 });
    })
  );

  // 핸들러 초기화를 위한 cleanup 함수 반환
  return () => {
    events = [];
  };
};
