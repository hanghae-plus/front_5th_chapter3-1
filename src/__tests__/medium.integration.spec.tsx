import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // 오늘 날짜로 맞추기
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const initialEvents: Event[] = [];
    const newEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: todayStr,
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ events: initialEvents }))) // 초기 로딩
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }))) // POST 저장
      .mockResolvedValueOnce(new Response(JSON.stringify({ events: [newEvent] }))); // 저장 후 리스트

    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );

    // 월별 뷰로 전환
    await act(async () => {
      await userEvent.selectOptions(screen.getByLabelText('view'), 'month');
    });

    // 검색어가 비어있는지 확인
    expect(screen.getByLabelText('일정 검색')).toHaveValue('');

    // 각 입력 필드에 값 입력
    await userEvent.type(screen.getByLabelText('제목'), newEvent.title);
    await userEvent.type(screen.getByLabelText('날짜'), newEvent.date);
    await userEvent.type(screen.getByLabelText('시작 시간'), newEvent.startTime);
    await userEvent.type(screen.getByLabelText('종료 시간'), newEvent.endTime);
    await userEvent.type(screen.getByLabelText('설명'), newEvent.description);
    await userEvent.type(screen.getByLabelText('위치'), newEvent.location);
    await userEvent.selectOptions(screen.getByLabelText('카테고리'), newEvent.category);
    await userEvent.selectOptions(
      screen.getByLabelText('알림 설정'),
      String(newEvent.notificationTime)
    );

    // 저장 버튼 클릭
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: '일정 추가' }));
    });

    // 디버깅: event-list의 실제 DOM 출력
    screen.debug(screen.getByTestId('event-list'));

    // 4. 저장 후 리스트에 새 이벤트가 정확히 반영됐는지 확인 (타임아웃 5초)
    expect(
      await screen.findByText((content) => content.includes(newEvent.title), {}, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getByText(newEvent.description)).toBeInTheDocument();
    expect(screen.getByText(newEvent.location)).toBeInTheDocument();
    expect(screen.getByText(`카테고리: ${newEvent.category}`)).toBeInTheDocument();
    expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();

    // fetch 호출 횟수 검증
    expect(fetchSpy).toHaveBeenCalledTimes(3);
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
