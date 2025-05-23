# HARD

## 7주차 과제 체크포인트

### 기본과제

- [x] 총 11개의 파일, 115개의 단위 테스트를 무사히 작성하고 통과시킨다.

#### 질문

> Q. handlersUtils에 남긴 질문에 답변해주세요.
> Q. 테스트를 독립적으로 구동시키기 위해 작성했던 설정들을 소개해주세요.

<details><summary>handlersUtils.ts  👈🏻 </summary>

```ts
import { http, HttpResponse } from 'msw';

import { events as mock } from '@/__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '@/types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

const mockEvents = mock as Event[];

export const setupMockHandlerCreation = (initEvents?: Event[]) => {
  const events = typeof initEvents !== 'undefined' ? [...initEvents] : [...mockEvents];

  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      events.push({ ...newEvent, id: String(events.length + 1) });
      return HttpResponse.json(newEvent, { status: 201 });
    }),
  ];
};

export const setupMockHandlerUpdating = (initEvents?: Event[]) => {
  const events = typeof initEvents !== 'undefined' ? [...initEvents] : [...mockEvents];

  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events[index] = { ...events[index], ...updatedEvent };
        return HttpResponse.json(events[index]);
      }

      return new HttpResponse(null, { status: 404 });
    }),
  ];
};

export const setupMockHandlerDeletion = (initEvents?: Event[]) => {
  const events = typeof initEvents !== 'undefined' ? [...initEvents] : [...mockEvents];

  return [
    http.get('/api/events', () => HttpResponse.json({ events })),
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const index = events.findIndex((event) => event.id === id);

      if (index !== -1) {
        events.splice(index, 1);
        return new HttpResponse(null, { status: 204 });
      }

      return new HttpResponse(null, { status: 404 });
    }),
  ];
};

export const setupMockHandlerNetworkFail = () => {
  return {
    get: http.get('/api/events', () => new HttpResponse(null, { status: 500 })),
    delete: http.delete('/api/events/:id', () => new HttpResponse(null, { status: 500 })),
  };
};

```
</details>

- 네 가지 상황으로 고정된 Stub API를 구현하였습니다. 
- 각각의 핸들러 내부에서 events를 참조하여 값을 반환하여 같은 테스트 세팅 내에서만 상태값을 사용하도록 분리하였습니다.
- initEvents를 인자로 주입받거나, 주입하지 않는 경우 json으로 구현된 mock events로 동작하도록 구현했습니다.
- 실패하여 Error를 반환해야 하는 경우도 핸들러를 분리하여 구현했습니다.

  ```ts
  // update 
  const handler = setupMockHandlerUpdating();
  server.use(...handler);

  // error
  const handler = setupMockHandlerNetworkFail();
  server.use(handler.get);

  // 인자 주입
  const event: Event = {
    id: '1',
    title: '이벤트 1',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 설명',
    location: '회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };
  const handler = setupMockHandlerUpdating([event]);
  server.use(...handler);
  renderApp();
  ```

### 심화 과제

- [x] App 컴포넌트 적절한 단위의 컴포넌트, 훅, 유틸 함수로 분리했는가?
- [x] 해당 모듈들에 대한 ~적절한~ 테스트를 5개 이상 작성했는가?

