import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { OverlapingDialog } from '../../components/OverlapingDialog';
import { Event } from '../../types';

describe('OverlapingDialog', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 일정 1',
      date: '2025-05-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '설명 1',
      location: '장소 1',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '기존 일정 2',
      date: '2025-05-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '설명 2',
      location: '장소 2',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 0,
    },
  ];

  const mockEditingEvent: Event = {
    id: '3',
    title: '새 일정',
    date: '2025-05-15',
    startTime: '10:15',
    endTime: '11:15',
    description: '새 설명',
    location: '새 장소',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 0,
  };

  const mockOnClose = vi.fn();
  const mockSaveEvent = vi.fn();

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <OverlapingDialog
          isOpen={true}
          onClose={mockOnClose}
          overlappingEvents={mockEvents}
          saveEvent={mockSaveEvent}
          editingEvent={mockEditingEvent}
          {...props}
        />
      </ChakraProvider>
    );
  };

  it('겹치는 일정 목록이 표시되어야 한다', () => {
    renderComponent();

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('기존 일정 1 (2025-05-15 10:00-11:00)')).toBeInTheDocument();
    expect(screen.getByText('기존 일정 2 (2025-05-15 10:30-11:30)')).toBeInTheDocument();
  });

  it('취소 버튼이 정상적으로 동작해야 한다', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByText('취소');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('계속 진행 버튼이 정상적으로 동작해야 한다', async () => {
    const user = userEvent.setup();
    renderComponent();

    const continueButton = screen.getByText('계속 진행');
    await user.click(continueButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockSaveEvent).toHaveBeenCalledWith({
      id: '3',
      title: '새 일정',
      date: '2025-05-15',
      startTime: '10:15',
      endTime: '11:15',
      description: '새 설명',
      location: '새 장소',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
        endDate: undefined,
      },
      notificationTime: 0,
    });
  });

  it('새 일정 생성 시 id가 undefined여야 한다', async () => {
    const user = userEvent.setup();
    renderComponent({ editingEvent: null });

    const continueButton = screen.getByText('계속 진행');
    await user.click(continueButton);

    expect(mockSaveEvent).toHaveBeenCalledWith({
      id: undefined,
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 0,
        endDate: undefined,
      },
      notificationTime: 0,
    });
  });
});
