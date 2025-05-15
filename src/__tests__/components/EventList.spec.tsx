import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import EventList from '@/entities/event/ui/EventList';
import { Event } from '@/types';

const dummyEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-05-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'none', // ✅ string literal로 작성
      interval: 1,
    },
    notificationTime: 10,
  },
];

const notificationOptions = [
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
];

describe('EventList 컴포넌트', () => {
  const mockSetSearchTerm = vi.fn();

  const renderWithChakra = (ui: React.ReactElement) =>
    render(<ChakraProvider>{ui}</ChakraProvider>);

  it('"검색 결과가 없습니다." 문구가 뜨는지 확인', () => {
    renderWithChakra(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={[]}
        notifiedEvents={[]}
        notificationOptions={notificationOptions}
        editEvent={vi.fn()}
        deleteEvent={vi.fn()}
      />
    );
    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('이벤트 제목이 렌더링 되는지 확인', () => {
    renderWithChakra(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={dummyEvents}
        notifiedEvents={[]}
        notificationOptions={notificationOptions}
        editEvent={vi.fn()}
        deleteEvent={vi.fn()}
      />
    );
    expect(screen.getByText('회의')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 editEvent 호출', () => {
    const mockEditEvent = vi.fn();

    renderWithChakra(
      <EventList
        searchTerm=""
        setSearchTerm={mockSetSearchTerm}
        filteredEvents={dummyEvents}
        notifiedEvents={[]}
        notificationOptions={notificationOptions}
        editEvent={mockEditEvent}
        deleteEvent={vi.fn()}
      />
    );

    const editBtn = screen.getByTestId('edit-event-button-1');
    fireEvent.click(editBtn);
    expect(mockEditEvent).toHaveBeenCalledWith(dummyEvents[0]);
  });
});
