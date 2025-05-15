// src/__tests__/modules/schedule/ui/ScheduleOverlapAlertDialog.spec.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import ScheduleOverlapAlertDialog from '../../../modules/schedule/ui/ScheduleOverlapAlertDialog';
import { Event } from '../../../types';

describe('ScheduleOverlapAlertDialog', () => {
  const mockSetIsOverlapDialogOpen = vi.fn();
  const mockClickEvent = vi.fn();

  const mockOverlappingEvents: Event[] = [
    {
      id: '1',
      title: '팀 미팅',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
    {
      id: '2',
      title: '프로젝트 회의',
      date: '2025-10-15',
      startTime: '09:30',
      endTime: '10:30',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    },
  ];

  const renderOverlapDialog = (isOpen: boolean = false) => {
    return render(
      <ChakraProvider>
        <ScheduleOverlapAlertDialog
          isOverlapDialogOpen={isOpen}
          setIsOverlapDialogOpen={mockSetIsOverlapDialogOpen}
          overlappingEvents={mockOverlappingEvents}
          clickEvent={mockClickEvent}
        />
      </ChakraProvider>
    );
  };

  it('다이얼로그가 열려있을 때 일접 겹침 텍스트들이 렌더링된다', () => {
    renderOverlapDialog(true);
    console.log(screen.debug());

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText(/다음 일정과 겹칩니다/i)).toBeInTheDocument();
    expect(screen.getByText(/계속 진행하시겠습니까/i)).toBeInTheDocument();
  });

  it('겹치는 일정들이 올바르게 표시된다', () => {
    renderOverlapDialog(true);

    mockOverlappingEvents.forEach((event) => {
      const eventText = `${event.title} (${event.date} ${event.startTime}-${event.endTime})`;

      expect(screen.getByText(eventText)).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭시 다이얼로그가 닫힌다', () => {
    renderOverlapDialog(true);
    const cancelButton = screen.getByText('취소');

    fireEvent.click(cancelButton);

    expect(mockSetIsOverlapDialogOpen).toHaveBeenCalledWith(false);
  });

  it('계속 진행 버튼 클릭시 clickEvent가 호출된다', () => {
    renderOverlapDialog(true);
    const continueButton = screen.getByText('계속 진행');

    fireEvent.click(continueButton);

    expect(mockClickEvent).toHaveBeenCalled();
  });

  it('다이얼로그가 닫혀있을 때는 렌더링되지 않는다', () => {
    renderOverlapDialog(false);

    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
  });
});
