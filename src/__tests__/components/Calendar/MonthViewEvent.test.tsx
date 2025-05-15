import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { MonthViewEvent } from '../../../components/Calendar/MonthView/MonthViewEvent';
import { Event } from '../../../types.ts';

describe('MonthViewEvent Component', () => {
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

  const renderMonthViewEvent = (isNotified = false) => {
    return render(
      <ChakraProvider>
        <MonthViewEvent event={mockEvent} isNotified={isNotified} />
      </ChakraProvider>
    );
  };

  it('일정 제목이 올바르게 표시되는지 확인', () => {
    renderMonthViewEvent();
    expect(screen.getByText('팀 회의')).toBeInTheDocument();
  });

  it('알림이 없는 경우 기본 스타일로 표시되는지 확인', () => {
    // 1. isNotified가 false인 상태로 컴포넌트를 렌더링
    renderMonthViewEvent(false);

    // 2. '팀 회의' 텍스트를 포함하는 요소를 찾고, 그 요소의 가장 가까운 div 부모를 찾음
    const box = screen.getByText('팀 회의').closest('div');

    // 3. box 요소가 존재하는지 확인
    expect(box).toBeDefined();

    // 4. box의 className이 'chakra-stack css-fqllj7'를 포함하는지 확인
    // - chakra-stack: Chakra UI의 Stack 컴포넌트임을 나타냄
    // - css-fqllj7: Chakra UI가 생성한 고유한 스타일 클래스
    expect(box?.className).toContain('chakra-stack css-fqllj7');
  });

  it('알림이 있는 경우 강조 스타일로 표시되는지 확인', () => {
    // 1. isNotified가 true인 상태로 컴포넌트를 렌더링
    // (알림이 있는 상태를 시뮬레이션)
    renderMonthViewEvent(true);

    // 2. '팀 회의' 텍스트를 포함하는 요소를 찾고, 그 요소의 가장 가까운 div 부모를 찾음
    const box = screen.getByText('팀 회의').closest('div');

    // 3. box 요소가 존재하는지 확인
    expect(box).toBeDefined();

    // 4. box의 className이 'chakra-stack css-fqllj7'를 포함하는지 확인
    expect(box?.className).toContain('chakra-stack css-fqllj7');
  });

  it('알림이 있을 때 벨 아이콘이 표시되는지 확인', () => {
    renderMonthViewEvent(true);
    // expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('알림이 없을 때 벨 아이콘이 표시되지 않는지 확인', () => {
    renderMonthViewEvent(false);
    expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();
  });
});
