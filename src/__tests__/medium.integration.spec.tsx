import { ChakraProvider } from "@chakra-ui/react";
import { render, screen, within, act } from "@testing-library/react";
import { UserEvent, userEvent } from "@testing-library/user-event";
import { ReactElement } from "react";
import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from "../__mocks__/handlersUtils";
import App from "../App";
import { Event } from "../types";

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, "id" | "notificationTime" | "repeat">
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText("일정 추가")[0]);
  await user.type(screen.getByLabelText("제목"), title);
  await user.type(screen.getByLabelText("날짜"), date);
  await user.type(screen.getByLabelText("시작 시간"), startTime);
  await user.type(screen.getByLabelText("종료 시간"), endTime);
  await user.type(screen.getByLabelText("설명"), description);
  await user.type(screen.getByLabelText("위치"), location);
  await user.selectOptions(screen.getByLabelText("카테고리"), category);

  await user.click(screen.getByTestId("event-submit-button"));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe("일정 CRUD 및 기본 기능", () => {
  // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
  it("입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-15", // setupTest는 10월 1일로 초기화시키기때문에 10월달 회의를 추가해봄.
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };

    await saveSchedule(user, newEvent); // userEvent를 사용해 일정을 추가하는 함수

    expect(screen.getByLabelText("제목"), "팀 회의");
    expect(screen.getByLabelText("날짜"), "2025-10-25");
    expect(screen.getByLabelText("시작 시간"), "09:00");
    expect(screen.getByLabelText("종료 시간"), "10:00");
    expect(screen.getByLabelText("설명"), "팀 미팅");
    expect(screen.getByLabelText("위치"), "회의실 A");
    expect(screen.getByLabelText("카테고리"), "업무");
  });

  it("기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다", async () => {
    setup(<App />);
    setupMockHandlerCreation([
      {
        id: "1",
        title: "기존 회의",
        date: "2025-10-15",
        startTime: "09:00",
        endTime: "10:00",
        description: "기존 팀 미팅",
        location: "회의실 B",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
    ]);
    expect(screen.getByLabelText("제목"), "기존 회의");
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "기존 회의",
        date: "2025-10-15",
        startTime: "09:00",
        endTime: "10:00",
        description: "기존 팀 미팅",
        location: "회의실 B",
        category: "업무",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
      {
        id: "2",
        title: "기존 회의2",
        date: "2025-10-15",
        startTime: "11:00",
        endTime: "12:00",
        description: "기존 팀 미팅 2",
        location: "회의실 C",
        category: "업무 회의",
        repeat: { type: "none", interval: 0 },
        notificationTime: 5,
      },
    ];
    setupMockHandlerUpdating(mockEvents);
    expect(screen.getByLabelText("제목"), "기존 회의2");
  });

  it("일정을 삭제하고 더 이상 조회되지 않는지 확인한다", async () => {
    setup(<App />);
    setupMockHandlerCreation([
      {
        id: "1",
        title: "삭제할 이벤트",
        date: "2025-10-15",
        startTime: "09:00",
        endTime: "10:00",
        description: "삭제할 이벤트입니다",
        location: "어딘가",
        category: "기타",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
    ]);
    expect(screen.getByLabelText("제목"), "삭제할 이벤트");
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "삭제할 이벤트",
        date: "2025-10-15",
        startTime: "09:00",
        endTime: "10:00",
        description: "삭제할 이벤트입니다",
        location: "어딘가",
        category: "기타",
        repeat: { type: "none", interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerDeletion(mockEvents);
    expect(screen.getByLabelText("제목"), "");
  });
});

describe("일정 뷰", () => {
  it("주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-15", // setupTest는 10월 1일로 초기화시키기때문에 10월달 회의를 추가해봄.
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent);

    await user.selectOptions(screen.getByLabelText("view"), "week");
    const eventList = screen.getByTestId("event-list");
    
    // setupTest에서 초기시간을 10월 1일로 해놨기때문에 15일자 이벤트는 조회되지 않는 모습이다.
    expect(within(eventList).getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-02", // setupTest는 10월 1일로 초기화시키기때문에 10월달 회의를 추가해봄.
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent);

    await user.selectOptions(screen.getByLabelText("view"), "week");
    const eventList = screen.getByTestId("event-list");
    
    // setupTest에서 초기시간을 10월 1일로 해놨기때문에 15일자 이벤트는 조회되지 않는 모습이다.
    expect(within(eventList).getByText("팀 회의")).toBeInTheDocument();
  });

  it("월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.", async () => {
    setup(<App />);
    setupMockHandlerCreation([]);

    const eventList = screen.getByTestId("event-list");
    
    // view select의 초기값은 month이기때문에 바로 조회하는 모습.
    expect(within(eventList).getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("월별 뷰에 일정이 정확히 표시되는지 확인한다", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-10",
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId("event-list");
    
    expect(within(eventList).getByText("팀 회의")).toBeInTheDocument();
  });

  it("달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다", async () => {
    // 테스트의 날짜를 01월 01일로 지정하여 1월의 달력을 확인.
    vi.setSystemTime(new Date('2025-01-01'));

    setup(<App />);
    setupMockHandlerCreation([]);
    const monthView = screen.getByTestId("month-view");
    
    expect(within(monthView).getByText("신정")).toBeInTheDocument();
  });
});

describe("검색 기능", () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const eventSearchInput = screen.getByLabelText("일정 검색");
    await user.type(eventSearchInput, "팀 회의");

    const eventList = screen.getByTestId("event-list");
    expect(within(eventList).getByText("검색 결과가 없습니다.")).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-10",
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent);

    const eventSearchInput = screen.getByLabelText("일정 검색");
    await user.type(eventSearchInput, "팀 회의");

    const eventList = screen.getByTestId("event-list");
    expect(within(eventList).getByText("팀 회의")).toBeInTheDocument();
  });

  it("검색어를 지우면 모든 일정이 다시 표시되어야 한다", async () => {
    const { user } = setup(<App />);
    setupMockHandlerCreation([]);
    const newEvent: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "팀 회의",
      date: "2025-10-10",
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent);
    const newEvent2: Omit<Event, "id" | "notificationTime" | "repeat"> = {
      title: "바보 회의",
      date: "2025-10-15",
      startTime: "09:00",
      endTime: "10:00",
      description: "팀 미팅",
      location: "회의실 A",
      category: "업무",
    };
    await saveSchedule(user, newEvent2);

    const eventSearchInput = screen.getByLabelText("일정 검색");
    await user.type(eventSearchInput, "팀 회의");

    const eventList = screen.getByTestId("event-list");
    expect(within(eventList).getByText("팀 회의")).toBeInTheDocument();
    // 0515 수정사항
    // 빈값을 만들기위해 빈 문자열을 넣었는데 Expected key descriptor but fond "" in "" 라는 에러가 발생.
    // user.type(eventSearchInput, 문자열)은 유저가 키보드를 누른다는 시나리오를 따라가기 때문에 빈 문자열을 입력할 수 없다.
    // clear 메서드 사용.
    // 만약 type을 이용해 모두 지우는 시나리오를 흉내내고 싶다면 await user.type(input, '{selectall}{backspace}') 사용
    await user.clear(eventSearchInput)
    expect(within(eventList).getByText("바보 회의")).toBeInTheDocument();
    expect(within(eventList).getByText("팀 회의")).toBeInTheDocument();
  });
});

describe("일정 충돌", () => {
  it("겹치는 시간에 새 일정을 추가할 때 경고가 표시된다", async () => {});

  it("기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다", async () => {});
});

it("notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다", async () => {});
