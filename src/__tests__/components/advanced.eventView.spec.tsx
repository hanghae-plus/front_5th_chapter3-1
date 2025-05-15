import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventView } from '../../components/event/view/EventView';
import { Event } from '../../types';

describe('EventView', () => {
  const defaultProps = {
    view: 'week' as const,
    setView: vi.fn(),
    currentDate: new Date('2025-05-16'),
    filteredEvents: [] as Event[],
    notifiedEvents: [] as string[],
    holidays: {},
    navigate: vi.fn(),
  };

  const renderEventView = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventView {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('기본 렌더링이 정상적으로 되어야 함', () => {
    renderEventView();

    expect(screen.getByText('일정 보기')).toBeInTheDocument();
    expect(screen.getByLabelText('view')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('뷰 변경이 정상적으로 동작해야 함', () => {
    const setView = vi.fn();
    renderEventView({ setView });

    const viewSelect = screen.getByLabelText('view');
    fireEvent.change(viewSelect, { target: { value: 'month' } });

    expect(setView).toHaveBeenCalledWith('month');
  });

  it('이전/다음 버튼이 정상적으로 동작해야 함', () => {
    const navigate = vi.fn();
    renderEventView({ navigate });

    // 이전 버튼 클릭
    const prevButton = screen.getByLabelText('Previous');
    fireEvent.click(prevButton);
    expect(navigate).toHaveBeenCalledWith('prev');

    // 다음 버튼 클릭
    const nextButton = screen.getByLabelText('Next');
    fireEvent.click(nextButton);
    expect(navigate).toHaveBeenCalledWith('next');
  });

  it('주간 뷰가 선택되었을 때 WeekView가 렌더링되어야 함', () => {
    renderEventView({ view: 'week' });

    expect(screen.getByTestId('week-view')).toBeInTheDocument();
  });

  it('월간 뷰가 선택되었을 때 MonthView가 렌더링되어야 함', () => {
    renderEventView({ view: 'month' });

    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('이벤트와 휴일 데이터가 자식 컴포넌트에 전달되어야 함', () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '테스트 일정',
        date: '2025-05-16',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ];

    const mockHolidays = {
      '2025-05-05': '어린이날',
    };

    renderEventView({
      filteredEvents: mockEvents,
      notifiedEvents: ['1'],
      holidays: mockHolidays,
    });

    expect(screen.getByText('테스트 일정')).toBeInTheDocument();
  });
});
