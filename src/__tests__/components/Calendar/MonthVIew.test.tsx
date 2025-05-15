import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import { MonthView } from '../../../components/Calendar/MonthView/MonthView';
import { Event } from '../../../types';

describe('MonthView Component', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '5월 정기 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockHolidays = {
    '2025-05-05': '어린이날',
  };

  const defaultProps = {
    currentDate: new Date('2025-05-15'),
    events: mockEvents,
    notifiedEvents: ['1'],
    holidays: mockHolidays,
  };

  const renderMonthView = () => {
    return render(
      <ChakraProvider>
        <MonthView {...defaultProps} />
      </ChakraProvider>
    );
  };

  it('월별 뷰가 올바르게 렌더링되는지 확인', () => {
    renderMonthView();
    // data-testid로 월별 뷰 컴포넌트 확인
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('월 제목이 올바르게 표시되는지 확인', () => {
    renderMonthView();
    // 2025년 5월 형식으로 표시되는지 확인
    expect(screen.getByText('2025년 5월')).toBeInTheDocument();
  });

  it('요일 헤더가 올바르게 표시되는지 확인', () => {
    renderMonthView();
    // 모든 요일이 표시되는지 확인
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('공휴일이 올바르게 표시되는지 확인', () => {
    renderMonthView();
    // 어린이날 표시 확인
    const holidayText = screen.getByText('어린이날');
    expect(holidayText).toBeInTheDocument();
    // 공휴일 색상 확인
    expect(holidayText).toHaveStyle({ color: 'var(--chakra-colors-red-500)' });
  });

  it('날짜가 올바르게 표시되는지 확인', () => {
    renderMonthView();
    // 15일이 표시되는지 확인
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('일정이 올바른 날짜에 표시되는지 확인', () => {
    renderMonthView();
    // 15일 셀에서 일정 확인
    const cells = screen.getAllByRole('cell');
    const day15Cell = cells.find((cell) => within(cell).queryByText('15'));
    expect(day15Cell).toBeTruthy();

    if (day15Cell) {
      // 일정 제목 확인
      expect(within(day15Cell).getByText('팀 회의')).toBeInTheDocument();
    }
  });

  it('빈 날짜 셀이 올바르게 처리되는지 확인', () => {
    renderMonthView();
    // 이전/다음 달의 빈 셀 확인
    const emptyCells = screen
      .getAllByRole('cell')
      .filter((cell) => !within(cell).queryByText(/\d+/));
    expect(emptyCells.length).toBeGreaterThan(0);
  });

  it('알림이 있는 일정이 강조 표시되는지 확인', () => {
    renderMonthView();
    // 알림이 있는 일정의 스타일 확인
    const cells = screen.getAllByRole('cell');
    const day15Cell = cells.find((cell) => within(cell).queryByText('15'));

    if (day15Cell) {
      const eventBox = within(day15Cell).getByText('팀 회의').closest('div');
      expect(eventBox).toBeDefined();
      expect(eventBox?.className).toContain('chakra-stack css-fqllj7');
    }
  });
});
