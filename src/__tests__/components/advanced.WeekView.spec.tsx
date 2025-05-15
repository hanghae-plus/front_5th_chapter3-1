import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen } from '@testing-library/react';
import React from 'react';

import WeekView from '../../components/schedule/WeekView';
import { Event } from '../../types';

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

const props = {
  currentDate: new Date('2025-05-04'),
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

it('WeekView 렌더링이 되어야한다', () => {
  renderComponent(<WeekView {...props} />);

  expect(screen.getByText('2025년 5월 2주')).toBeInTheDocument();
});

it('주간 달력에 모든 요일이 표시 되어야 한다', () => {
  renderComponent(<WeekView {...props} />);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  weekDays.forEach((day) => {
    expect(screen.getByText(day)).toBeInTheDocument();
  });
});

it('주에 해당하는 모든 날짜가 표시되어야 한다', () => {
  renderComponent(<WeekView {...props} />);

  const weekDates = [4, 5, 6, 7, 8, 9, 10];
  weekDates.forEach((date) => {
    expect(screen.getByText(date.toString())).toBeInTheDocument();
  });
});

it('주의 경계에 있는 날짜들이 올바르게 표시되어야 한다', () => {
  const newDate = new Date('2025-05-01');
  renderComponent(<WeekView {...props} currentDate={newDate} />);

  const weekDates = [27, 28, 29, 30, 1, 2, 3];
  weekDates.forEach((date) => {
    expect(screen.getByText(date.toString())).toBeInTheDocument();
  });
});

it('이전주의 날짜로 변경 시 해당 주의 날짜들이 표시되어야 한다', () => {
  const newDate = new Date('2025-04-23');
  renderComponent(<WeekView {...props} currentDate={newDate} />);

  const weekDates = [20, 21, 22, 23, 24, 25, 26];
  weekDates.forEach((date) => {
    expect(screen.getByText(date.toString())).toBeInTheDocument();
  });
});

it('다음주의 날짜로 변경 시 해당 주의 날짜들이 표시되어야 한다', () => {
  const newDate = new Date('2025-05-11');
  renderComponent(<WeekView {...props} currentDate={newDate} />);

  const weekDates = [11, 12, 13, 14, 15, 16, 17];
  weekDates.forEach((date) => {
    expect(screen.getByText(date.toString())).toBeInTheDocument();
  });
});
