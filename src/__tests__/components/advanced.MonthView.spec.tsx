import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen } from '@testing-library/react';
import React from 'react';

import MonthView from '../../components/schedule/MonthView';
import { Event, RepeatType } from '../../types';

const renderComponent = (children: React.ReactElement) => {
  return render(<ChakraProvider>{children}</ChakraProvider>);
};

const initialEvents: Event[] = [
  {
    category: '업무',
    date: '2025-05-04',
    id: '1',
    title: '생일',
    startTime: '10:00',
    endTime: '11:00',
    description: '생일이에여',
    location: '회의실 A',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const initialHolidays = {
  '2025-05-05': '쉬는날',
};

const props = {
  currentDate: new Date('2025-05-04'),
  holidays: initialHolidays,
  notifiedEvents: ['1'],
  filteredEvents: initialEvents,
};

beforeEach(async () => {
  await act(async () => {
    vi.setSystemTime(new Date('2025-05-01'));
  });
});

afterEach(() => {
  vi.useRealTimers();
});

it('MonthView 렌더링이 되어야한다', () => {
  renderComponent(<MonthView {...props} />);

  expect(screen.getByText('2025년 5월')).toBeInTheDocument();
});

it('월간 달력에 모든 요일이 표시 되어야 한다', () => {
  renderComponent(<MonthView {...props} />);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  weekDays.forEach((day) => {
    expect(screen.getByText(day)).toBeInTheDocument();
  });
});

it('공휴일이 월간달력에 표시 되어야 한다', () => {
  renderComponent(<MonthView {...props} />);

  const holiday = screen.getByText('쉬는날');
  expect(holiday).toBeInTheDocument();
});

it('월의 날짜들이 올바르게 표시되어야 한다', () => {
  renderComponent(<MonthView {...props} />);

  for (let day = 1; day <= 31; day++) {
    expect(screen.getByText(day.toString())).toBeInTheDocument();
  }
});

it('이전/다음 달의 날짜가 표시되어야 한다', () => {
  renderComponent(<MonthView {...props} />);

  const previousMonthDates = ['27', '28', '29', '30']; // 4월 날짜
  previousMonthDates.forEach((date) => {
    const dateElements = screen.getAllByText(date);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});

it('같은 날에 여러 이벤트가 있을 경우 모두 표시되어야 한다', () => {
  const multipleEventsProps = {
    ...props,
    filteredEvents: [
      ...initialEvents,
      {
        category: '개인',
        date: '2025-05-04',
        id: '2',
        title: '회의',
        startTime: '14:00',
        endTime: '15:00',
        description: '중요한 회의',
        location: '회의실 B',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    ],
  };

  renderComponent(<MonthView {...multipleEventsProps} />);

  expect(screen.getByText('생일')).toBeInTheDocument();
  expect(screen.getByText('회의')).toBeInTheDocument();
});
