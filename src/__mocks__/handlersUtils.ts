import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

export function createMockHandlersUtils(initEvents: Event[] = []) {
  // eventStore를 클로저로 감싸서 각 테스트마다 인스턴스를 분리
  // 각 테스트마다 새로운 eventStore를 생성해서 MSW 핸들러에 주입
  let eventStore = [...initEvents];

  return {
    setupMockHandlerFetch: () => eventStore,
    setupMockHandlerCreation: (initEvents = [] as Event[]) => {
      eventStore = [...initEvents];
    },
    setupMockHandlerAppend: (newEvent: Event) => {
      eventStore.push(newEvent);
    },
    setupMockHandlerUpdateById: (update: Event[]) => {
      eventStore = update;
    },
    setupMockHandlerDeletion: (id: string) => {
      eventStore = eventStore.filter((event) => event.id !== id);
    },
    getEventStore: () => eventStore, // 필요시 현재 상태 확인용
  };
}
