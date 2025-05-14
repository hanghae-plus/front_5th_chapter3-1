import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import CalendarViewSelect from '../../../modules/calendar/ui/CalendarViewSelect';

describe('캘린더 주간, 월간 뷰 변경 (CalendarViewSelect)', () => {
  const mockSetView = vi.fn();
  const mockNavigate = vi.fn();

  const renderCalendarViewSelect = (view: 'week' | 'month' = 'month') => {
    return render(
      <ChakraProvider>
        <CalendarViewSelect view={view} setView={mockSetView} navigate={mockNavigate} />
      </ChakraProvider>
    );
  };

  it('캘린더 주간, 월간 선택 버튼, 다음, 이전 버튼들이 렌더링이 잘된다', () => {
    renderCalendarViewSelect();

    expect(screen.getByLabelText('view')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('view 변경시 setView가 호출된다', () => {
    renderCalendarViewSelect('week');
    const select = screen.getByLabelText('view');

    fireEvent.change(select, { target: { value: 'month' } });

    expect(mockSetView).toHaveBeenCalledWith('month');

    fireEvent.change(select, { target: { value: 'week' } });

    expect(mockSetView).toHaveBeenCalledWith('week');
    expect(mockSetView).toHaveBeenCalledTimes(2);
  });

  it('이전 버튼 클릭시 navigate("prev")가 호출된다', () => {
    renderCalendarViewSelect();
    const prevButton = screen.getByLabelText('Previous');

    fireEvent.click(prevButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('다음 버튼 클릭시 navigate("next")가 호출된다', () => {
    renderCalendarViewSelect();
    const nextButton = screen.getByLabelText('Next');

    fireEvent.click(nextButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
