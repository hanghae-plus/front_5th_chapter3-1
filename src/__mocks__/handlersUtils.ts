import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
let events: Event[] = [];

export const setupMockHandlerCreation = (initEvents = [] as Event[]) => {
  events = initEvents;
};

// 일정 추가
export const setupMockHandlerAdding = (newEvents = [] as Event[]) => {
  events = [...events, ...newEvents];
};

// 일정 수정
export const setupMockHandlerUpdating = (id: string, updatedEvent: Event) => {
  events = events.map((event) => (event.id === id ? { ...event, ...updatedEvent } : event));
};

export const setupMockHandlerDeletion = (id: string) => {
  events = events.filter((event) => event.id !== id);
};

export const setupMockHandlerFetch = () => events;
