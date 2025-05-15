import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { EventCard, Event } from '../../entities/event';

describe('EventCard 컴포넌트', () => {
  const mockEvent: Event = {
    id: '1',
    title: '테스트 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 회의입니다',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  const mockHandleEdit = vi.fn();
  const mockHandleDelete = vi.fn();

  it('일정 정보가 올바르게 표시된다', () => {
    render(
      <ChakraProvider>
        <EventCard
          event={mockEvent}
          isNotified={false}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
        />
      </ChakraProvider>
    );

    expect(screen.getByText('테스트 회의')).toBeInTheDocument();
    expect(screen.getByText('2025-10-15')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
    expect(screen.getByText('테스트 회의입니다')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
    expect(screen.getByText('카테고리: 업무')).toBeInTheDocument();
  });

  it('알림이 있는 경우 알림 아이콘이 표시된다', () => {
    render(
      <ChakraProvider>
        <EventCard
          event={mockEvent}
          isNotified={true}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
        />
      </ChakraProvider>
    );

    expect(screen.getByText('테스트 회의').previousElementSibling).toBeInTheDocument();
    expect(screen.getByText('테스트 회의')).toHaveStyle({ color: 'var(--chakra-colors-red-500)' });
  });

  it('수정 버튼 클릭 시 onEdit 함수가 호출된다', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <EventCard
          event={mockEvent}
          isNotified={false}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
        />
      </ChakraProvider>
    );

    const editButton = screen.getByRole('button', { name: 'Edit event' });
    await user.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalled();
  });

  it('삭제 버튼 클릭 시 onDelete 함수가 호출된다', async () => {
    const user = userEvent.setup();
    render(
      <ChakraProvider>
        <EventCard
          event={mockEvent}
          isNotified={false}
          onEdit={mockHandleEdit}
          onDelete={mockHandleDelete}
        />
      </ChakraProvider>
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete event' });
    await user.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalled();
  });
});
