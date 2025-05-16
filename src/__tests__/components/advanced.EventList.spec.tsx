import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import EventList, { EventListProps } from '../../components/EventList';
import { NOTIFICATION_OPTIONS } from '../../constants';
import { Event } from '../../types';

const mockEditEvent = vi.fn();
vi.mock('../../hooks/useEventForm', () => ({
  useEventForm: () => ({
    editEvent: mockEditEvent,
  }),
}));

const EventListWrapper = (props: Partial<EventListProps> & { initialSearchTerm?: string }) => {
  const [searchTerm, setSearchTerm] = useState(props.initialSearchTerm || '');

  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
    if (props.setSearchTerm) {
      props.setSearchTerm(term);
    }
  };

  const eventListSpecificProps: EventListProps = {
    notifiedEvents: props.notifiedEvents || [],
    filteredEvents: props.filteredEvents || [],
    deleteEvent: props.deleteEvent || vi.fn(),
    searchTerm: searchTerm,
    setSearchTerm: handleSetSearchTerm,
  };

  return <EventList {...eventListSpecificProps} />;
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: '테스트 이벤트 1 (반복 없음, 알림 없음)',
    date: '2024-07-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '첫 번째 테스트 이벤트 설명',
    location: '테스트 장소 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '테스트 이벤트 2 (매일 반복, 알림 10분 전)',
    date: '2024-07-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '두 번째 테스트 이벤트 설명',
    location: '테스트 장소 2',
    category: '개인',
    repeat: { type: 'daily', interval: 1, endDate: '2024-08-05' },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '테스트 이벤트 3 (매주 반복, 종료일 없음, 알림 1시간 전)',
    date: '2024-08-01',
    startTime: '09:00',
    endTime: '09:30',
    description: '세 번째 테스트 이벤트 설명',
    location: '테스트 장소 3',
    category: '가족',
    repeat: { type: 'weekly', interval: 2 },
    notificationTime: 60,
  },
];

