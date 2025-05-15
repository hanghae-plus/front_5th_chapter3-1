import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import { EventItem } from '../../../components/EventList/EventItem';
import { Event } from '../../../types';

describe('EventItem Component', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '5월 정기 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly' as const,
      interval: 2,
      endDate: '2025-06-15',
    },
    notificationTime: 10,
  };

  const defaultProps = {
    event: mockEvent,
    isNotified: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderEventItem = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventItem {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('기본 이벤트 정보가 올바르게 표시되는지 확인', () => {
    renderEventItem();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('2025-05-15')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('5월 정기 회의')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('알림이 없을 때 벨 아이콘이 표시되지 않는지 확인', () => {
    renderEventItem({ isNotified: false });
    const bellIcon = screen.queryByRole('img', { hidden: true });
    expect(bellIcon).not.toBeInTheDocument();
  });

  it('반복 일정 정보가 올바르게 표시되는지 확인', () => {
    renderEventItem();
    const repeatText = screen.getByText(/반복: 2주마다/);
    const endDateText = screen.getByText(/종료: 2025-06-15/);

    expect(repeatText).toBeInTheDocument();
    expect(endDateText).toBeInTheDocument();
  });

  it('알림 설정이 올바르게 표시되는지 확인', () => {
    renderEventItem();
    expect(screen.getByText(/알림: 10분 전/)).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 onEdit이 호출되는지 확인', () => {
    renderEventItem();
    const editButton = screen.getByLabelText('Edit event');
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockEvent);
  });

  it('삭제 버튼 클릭 시 onDelete가 호출되는지 확인', () => {
    renderEventItem();
    const deleteButton = screen.getByLabelText('Delete event');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockEvent.id);
  });

  it('반복 일정이 아닐 때 반복 정보가 표시되지 않는지 확인', () => {
    const nonRepeatingEvent = {
      ...mockEvent,
      repeat: { type: 'none' as const, interval: 0 },
    };
    renderEventItem({ event: nonRepeatingEvent });

    expect(screen.queryByText(/반복:/)).not.toBeInTheDocument();
  });

  it('이벤트 아이템이 올바른 스타일로 렌더링되는지 확인', () => {
    renderEventItem();
    const container = screen.getByText('팀 회의').closest('div');
    expect(container).toBeDefined();
    expect(container?.className).toContain('chakra-stack css-1igwmid');
  });
});
