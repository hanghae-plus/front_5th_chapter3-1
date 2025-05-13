import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Event } from '../../entities/event/model/types';
import { CalendarWidget } from '../../widgets/CalendarWidget/ui/CalendarWidget';
import { renderWithChakra } from '../utils/test-utils';
describe('CalendarWidget 테스트 확인', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '미팅',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 미팅',
      location: '회의실',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
  ];

  const baseProps = {
    filteredEvents: mockEvents,
    notifiedEvents: ['1'],
    view: 'week' as const,
    currentDate: new Date('2024-03-20'),
    holidays: { '2024-03-01': '삼일절' },
    setView: vi.fn(),
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 헤더와 제목이 렌더링 되어야 함', () => {
      renderWithChakra(<CalendarWidget {...baseProps} />);
      expect(screen.getByText('일정 보기')).toBeInTheDocument();
    });

    it('요일이 올바르게 표시되어야 함', () => {
      renderWithChakra(<CalendarWidget {...baseProps} />);
      ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });
  });
});
