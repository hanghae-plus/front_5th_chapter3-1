import { Event } from '../types';
import { events as mockEvents } from './response/events.json';
const events = mockEvents as Event[];

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
const eventStores = new Map<string, Event[]>();
let currentTestId = 'default';

const generateUniqueTestId = () => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const setCurrentTestId = (testId: string) => {
  currentTestId = testId;
  if (!eventStores.has(testId)) {
    eventStores.set(testId, []);
  }
};

const getCurrentEventStore = (): Event[] => {
  if (!eventStores.has(currentTestId)) {
    eventStores.set(currentTestId, []);
  }
  return eventStores.get(currentTestId) || [];
};

export const setCurrentEventStore = (events: Event[]) => {
  eventStores.set(currentTestId, events);
};

export const setupMockHandlerCreation = (initEvents: Event[] = []) => {
  const testId = generateUniqueTestId();
  setCurrentTestId(testId);
  // 초기 이벤트가 지정되지 않았으면 events.json의 데이터 사용
  setCurrentEventStore(initEvents.length > 0 ? [...initEvents] : [...events]);
  return testId;
};

export const setupMockHandlerUpdating = (update: Event[]) => {
  setCurrentEventStore([...update]);
};

export const setupMockHandlerAppend = (update: Event) => {
  const currentStore = getCurrentEventStore();
  setCurrentEventStore([...currentStore, update]);
};

export const setupMockHandlerDeletion = (id: string) => {
  const currentStore = getCurrentEventStore();
  setCurrentEventStore(currentStore.filter((event) => event.id !== id));
};

export const setupMockHandlerFetch = () => getCurrentEventStore();

export const cleanupMockHandler = (testId: string) => {
  if (eventStores.has(testId)) {
    eventStores.delete(testId);
  }

  if (currentTestId === testId) {
    currentTestId = 'default';
  }
};

export const cleanupAllMockHandlers = () => {
  eventStores.clear();
  currentTestId = 'default';
};