![디렉토리](https://github.com/user-attachments/assets/33898181-9b26-4719-85d1-27afbdbbb751)

- App 코드를 영역별로 분리하였습니다.
- 이에 따라 전역에서 사용할 Context API를 작성하였습니다.

<details><summary>contexts.ts  👈🏻 </summary>

```ts
import { createContext, useContext } from 'react';

import { useCalendarView } from './useCalendarView';
import { useDialog } from './useDialog';
import { useEventForm } from './useEventForm';
import { useEventOperations } from './useEventOperations';
import { useNotifications } from './useNotifications';
import { useSearch } from './useSearch';

export const CalendarViewContext = createContext<ReturnType<typeof useCalendarView> | null>(null);

export const useCalendarViewContext = () => {
  const ctx = useContext(CalendarViewContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const DialogContext = createContext<ReturnType<typeof useDialog> | null>(null);

export const useDialogContext = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const EventFormContext = createContext<ReturnType<typeof useEventForm> | null>(null);

export const useEventFormContext = () => {
  const ctx = useContext(EventFormContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const EventOperationsContext = createContext<ReturnType<typeof useEventOperations> | null>(
  null
);

export const useEventOperationsContext = () => {
  const ctx = useContext(EventOperationsContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const NotificationsContext = createContext<ReturnType<typeof useNotifications> | null>(null);

export const useNotificationsContext = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

export const SearchContext = createContext<ReturnType<typeof useSearch> | null>(null);

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('context not found');
  return ctx;
};

```
</details>

<details><summary>providers/index.tsx  👈🏻 </summary>

```tsx
import { ReactNode } from 'react';

import {
  CalendarViewContext,
  DialogContext,
  EventFormContext,
  EventOperationsContext,
  NotificationsContext,
  SearchContext,
} from '@/hooks/contexts';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useDialog } from '@/hooks/useDialog';
import { useEventForm } from '@/hooks/useEventForm';
import { useEventOperations } from '@/hooks/useEventOperations';
import { useNotifications } from '@/hooks/useNotifications';
import { useSearch } from '@/hooks/useSearch';

export const Providers = ({ children }: { children: ReactNode }) => {
  const calenderView = useCalendarView();
  const dialog = useDialog();
  const eventForm = useEventForm();
  const eventOperations = useEventOperations(Boolean(eventForm.editingEvent), () =>
    eventForm.setEditingEvent(null)
  );
  const notifications = useNotifications(eventOperations.events);
  const search = useSearch(eventOperations.events, calenderView.currentDate, calenderView.view);

  return (
    <CalendarViewContext.Provider value={calenderView}>
      <DialogContext.Provider value={dialog}>
        <EventFormContext.Provider value={eventForm}>
          <EventOperationsContext.Provider value={eventOperations}>
            <NotificationsContext.Provider value={notifications}>
              <SearchContext.Provider value={search}>
                <>{children}</>
              </SearchContext.Provider>
            </NotificationsContext.Provider>
          </EventOperationsContext.Provider>
        </EventFormContext.Provider>
      </DialogContext.Provider>
    </CalendarViewContext.Provider>
  );
};
```
</details>

## 과제 셀프회고

- 거의 처음 작성해보는 테스트 코드였는데, 나름 어지럽더라도 기간 내에 모든 조건을 충족하였습니다.
- hard로 호기롭게 도전하여 medium을 처리할 때 쯤엔 시간을 많이 소요하였습니다. 처음으로 금요일 새벽까지 과제를 해본것 같습니다.

### 기술적 성장

- 단위 기반 테스트와 행위 기반 테스트의 차이를 어렴풋이 알게되었습니다.
- Stub과 Mock에 대한 개념을 희미하게나마 머리에 새겼습니다.
- 2~3회 덧씌우면 체득할 수 있을 것 같습니다.

### 코드 품질

- 문장 그대로를 테스트로 녹여내려다보니 약간 어지럽고 통일성 없게 작성된 것 같습니다.
- 리팩토링도 1~2뎁스 수준으로만 나뉜것 같습니다. 하위 컴포넌트를 더 분리할 수 있었을것 같은데, 시간이 촉박했던 것 같습니다.
- 리팩토링 하면서 전역 상태 관리로 가장 쉬운 ContextAPI로 적용하게 되었습니다. 라이브러리를 사용하는 기업이 많을텐데 그런 경우의 테스트 코드에서 Provider를 커스텀 하여 감싸는 방법을 경험해보지 못한게 아쉽습니다.

### 학습 효과 분석

- 과제의 요구 조건 순서대로 잘 진행한 것 같습니다.
- 리팩토링 이후에 테스트 코드 일부가 실패중인게 잠시 스트레스가 있었으나, 전역 상태관리로 무사히 전환하고 그대로 다시 모두 통과되어 성취감이 있었습니다.

### 과제 피드백

- easy ~ medium 과정은 순차적으로 잘 따라간 것 같습니다.
- integration에서 환경을 조절하는 부분이 약간 막힘이 있었는데, 그래도 시간을 쏟아 부으니 진행은 되었습니다.
- 리팩토링 과정은 컴포넌트를 나누는것은 3주간 열심히 한 보람이 느껴졌었고, 상태관리를 전환할 때 쯤에 테스트 코드쪽에서 실패하는 것들도 같이 식별할 수 있어서 내가 하려는 동작이 앱을 원래 동작으로 만드는데 필요하다는 확신을 갖고 나머지 리팩토링을 진행하게 되었습니다.

## 리뷰 받고 싶은 내용
 
- 아쉬운점으로 리팩토링을 목요일 저녁이 다 지나서야 완료할 수 있어서 상태관리를 또 다시 Context API로 처리하게 되었습니다.
- 테스트 코드 renderApp 에서 전역에 `<Providers></Providers>` 로 감싸는 것만으로 다 처리가 완료되었는데, 라이브러리를 쓰는 경우에는 처리방식이 달라지지 않을까 하였습니다.
- 저희 회사에선 Next.js에 라우터 페이지 별 Context 하나만 사용하는 환경이다보니, 당장은 테스트 코드도 그 수준으로 작성이 될것 같습니다.
- 다만, 언젠가 이직도 하여 라이브러리로 전역 상태관리를 하는 곳에선 테스트 코드에 해당 부분이 포함이 되어야 하지 않을 까 걱정이 되었습니다. 라이브러리가 사용된 테스트 코드에서의 상태관리 처리가 ContextAPI로 처리했을 때와 차이가 어떤 지, 주의할 점이 있는 지 궁금합니다.

- 그리고, 심화 추가 테스트 코드를 작성하는데 있어서 모듈단위로 동작을 검증하는 게, 어려움이 있는 것 같습니다.
- 결국 시간이 부족하여 사용자가 해당 섹션에서 할만한 동작(빈칸으로 제출하기, 토글 시 컴포넌트 변경, 시간 순서 역전하여 입력하기), 일정 보기 부분은 앞뒤 페이지 버튼 눌렀을때 주간/월간 변경되는것 정도만 구현했습니다. 
- 나머지는 기존 과제 테스트랑 겹치는 것 같기도 했어서  너무 간단한 것들만 한게 아닌가 생각이 드는데, 어느 범위까지 사용자의 행동을 테스트 해야할 지 고민이 많이 되었습니다.
