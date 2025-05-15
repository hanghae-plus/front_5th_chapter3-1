import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, RenderOptions } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import OverlapAlertDialog from '../../components/OverlapAlertDialog';
import { useEventFormContext } from '../../contexts/event-form-context';
import { Event, RepeatType } from '../../types';

vi.mock('../../contexts/event-form-context', () => ({
  useEventFormContext: vi.fn(),
}));

const mockEventBase = {
  title: 'Test Event Title',
  date: '2024-07-30',
  startTime: '10:00',
  endTime: '11:00',
  description: 'Test Description',
  location: 'Test Location',
  category: 'Test Category',
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: 15,
};

const mockEventFormNonRepeating = {
  ...mockEventBase,
  isRepeating: false,
  repeatType: 'none' as RepeatType,
};

const mockEventFormRepeatingDaily = {
  ...mockEventBase,
  isRepeating: true,
  repeatType: 'daily' as RepeatType,
  repeatInterval: 1,
  repeatEndDate: '2024-08-30',
};

const mockEventsOverLapping: Event[] = [
  {
    id: 'event1',
    title: '첫번째 일정',
    date: '2024-07-30',
    startTime: '10:30',
    endTime: '11:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: 'event2',
    title: '두번째 일정',
    date: '2024-07-30',
    startTime: '09:30',
    endTime: '10:30',
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
];

const renderOverlapAlertDialog = (ui: React.ReactNode, options?: RenderOptions) => {
  return render(ui, { wrapper: ChakraProvider, ...options });
};

describe('OverlapAlertDialog Component Test', () => {
  const mockOnClose = vi.fn();
  const mockSaveEvent = vi.fn();
  const mockCancelRef = React.createRef<HTMLButtonElement>();

  beforeEach(() => {
    vi.clearAllMocks();
    (useEventFormContext as Mock).mockReturnValue({
      eventForm: mockEventFormNonRepeating,
    });
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    cancelRef: mockCancelRef,
    saveEvent: mockSaveEvent,
    editingEvent: null,
    overlappingEvents: mockEventsOverLapping,
  };

  describe('렌더링', () => {
    it('isOpen=true일 때 올바르게 렌더링되어야 한다.', async () => {
      renderOverlapAlertDialog(<OverlapAlertDialog {...defaultProps} />);

      expect(await screen.findByText('일정 겹침 경고')).toBeInTheDocument();
      expect(await screen.findByText(/다음 일정과 겹칩니다:/)).toBeInTheDocument();
      expect(await screen.findByText(/첫번째 일정/)).toBeInTheDocument();
      expect(await screen.findByText(/두번째 일정/)).toBeInTheDocument();
      expect(await screen.findByText(/계속 진행하시겠습니까\?/)).toBeInTheDocument();

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('continue-button')).toBeInTheDocument();
    });
  });

  it('isOpen=false일 때 다이얼로그가 렌더링되지 않아야 한다.', () => {
    const { container } = render(<OverlapAlertDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  describe('사용자 상호작용', () => {
    it('취소 버튼을 클릭하면 onClose가 호출되어야 한다.', () => {
      renderOverlapAlertDialog(<OverlapAlertDialog {...defaultProps} />);
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('새 이벤트 저장 시 (반복 없음) 계속 진행 버튼을 클릭하면 onClose와 saveEvent가 호출되어야 한다.', () => {
      renderOverlapAlertDialog(<OverlapAlertDialog {...defaultProps} editingEvent={null} />);
      fireEvent.click(screen.getByTestId('continue-button'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockSaveEvent).toHaveBeenCalledTimes(1);
      const expectedEventData = {
        id: undefined,
        title: mockEventFormNonRepeating.title,
        date: mockEventFormNonRepeating.date,
        startTime: mockEventFormNonRepeating.startTime,
        endTime: mockEventFormNonRepeating.endTime,
        description: mockEventFormNonRepeating.description,
        location: mockEventFormNonRepeating.location,
        category: mockEventFormNonRepeating.category,
        repeat: {
          type: 'none',
          interval: mockEventFormNonRepeating.repeatInterval,
          endDate: undefined,
        },
        notificationTime: mockEventFormNonRepeating.notificationTime,
      };
      expect(mockSaveEvent).toHaveBeenCalledWith(expectedEventData);
    });

    it('기존 이벤트 수정 시 (반복 있음) 계속 진행 버튼을 클릭하면 onClose와 saveEvent가 호출되어야 한다.', () => {
      const editingEvent: Event = {
        id: 'existingEventId',
        title: 'Old Title',
        date: mockEventFormRepeatingDaily.date,
        startTime: mockEventFormRepeatingDaily.startTime,
        endTime: mockEventFormRepeatingDaily.endTime,
        description: mockEventFormRepeatingDaily.description,
        location: mockEventFormRepeatingDaily.location,
        category: mockEventFormRepeatingDaily.category,
        repeat: { type: 'daily', interval: 1, endDate: '2024-08-30' },
        notificationTime: mockEventFormRepeatingDaily.notificationTime,
      };

      (useEventFormContext as Mock).mockReturnValue({
        eventForm: mockEventFormRepeatingDaily,
      });

      renderOverlapAlertDialog(
        <OverlapAlertDialog {...defaultProps} editingEvent={editingEvent} />
      );
      fireEvent.click(screen.getByTestId('continue-button'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockSaveEvent).toHaveBeenCalledTimes(1);

      const expectedEventData = {
        id: editingEvent.id,
        title: mockEventFormRepeatingDaily.title,
        date: mockEventFormRepeatingDaily.date,
        startTime: mockEventFormRepeatingDaily.startTime,
        endTime: mockEventFormRepeatingDaily.endTime,
        description: mockEventFormRepeatingDaily.description,
        location: mockEventFormRepeatingDaily.location,
        category: mockEventFormRepeatingDaily.category,
        repeat: {
          type: mockEventFormRepeatingDaily.repeatType,
          interval: mockEventFormRepeatingDaily.repeatInterval,
          endDate: mockEventFormRepeatingDaily.repeatEndDate,
        },
        notificationTime: mockEventFormRepeatingDaily.notificationTime,
      };
      expect(mockSaveEvent).toHaveBeenCalledWith(expectedEventData);
    });

    it('새 이벤트 저장 시 (isRepeating=true, 주간 반복) 계속 진행 버튼을 클릭하면 올바른 repeat 정보로 saveEvent가 호출되어야 한다.', () => {
      const mockEventFormRepeatingWeekly = {
        ...mockEventBase,
        isRepeating: true,
        repeatType: 'weekly' as RepeatType,
        repeatInterval: 2,
        repeatEndDate: '2025-01-01',
      };
      (useEventFormContext as Mock).mockReturnValue({
        eventForm: mockEventFormRepeatingWeekly,
      });

      renderOverlapAlertDialog(<OverlapAlertDialog {...defaultProps} editingEvent={null} />);
      fireEvent.click(screen.getByTestId('continue-button'));

      expect(mockSaveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: undefined,
          title: mockEventFormRepeatingWeekly.title,
          repeat: {
            type: 'weekly',
            interval: 2,
            endDate: '2025-01-01',
          },
        })
      );
    });
  });
});
