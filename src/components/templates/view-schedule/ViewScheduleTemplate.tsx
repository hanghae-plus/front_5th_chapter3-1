import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Fragment } from 'react';

import { MonthlyCalendar, WeeklyCalendar } from '@/components/organisms/schedule/calender';
import { Event } from '@/types';

interface ViewScheduleTemplateProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  currentDate: Date;
  holidays: Record<string, string>;
  searchTerm: string;
  navigate: (direction: 'prev' | 'next') => void;
  filteredEvents: Event[];
  notifiedEvents: string[];
  editEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  setSearchTerm: (term: string) => void;
}
const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

export const ViewScheduleTemplate = ({
  view,
  setView,
  currentDate,
  holidays,
  searchTerm,
  navigate,
  filteredEvents,
  notifiedEvents,
  editEvent,
  deleteEvent,
  setSearchTerm,
}: ViewScheduleTemplateProps) => {
  return (
    <Fragment>
      <VStack flex={1} spacing={5} align="stretch">
        <Heading>일정 보기</Heading>

        <HStack mx="auto" justifyContent="space-between">
          <IconButton
            aria-label="Previous"
            icon={<ChevronLeftIcon />}
            onClick={() => navigate('prev')}
          />
          <Select
            aria-label="view"
            value={view}
            onChange={(e) => setView(e.target.value as 'week' | 'month')}
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
          </Select>
          <IconButton
            aria-label="Next"
            icon={<ChevronRightIcon />}
            onClick={() => navigate('next')}
          />
        </HStack>

        {view === 'week' && (
          <WeeklyCalendar
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
          />
        )}
        {view === 'month' && (
          <MonthlyCalendar
            currentDate={currentDate}
            holidays={holidays}
            filteredEvents={filteredEvents}
            notifiedEvents={notifiedEvents}
          />
        )}
      </VStack>

      <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
        <FormControl>
          <FormLabel>일정 검색</FormLabel>
          <Input
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>

        {filteredEvents.length === 0 ? (
          <Text>검색 결과가 없습니다.</Text>
        ) : (
          filteredEvents.map((event) => (
            <Box
              key={event.id}
              data-testid={`event-item-${event.id}`}
              borderWidth={1}
              borderRadius="lg"
              p={3}
              width="100%"
            >
              <HStack justifyContent="space-between">
                <VStack align="start">
                  <HStack>
                    {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
                    <Text
                      fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                      color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                    >
                      {event.title}
                    </Text>
                  </HStack>
                  <Text>{event.date}</Text>
                  <Text>
                    {event.startTime} - {event.endTime}
                  </Text>
                  <Text>{event.description}</Text>
                  <Text>{event.location}</Text>
                  <Text>카테고리: {event.category}</Text>
                  {event.repeat.type !== 'none' && (
                    <Text>
                      반복: {event.repeat.interval}
                      {event.repeat.type === 'daily' && '일'}
                      {event.repeat.type === 'weekly' && '주'}
                      {event.repeat.type === 'monthly' && '월'}
                      {event.repeat.type === 'yearly' && '년'}
                      마다
                      {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                    </Text>
                  )}
                  <Text>
                    알림:{' '}
                    {
                      notificationOptions.find((option) => option.value === event.notificationTime)
                        ?.label
                    }
                  </Text>
                </VStack>
                <HStack>
                  <IconButton
                    aria-label="Edit event"
                    icon={<EditIcon />}
                    onClick={() => editEvent(event)}
                  />
                  <IconButton
                    aria-label="Delete event"
                    icon={<DeleteIcon />}
                    onClick={() => deleteEvent(event.id)}
                  />
                </HStack>
              </HStack>
            </Box>
          ))
        )}
      </VStack>
    </Fragment>
  );
};
