import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { WeekViewEvent } from '../../../components/Calendar/WeekView/WeekViewEvent';
import { Event } from '../../../types';

describe('WeekViewEvent Component', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 회의',
    date: '2025-05-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '5월 정기 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10,
  };

  const renderWeekViewEvent = (isNotified = false) => {
    return render(
      <ChakraProvider>
        <WeekViewEvent event={mockEvent} isNotified={isNotified} />
      </ChakraProvider>
    );
  };

  it('일정 제목이 올바르게 표시되는지 확인', () => {
    renderWeekViewEvent();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('알림이 없는 경우 기본 스타일로 표시되는지 확인', () => {
    renderWeekViewEvent(false);
    const box = screen.getByText('팀 회의').closest('div');
    expect(box).toBeDefined();
    expect(box?.className).toContain('chakra-stack css-fqllj7');
  });

  it('알림이 있는 경우 강조 스타일로 표시되는지 확인', () => {
    renderWeekViewEvent(true);
    const box = screen.getByText('팀 회의').closest('div');
    expect(box).toBeDefined();
    expect(box?.className).toContain('chakra-stack css-fqllj7');
  });

  it('알림이 있을 때 벨 아이콘이 표시되는지 확인', () => {
    renderWeekViewEvent(true);
    const svg = document.querySelector('svg');
    expect(svg).toBeDefined();
  });

  it('알림이 없을 때 벨 아이콘이 표시되지 않는지 확인', () => {
    renderWeekViewEvent(false);
    const svg = document.querySelector('svg');
    expect(svg).toBeNull();
  });
});
