// src/__tests__/features/event-card/EventCard.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Event } from '../../entities/event/model/types';
import { EventCard } from '../../features/event-card/ui/EventCard';
import { renderWithChakra } from '../utils/test-utils';

describe('EventCard', () => {
  const mockEvent: Event = {
    id: '1',
    title: '팀 미팅',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2024-04-20',
    },
    notificationTime: 10,
  };

  const mockProps = {
    event: mockEvent,
    notifiedEvents: [] as string[],
    notificationOptions: [
      { value: 10, label: '10분 전' },
      { value: 30, label: '30분 전' },
    ],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('이벤트의 모든 기본 정보가 표시되어야 함', () => {
      renderWithChakra(<EventCard {...mockProps} />);

      // 기본 정보 확인
      expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.date)).toBeInTheDocument();
      expect(screen.getByText(`${mockEvent.startTime} - ${mockEvent.endTime}`)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.location)).toBeInTheDocument();
      expect(screen.getByText(`카테고리: ${mockEvent.category}`)).toBeInTheDocument();
    });

    it('반복 설정이 올바르게 표시되어야 함', () => {
      renderWithChakra(<EventCard {...mockProps} />);

      expect(screen.getByText(/반복: 1주마다 \(종료: 2024-04-20\)/)).toBeInTheDocument();
    });

    it('알림 설정이 올바르게 표시되어야 함', () => {
      renderWithChakra(<EventCard {...mockProps} />);

      expect(screen.getByText(/알림: 10분 전/)).toBeInTheDocument();
    });
  });

//   describe('알림 상태 표시', () => {
//     it('알림이 있는 경우 벨 아이콘과 강조된 제목이 표시되어야 함', () => {
//       renderWithChakra(<EventCard {...mockProps} notifiedEvents={[mockEvent.id]} />);

//       // 벨 아이콘 확인
//       expect(screen.getByTestId('bell-icon')).toBeInTheDocument();

//       // 강조된 제목 확인
//       const title = screen.getByText(mockEvent.title);
//       expect(title).toHaveStyle({ fontWeight: 'bold', color: 'red.500' });
//     });

//     it('알림이 없는 경우 일반 스타일로 표시되어야 함', () => {
//       renderWithChakra(<EventCard {...mockProps} />);

//       // 벨 아이콘이 없어야 함
//       expect(screen.queryByTestId('bell-icon')).not.toBeInTheDocument();

//       // 일반 스타일의 제목 확인
//       const title = screen.getByText(mockEvent.title);
//       expect(title).toHaveStyle({ fontWeight: 'normal' });
//     });
//   });

  describe('버튼 동작', () => {
    it('편집 버튼 클릭 시 onEdit이 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<EventCard {...mockProps} />);

      const editButton = screen.getByLabelText('Edit event');
      await user.click(editButton);

      expect(mockProps.onEdit).toHaveBeenCalledWith(mockEvent);
      expect(mockProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('삭제 버튼 클릭 시 onDelete가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<EventCard {...mockProps} />);

      const deleteButton = screen.getByLabelText('Delete event');
      await user.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockEvent.id);
      expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('조건부 렌더링', () => {
    it('반복 설정이 없는 경우 반복 정보가 표시되지 않아야 함', () => {
      const eventWithoutRepeat = {
        ...mockEvent,
        repeat: { type: 'none', interval: 1 },
      };

      renderWithChakra(<EventCard {...mockProps} event={eventWithoutRepeat} />);

      expect(screen.queryByText(/반복:/)).not.toBeInTheDocument();
    });

    it('반복 종료일이 없는 경우 종료일 정보가 표시되지 않아야 함', () => {
      const eventWithoutEndDate = {
        ...mockEvent,
        repeat: { ...mockEvent.repeat, endDate: undefined },
      };

      renderWithChakra(<EventCard {...mockProps} event={eventWithoutEndDate} />);

      expect(screen.queryByText(/종료:/)).not.toBeInTheDocument();
    });
  });
});
