import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Calendar from '../../components/calendar/Calendar';
import { RepeatType } from '../../types';
import { setup } from '../setup';

describe('Calendar >', () => {
  const baseProps = {
    view: 'month' as const,
    setView: vi.fn(),
    currentDate: new Date('2025-10-01'),
    filteredEvents: [
      {
        id: '1',
        title: '회의',
        date: '2025-10-10',
        startTime: '10:00',
        endTime: '11:00',
        description: '중요 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1'],
    holidays: { '2025-10-03': '개천절' },
    navigate: vi.fn(),
  };

  it('월간 뷰를 렌더링한다', () => {
    setup(<Calendar {...baseProps} />);
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });

  it('일정 제목을 렌더링한다', () => {
    setup(<Calendar {...baseProps} />);
    expect(screen.getByText('회의')).toBeInTheDocument();
  });

  it('공휴일을 렌더링한다', () => {
    setup(<Calendar {...baseProps} />);
    expect(screen.getByText('개천절')).toBeInTheDocument();
  });

  it('주간 뷰로 전환이 가능하다', async () => {
    const mockSetView = vi.fn();
    setup(<Calendar {...baseProps} setView={mockSetView} />);

    const select = screen.getByTestId('view-select');
    await userEvent.selectOptions(select, 'week');

    expect(mockSetView).toHaveBeenCalledWith('week');
  });

  it('이전/다음 버튼 클릭 시 navigate가 호출된다', () => {
    const mockNavigate = vi.fn();
    setup(<Calendar {...baseProps} navigate={mockNavigate} />);
    screen.getByRole('button', { name: 'Previous' }).click(); // 이전 버튼
    expect(mockNavigate).toHaveBeenCalledWith('prev');
  });
});
