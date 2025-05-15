import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import type { Event } from '../types';
import { EVENT } from './constants';
import { makeEvents } from './utils';

const submitEvent = async (event?: Partial<Event>) => {
  const user = userEvent.setup();

  const $titleInput = screen.getByLabelText<HTMLInputElement>('제목');
  const $dateInput = screen.getByLabelText<HTMLInputElement>('날짜');
  const $startTimeInput = screen.getByLabelText<HTMLInputElement>('시작 시간');
  const $endTimeInput = screen.getByLabelText<HTMLInputElement>('종료 시간');
  const $descriptionInput = screen.getByLabelText<HTMLInputElement>('설명');
  const $locationInput = screen.getByLabelText<HTMLInputElement>('위치');
  const $categoryInput = screen.getByLabelText<HTMLInputElement>('카테고리');
  const $notificationTimeInput = screen.getByLabelText<HTMLInputElement>('알림 설정');
  const $submitButton = screen.getByTestId<HTMLButtonElement>('event-submit-button');

  const $isRepeatingCheckbox = screen.getByLabelText<HTMLInputElement>('반복 설정');
  if (!$isRepeatingCheckbox.checked) {
    await user.click($isRepeatingCheckbox);
  }

  const $repeatTypeInput = screen.getByLabelText<HTMLInputElement>('반복 유형');
  const $repeatIntervalInput = screen.getByLabelText<HTMLInputElement>('반복 간격');
  const $repeatEndDateInput = screen.getByLabelText<HTMLInputElement>('반복 종료일');

  if (event?.title) {
    await user.clear($titleInput);
    await user.type($titleInput, event.title);
  } else if (!$titleInput.value) {
    await user.type($titleInput, EVENT.title);
  }

  if (event?.date) {
    await user.clear($dateInput);
    await user.type($dateInput, event.date);
  } else if (!$dateInput.value) {
    await user.type($dateInput, EVENT.date);
  }

  if (event?.startTime) {
    await user.clear($startTimeInput);
    await user.type($startTimeInput, event.startTime);
  } else if (!$startTimeInput.value) {
    await user.type($startTimeInput, EVENT.startTime);
  }

  if (event?.endTime) {
    await user.clear($endTimeInput);
    await user.type($endTimeInput, event.endTime);
  } else if (!$endTimeInput.value) {
    await user.type($endTimeInput, EVENT.endTime);
  }

  if (event?.description) {
    await user.clear($descriptionInput);
    await user.type($descriptionInput, event.description);
  } else if (!$descriptionInput.value) {
    await user.type($descriptionInput, EVENT.description);
  }

  if (event?.location) {
    await user.clear($locationInput);
    await user.type($locationInput, event.location);
  } else if (!$locationInput.value) {
    await user.type($locationInput, EVENT.location);
  }

  if (event?.category) {
    await user.type($categoryInput, event.category);
  } else if (!$categoryInput.value) {
    await user.type($categoryInput, EVENT.category);
  }

  if (event?.notificationTime) {
    await user.type($notificationTimeInput, String(event.notificationTime));
  } else if (!$notificationTimeInput.value) {
    await user.type($notificationTimeInput, String(EVENT.notificationTime));
  }

  if (event?.repeat) {
    await user.type($repeatTypeInput, event.repeat.type);
    await user.type($repeatIntervalInput, String(event.repeat.interval));
    await user.type($repeatEndDateInput, event.repeat.endDate ?? EVENT.repeat.endDate);
  } else if (!$repeatTypeInput.value) {
    await user.type($repeatTypeInput, EVENT.repeat.type);
    await user.type($repeatIntervalInput, String(EVENT.repeat.interval));
    await user.type($repeatEndDateInput, EVENT.repeat.endDate);
  }

  await user.click($submitButton);
};
const setup = (initialEvents?: Event[]) => {
  setupMockHandlerCreation(initialEvents);

  render(
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setup();

    const createdDescription = '내가 만든 설명 - ' + Date.now();

    await submitEvent({ description: createdDescription });

    expect(await screen.findByText(createdDescription)).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initialEvents = makeEvents();
    setup(initialEvents);

    const $eventItems = await screen.findAllByTestId('event-item');
    const $targetEventItem = $eventItems.find(($item) =>
      within($item).queryByText(initialEvents[0].title)
    );
    if (!$targetEventItem) return;

    const user = userEvent.setup();

    const $editEventButton = within($targetEventItem).getByRole('button', { name: 'Edit event' });
    await user.click($editEventButton);

    const updatedDescription = '내가 수정한 일정 - ' + Date.now();
    await submitEvent({ description: updatedDescription });

    expect(await screen.findByText(updatedDescription)).toBeInTheDocument();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const initialEvents = makeEvents();
    setup(initialEvents);

    const $eventItems = await screen.findAllByTestId('event-item');
    const $targetEventItem = $eventItems.find(($item) =>
      within($item).queryByText(initialEvents[0].title)
    );
    if (!$targetEventItem) return;

    const user = userEvent.setup();

    const $deleteEventButton = within($targetEventItem).getByRole('button', {
      name: 'Delete event',
    });
    await user.click($deleteEventButton);

    expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();
  });
});
describe('일정 뷰', () => {
  const today = new Date();

  // 이번주 월요일
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + 1);
  currentWeekMonday.setHours(0, 0, 0, 0);

  // 다음주 월요일
  const nextWeekMonday = new Date(currentWeekMonday);
  nextWeekMonday.setDate(currentWeekMonday.getDate() + 7);

  // 이번달 1일
  const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 2);
  currentMonthFirstDay.setHours(0, 0, 0, 0);

  // 다음달 1일
  const nextMonthFirstDay = new Date(today.getFullYear(), today.getMonth() + 1, 2);
  nextMonthFirstDay.setHours(0, 0, 0, 0);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const initialEvents = makeEvents(2).map((event) => ({
      ...event,
      date: formatDate(nextWeekMonday),
    }));
    setup(initialEvents);

    const user = userEvent.setup();

    const $viewCombobox = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions($viewCombobox, 'week');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const initialEvents = makeEvents(2).map((event) => ({
      ...event,
      date: formatDate(currentWeekMonday),
    }));
    setup(initialEvents);

    const user = userEvent.setup();

    const $viewCombobox = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions($viewCombobox, 'week');

    expect(await screen.findByText(initialEvents[0].description)).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const initialEvents = makeEvents(2).map((event) => ({
      ...event,
      date: formatDate(nextMonthFirstDay),
    }));
    setup(initialEvents);

    const user = userEvent.setup();

    const $viewCombobox = screen.getByRole('combobox', { name: 'view' });
    await user.selectOptions($viewCombobox, 'month');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const initialEvents = makeEvents(2).map((event) => ({
      ...event,
      date: formatDate(currentMonthFirstDay),
    }));
    setup(initialEvents);

    const $monthView = screen.getByTestId('month-view');
    const $targetEventItem = within($monthView).getByText((content) => {
      const fullTitle = initialEvents[0].title;
      let displayedPrefix = content;
      if (content.endsWith('...')) {
        displayedPrefix = content.substring(0, content.length - 3);
      }
      return displayedPrefix.length > 0 && fullTitle.startsWith(displayedPrefix);
    });

    expect($targetEventItem).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const initialEvents = makeEvents();
    setup(initialEvents);

    const user = userEvent.setup();
    const $prevButton = screen.getByRole('button', { name: 'Previous' });

    for (let i = 0; i < 12; i++) {
      try {
        await screen.findByText('신정', {}, { timeout: 100 });
        break;
      } catch (e) {
        await user.click($prevButton);
      }
    }

    expect(await screen.findByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const initialEvents = makeEvents();
    setup(initialEvents);

    const user = userEvent.setup();

    const $searchInput = screen.getByPlaceholderText<HTMLInputElement>('검색어를 입력하세요');
    await user.type($searchInput, '일정이 없을 제목');

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const COUNT = 3;

    const initialEvents = makeEvents(COUNT).map((event, index) => ({
      ...event,
      title: `팀 회의${index + 1}`,
    }));
    setup(initialEvents);

    const user = userEvent.setup();

    const $searchInput = screen.getByPlaceholderText<HTMLInputElement>('검색어를 입력하세요');
    await user.type($searchInput, '팀 회의');

    const $eventItems = await screen.findAllByTestId('event-item');
    expect($eventItems).toHaveLength(COUNT);
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const COUNT = 4;

    const initialEvents = makeEvents(COUNT).map((event, index) => ({
      ...event,
      title: index % 2 === 0 ? event.title : `팀 회의${index + 1}`,
    }));
    setup(initialEvents);

    const user = userEvent.setup();

    const $searchInput = screen.getByPlaceholderText<HTMLInputElement>('검색어를 입력하세요');
    await user.type($searchInput, '팀 회의');
    expect(await screen.findAllByTestId('event-item')).toHaveLength(COUNT / 2);

    await user.clear($searchInput);
    expect(await screen.findAllByTestId('event-item')).toHaveLength(COUNT);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const initialEvents = makeEvents(1).map((event) => ({
      ...event,
      date: EVENT.date,
      startTime: EVENT.startTime,
      endTime: EVENT.endTime,
    }));
    setup(initialEvents);

    await submitEvent({
      ...initialEvents[0],
      title: '겹치는 일정',
      description: '겹치는 일정 설정',
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const initialEvents = makeEvents(2).map((event, index) => ({
      ...event,
      ...(index === 0 && { date: EVENT.date }),
      startTime: EVENT.startTime,
      endTime: EVENT.endTime,
    }));
    setup(initialEvents);

    const $eventItems = await screen.findAllByTestId('event-item');
    const $targetEventItem = $eventItems.find(($item) =>
      within($item).queryByText(initialEvents[1].title)
    );
    if (!$targetEventItem) return;

    const user = userEvent.setup();

    const $editEventButton = within($targetEventItem).getByRole('button', { name: 'Edit event' });
    await user.click($editEventButton);

    await submitEvent({
      date: initialEvents[0].date,
      startTime: initialEvents[0].startTime,
      endTime: initialEvents[0].endTime,
    });

    expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

describe('🐬 알림 기능', () => {
  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const initialEvents = makeEvents(1).map((event) => ({
      ...event,
      date: EVENT.date,
      startTime: EVENT.startTime,
      endTime: EVENT.endTime,
    }));
    setup(initialEvents);

    vi.setSystemTime(EVENT.date);

    expect(await screen.findByText('10분 전')).toBeInTheDocument();
  });
});
