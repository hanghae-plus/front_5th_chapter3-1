import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
const eventStores = new Map<string, Event[]>();

// 현재 실행 중인 테스트 ID를 추적합니다 (테스트 간 격리를 위해)
let currentTestId = 'default';

// 테스트 ID 설정 함수
export const setCurrentTestId = (testId: string) => {
  currentTestId = testId;
  if (!eventStores.has(testId)) {
    eventStores.set(testId, []);
  }
};

// 현재 테스트의 이벤트 저장소 가져오기
const getCurrentEventStore = (): Event[] => {
  if (!eventStores.has(currentTestId)) {
    eventStores.set(currentTestId, []);
  }
  return eventStores.get(currentTestId) || [];
};

// 현재 테스트의 이벤트 저장소 설정
const setCurrentEventStore = (events: Event[]) => {
  eventStores.set(currentTestId, events);
};

// 초기 이벤트 설정 (테스트 시작 시 호출)
export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  setCurrentTestId(testId);
  setCurrentEventStore([...initEvents]);
  return testId;
};

// 이벤트 업데이트
export const setupMockHandlerUpdating = (update: Event[]) => {
  setCurrentEventStore([...update]);
};

// 이벤트 추가
export const setupMockHandlerAppend = (update: Event) => {
  const currentStore = getCurrentEventStore();
  setCurrentEventStore([...currentStore, update]);
};

// 이벤트 삭제
export const setupMockHandlerDeletion = (id: string) => {
  const currentStore = getCurrentEventStore();
  setCurrentEventStore(currentStore.filter((event) => event.id !== id));
};

// 이벤트 조회
export const setupMockHandlerFetch = () => getCurrentEventStore();

// 테스트 정리 (afterEach에서 호출)
export const cleanupMockHandler = (testId: string) => {
  if (eventStores.has(testId)) {
    eventStores.delete(testId);
  }
};
