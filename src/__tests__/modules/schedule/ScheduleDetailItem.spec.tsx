import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { events } from '../../../../src/__mocks__/response/events.json';
import ScheduleDetailItem from '../../../modules/schedule/ui/ScheduleDetailItem';
import { Event } from '../../../types';

describe('일정 상세 아이템 (ScheduleDetailItem)', () => {
  const mockEvent = events[0] as Event;

  const mockEditEvent = vi.fn();
  const mockDeleteEvent = vi.fn();

  const renderScheduleDetailItem = (event: Event = mockEvent, notifiedEvents: string[] = []) => {
    return render(
      <ChakraProvider>
        <ScheduleDetailItem
          event={mockEvent}
          notifiedEvents={notifiedEvents}
          editEvent={mockEditEvent}
          deleteEvent={mockDeleteEvent}
        />
      </ChakraProvider>
    );
  };

  it('일정 상세 정보가 표시된다', () => {
    renderScheduleDetailItem();

    // 기본 정보 표시 확인
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.date)).toBeInTheDocument();
    expect(screen.getByText(`${mockEvent.startTime} - ${mockEvent.endTime}`)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.location)).toBeInTheDocument();
    expect(screen.getByText(`카테고리: ${mockEvent.category}`)).toBeInTheDocument();
  });

  it('편집 버튼 클릭시 editEvent가 호출된다', () => {
    renderScheduleDetailItem();

    const editButton = screen.getByLabelText('Edit event');
    fireEvent.click(editButton);

    expect(mockEditEvent).toBeCalledTimes(1);
  });

  it('삭제 버튼 클릭시 deleteEvent가 호출된다', () => {
    renderScheduleDetailItem();

    const deleteButton = screen.getByLabelText('Delete event');
    fireEvent.click(deleteButton);

    expect(mockDeleteEvent).toBeCalledTimes(1);
  });
});
