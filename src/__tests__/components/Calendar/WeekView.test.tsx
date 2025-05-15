import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import { WeekView } from '../../../components/Calendar/WeekView/WeekView';
import { Event } from '../../../types';

describe('WeekView Component', () => {
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

  const defaultProps = {
    currentDate: new Date('2025-05-15'),
    events: mockEvents,
    notifiedEvents: ['1'],
  };

  const renderWeekView = () => {
    return render(
      <ChakraProvider>
        <WeekView {...defaultProps} />
      </ChakraProvider>
    );
  };

  it('주간 뷰가 올바르게 렌더링되는지 확인', () => {
    renderWeekView();
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('요일 헤더가 올바르게 표시되는지 확인', () => {
    renderWeekView();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('날짜가 올바르게 표시되는지 확인', () => {
    renderWeekView();
    // 15일이 표시되는지 확인
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('일정이 올바른 날짜에 표시되는지 확인', () => {
    renderWeekView();
    // 15일 셀에서 일정 확인
    const cells = screen.getAllByRole('cell');
    const day15Cell = cells.find((cell) => within(cell).queryByText('15'));
    expect(day15Cell).toBeTruthy();

    if (day15Cell) {
      // 일정 제목 확인
      expect(within(day15Cell).getByText('팀 회의')).toBeInTheDocument();
    }
  });

  it('알림이 있는 일정이 강조 표시되는지 확인', () => {
    renderWeekView();
    const cells = screen.getAllByRole('cell');
    const day15Cell = cells.find((cell) => within(cell).queryByText('15'));

    if (day15Cell) {
      const eventBox = within(day15Cell).getByText('팀 회의').closest('div');
      expect(eventBox).toBeDefined();
      expect(eventBox?.className).toContain('chakra-stack css-fqllj7');
    }
  });

  it('7일치 날짜가 모두 표시되는지 확인', () => {
    renderWeekView();
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(7);
  });

  it('일정이 없는 날짜에는 일정이 표시되지 않는지 확인', () => {
    renderWeekView();
    const cells = screen.getAllByRole('cell');
    const nonEventCells = cells.filter((cell) => !within(cell).queryByText('팀 회의'));

    nonEventCells.forEach((cell) => {
      expect(within(cell).queryByText('팀 회의')).not.toBeInTheDocument();
    });
  });
});
