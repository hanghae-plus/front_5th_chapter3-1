import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CalendarView } from '../../components/CalendarView';
import { Event } from '../../types';

// 자식 컴포넌트인 WeekView와 MonthView를 더미로 모킹 (의존성 분리하기)
vi.mock('../../components/WeekView', () => ({
  WeekView: () => <div data-testid="week-view">Week View Component</div>,
}));
// MonthView에 전달되는 { events, holidays }를 캡처하기 위한 변수
let capturedMonthViewProps: { events: Event[]; holidays: Record<string, string> } | null = null;
vi.mock('../../components/MonthView', () => ({
  MonthView: (props: { events: Event[]; holidays: Record<string, string> }) => {
    capturedMonthViewProps = props;
    return <div data-testid="month-view">Month View Component</div>;
  },
}));

describe('CalendarView 컴포넌트 테스트', () => {
  const defaultProps = {
    view: 'week' as const,
    currentDate: new Date('2025-05-15'),
    events: [
      {
        id: '1',
        title: '회의',
        date: '2025-05-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 0,
      },
    ] as Event[],
    notifiedEvents: [] as string[],
    holidays: {} as Record<string, string>,
    navigate: vi.fn(), // 'prev' / 'next'
    setView: vi.fn(), // 업데이트된 view 확인
  };

  const setup = (jsx: React.ReactElement) => ({
    ...render(<ChakraProvider>{jsx}</ChakraProvider>),
    user: userEvent.setup(),
  });

  it('캘린더에서 제목인 "일정 보기"와 주간 일정 정보가 제공된다', () => {
    setup(<CalendarView {...defaultProps} />);

    expect(screen.getByRole('heading')).toHaveTextContent('일정 보기');
    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('월간 뷰를 선택 시 월간 일정 정보가 표시된다', () => {
    setup(<CalendarView {...defaultProps} view="month" />);

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('이전 버튼을 클릭 시 캘린더가 이전 기간 뷰로 이동해 일정 정보를 업데이트한다', async () => {
    setup(<CalendarView {...defaultProps} />);
    const prevButton = screen.getByRole('button', { name: /previous/i });

    await userEvent.click(prevButton);

    expect(defaultProps.navigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼을 클릭 시 캘린더가 다음 기간 뷰로 이동해 일정 정보를 보여준다', async () => {
    setup(<CalendarView {...defaultProps} />);
    const nextButton = screen.getByRole('button', { name: /next/i });

    await userEvent.click(nextButton);

    expect(defaultProps.navigate).toHaveBeenCalledWith('next');
  });

  it('드롭다운 메뉴에서 뷰 모드를 선택 시 캘린더의 일정 뷰가 선택한 모드(월간/주간)로 전환된다', async () => {
    const { user, rerender } = setup(<CalendarView {...defaultProps} />);
    const selectElement = screen.getByRole('combobox');

    // 월간 뷰로 변경 (모킹된 setView 호출 검증)
    await user.selectOptions(selectElement, 'month');
    expect(defaultProps.setView).toHaveBeenCalledWith('month');

    // 실제로 부모가 상태를 변경했다고 가정하고, view="month"로 리렌더링
    rerender(
      <ChakraProvider>
        <CalendarView {...defaultProps} view="month" />
      </ChakraProvider>
    );

    // 리렌더링 후 실제 월간 뷰 요소가 출력되는지 확인
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('월간 뷰는 자식 컴포넌트에 이벤트 및 공휴일 데이터를 전달한다', () => {
    const holidays = { '2025-05-05': '어린이날' };
    const propsWithHoliday = { ...defaultProps, view: 'month' as const, holidays };
    // 캡처 변수 초기화
    capturedMonthViewProps = null;

    setup(<CalendarView {...propsWithHoliday} />);

    // 전달된 { events, holidays }가 캡처되었는지 확인
    expect(capturedMonthViewProps).not.toBeNull();
    if (capturedMonthViewProps) {
      expect(
        (capturedMonthViewProps as { events: Event[]; holidays: Record<string, string> }).events
      ).toStrictEqual(defaultProps.events);

      expect(
        (capturedMonthViewProps as { events: Event[]; holidays: Record<string, string> }).holidays
      ).toStrictEqual(holidays);
    }
  });
});
