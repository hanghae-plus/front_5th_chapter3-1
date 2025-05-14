import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 일정 정보 입력
    const titleInput = screen.getByLabelText('제목');
    const dateInput = screen.getByLabelText('날짜');
    const startTimeInput = screen.getByLabelText('시작 시간');
    const endTimeInput = screen.getByLabelText('종료 시간');
    const descriptionInput = screen.getByLabelText('설명');
    const locationInput = screen.getByLabelText('위치');
    const categoryInput = screen.getByLabelText('카테고리');

    await userEvent.type(titleInput, '팀 회의');
    await userEvent.type(dateInput, '2025-05-20');
    await userEvent.type(startTimeInput, '14:00');
    await userEvent.type(endTimeInput, '15:00');
    await userEvent.type(descriptionInput, '주간 회의');
    await userEvent.type(locationInput, '회의실');
    await userEvent.selectOptions(categoryInput, '업무');

    // 저장 버튼 클릭
    const saveButton = screen.getByTestId('event-submit-button');
    await userEvent.click(saveButton);

    // 저장된 일정이 리스트에 표시되는지 확인
    const eventList = screen.getByTestId('event-list');
    const eventItems = within(eventList).getAllByTestId('event-item');

    expect(eventItems).toHaveLength(1);
    expect(eventItems[0]).toHaveTextContent('팀 회의');
    expect(eventItems[0]).toHaveTextContent('2025-05-20');
    expect(eventItems[0]).toHaveTextContent('14:00');
    expect(eventItems[0]).toHaveTextContent('15:00');
    expect(eventItems[0]).toHaveTextContent('주간 회의');
    expect(eventItems[0]).toHaveTextContent('회의실');
    expect(eventItems[0]).toHaveTextContent('업무');

    // 월별 뷰에 일정이 정확히 표시되는지 확인
    const monthView = screen.getByTestId('month-view');
    const monthViewEvent = within(monthView).getByText('팀 회의');
    expect(monthViewEvent).toBeInTheDocument();
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {});

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {});
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {});

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {});

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {});

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {});

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {});
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {});

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {});

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {});
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {});

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {});
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {});