describe('EventList Component Test', () => {
  let mockDeleteEvent: ReturnType<typeof vi.fn>;
  let mockOriginalSetSearchTerm: ReturnType<typeof vi.fn>;
  let baseProps: Omit<EventListProps, 'searchTerm' | 'setSearchTerm'>;
  let user: UserEvent;

  beforeEach(() => {
    mockDeleteEvent = vi.fn();
    mockOriginalSetSearchTerm = vi.fn();
    vi.clearAllMocks();
    user = userEvent.setup();

    baseProps = {
      notifiedEvents: [],
      filteredEvents: [],
      deleteEvent: mockDeleteEvent,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링 및 초기 상태', () => {
    it('일정 검색 UI가 올바르게 렌더링되어야 한다.', () => {
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            initialSearchTerm=""
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('검색어를 입력하세요')).toBeInTheDocument();
    });

    it('filteredEvents가 비어있을 때 "검색 결과가 없습니다." 메시지를 표시해야 한다.', () => {
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            initialSearchTerm=""
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('filteredEvents에 일정이 있을 경우 모든 일정 정보를 정확히 렌더링해야 한다.', () => {
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            filteredEvents={mockEvents}
            initialSearchTerm=""
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );

      mockEvents.forEach((event) => {
        expect(screen.getByText(event.title)).toBeInTheDocument();
        expect(screen.getByText(event.date)).toBeInTheDocument();
        expect(screen.getByText(`${event.startTime} - ${event.endTime}`)).toBeInTheDocument();
        expect(screen.getByText(event.description)).toBeInTheDocument();
        expect(screen.getByText(event.location)).toBeInTheDocument();
        expect(screen.getByText(`카테고리: ${event.category}`)).toBeInTheDocument();

        if (event.repeat.type !== 'none') {
          let repeatText = '';
          switch (event.repeat.type) {
            case 'daily':
              repeatText = `반복: ${event.repeat.interval}일마다`;
              break;
            case 'weekly':
              repeatText = `반복: ${event.repeat.interval}주마다`;
              break;
            case 'monthly':
              repeatText = `반복: ${event.repeat.interval}월마다`;
              break;
            case 'yearly':
              repeatText = `반복: ${event.repeat.interval}년마다`;
          }
          if (event.repeat.endDate) {
            repeatText += ` (종료: ${event.repeat.endDate})`;
          }
          expect(screen.getByText(repeatText)).toBeInTheDocument();
        }

        const notificationLabel = NOTIFICATION_OPTIONS.find(
          (opt) => opt.value === event.notificationTime
        )?.label;
        if (notificationLabel) {
          expect(screen.getByText(`알림: ${notificationLabel}`)).toBeInTheDocument();
        }
      });
    });
  });

  describe('사용자 상호작용', () => {
    it('검색어 입력 시 setSearchTerm 함수가 호출되고 입력 필드의 값이 변경되어야 한다.', async () => {
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            initialSearchTerm=""
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );

      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요') as HTMLInputElement;
      const searchTermToType = '테스트 검색어';

      await user.type(searchInput, searchTermToType);

      expect(mockOriginalSetSearchTerm).toHaveBeenLastCalledWith(searchTermToType);
      expect(searchInput.value).toBe(searchTermToType);
    });

    it('수정 버튼 클릭 시 editEvent 함수가 해당 이벤트 객체와 함께 호출되어야 한다.', async () => {
      const eventToEdit = mockEvents[0];
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            filteredEvents={[eventToEdit]}
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      const editButton = screen.getByTestId(`edit-button-${eventToEdit.id}`);
      await user.click(editButton);
      expect(mockEditEvent).toHaveBeenCalledWith(eventToEdit);
    });

    it('삭제 버튼 클릭 시 deleteEvent 함수가 해당 이벤트 ID와 함께 호출되어야 한다.', async () => {
      const eventToDelete = mockEvents[1];
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            filteredEvents={[eventToDelete]}
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      const deleteButton = screen.getByTestId(`delete-button-${eventToDelete.id}`);
      await user.click(deleteButton);
      expect(mockDeleteEvent).toHaveBeenCalledWith(eventToDelete.id);
    });
  });

  describe('Props 변경에 따른 UI 업데이트', () => {
    it('searchTerm prop 변경 시 입력 필드의 값이 업데이트되어야 한다.', async () => {
      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            initialSearchTerm="초기값"
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      const searchInput = screen.getByPlaceholderText('검색어를 입력하세요') as HTMLInputElement;
      expect(searchInput.value).toBe('초기값');

      await user.clear(searchInput);
      await user.type(searchInput, '변경된 검색어');
      expect(mockOriginalSetSearchTerm).toHaveBeenLastCalledWith('변경된 검색어');
      expect(searchInput.value).toBe('변경된 검색어');
    });

    it('notifiedEvents에 포함된 이벤트는 BellIcon과 함께 강조 스타일로 표시 되어야한다.', () => {
      const notifiedEvent = mockEvents[0];
      const regularEvent = mockEvents[1];

      render(
        <ChakraProvider>
          <EventListWrapper
            {...baseProps}
            filteredEvents={[notifiedEvent, regularEvent]}
            notifiedEvents={[notifiedEvent.id]}
            setSearchTerm={mockOriginalSetSearchTerm}
          />
        </ChakraProvider>
      );
      const bellIcon = screen.getByTestId(`bell-icon-${notifiedEvent.id}`);
      expect(bellIcon).toBeInTheDocument();

      const notifiedEventTitle = screen.getByText(notifiedEvent.title);
      expect(notifiedEventTitle).toHaveStyle('font-weight: var(--chakra-fontWeights-bold)');
      expect(notifiedEventTitle).toHaveStyle('color: var(--chakra-colors-red-500)');

      const regularEventTitle = screen.getByText(regularEvent.title);
      expect(regularEventTitle).not.toHaveStyle('font-weight: bold');

      expect(screen.queryByTestId(`bell-icon-${regularEvent.id}`)).not.toBeInTheDocument();
    });
  });
});
