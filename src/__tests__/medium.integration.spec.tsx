import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import type { Event } from '../types';

const createEvent = async (event?: Partial<Event>, isDebug = false) => {
  const user = userEvent.setup();

  const $titleInput = screen.getByLabelText('제목');
  const $dateInput = screen.getByLabelText('날짜');
  const $startTimeInput = screen.getByLabelText('시작 시간');
  const $endTimeInput = screen.getByLabelText('종료 시간');
  const $descriptionInput = screen.getByLabelText('설명');
  const $locationInput = screen.getByLabelText('위치');
  const $categoryInput = screen.getByLabelText('카테고리');
  const $isRepeatingInput = screen.getByLabelText('반복 설정');
  const $notificationTimeInput = screen.getByLabelText('알림 설정');
  const $repeatTypeInput = screen.getByLabelText('반복 유형');
  const $repeatIntervalInput = screen.getByLabelText('반복 간격');
  const $repeatEndDateInput = screen.getByLabelText('반복 종료일');
  const $addButton = screen.getByTestId('event-submit-button');

  await user.type($titleInput, event?.title ?? '내가 만든 제목');
  await user.type($dateInput, event?.date ?? '2025-05-15');
  await user.type($startTimeInput, event?.startTime ?? '00:00');
  await user.type($endTimeInput, event?.endTime ?? '10:00');
  await user.type($descriptionInput, event?.description ?? '내가 만든 설명');
  await user.type($locationInput, event?.location ?? '내가 만든 위치');
  await user.type($categoryInput, event?.category ?? '내가 만든 카테고리');
  await user.type($isRepeatingInput, event?.repeat?.type ?? '반복');
  await user.type($notificationTimeInput, String(event?.notificationTime ?? 10));
  await user.type($repeatTypeInput, event?.repeat?.type ?? '매일');
  await user.type($repeatIntervalInput, String(event?.repeat?.interval ?? 1));
  await user.type($repeatEndDateInput, event?.repeat?.endDate ?? '2025-05-15');
  await user.click($addButton);

  if (isDebug) {
    screen.debug(screen.getByTestId('event-list'));
  }
};

describe.only('일정 CRUD 및 기본 기능', () => {
  beforeEach(async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  });

  it.only('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const createdDescription = '내가 만든 설명 - ' + Date.now();

    await createEvent({
      description: createdDescription,
    });

    expect(await screen.findByText(createdDescription)).toBeInTheDocument();
  });

  it.skip('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {});

  it.skip('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {});
});

describe.skip('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe.skip('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe.skip('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
