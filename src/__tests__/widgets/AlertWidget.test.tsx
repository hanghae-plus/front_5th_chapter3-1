// src/__tests__/widgets/AlertWidget.test.tsx
import { ChakraProvider } from '@chakra-ui/react'; // ChakraProvider 추가
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import { Event, RepeatType } from '../../entities/event/model/types';
import { AlertWidget } from '../../widgets/AlertWidget/ui/AlertWidget';
import { renderWithChakra } from '../utils/test-utils';

describe('AlertWidget', () => {
  const mockEvent: Event = {
    // Event 타입 명시적 정의
    id: '1',
    title: '기존 일정',
    date: '2024-03-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '미팅',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'none' as RepeatType,
      interval: 1,
      endDate: undefined,
    },
    notificationTime: 10,
  };

  const baseProps = {
    isOverlapDialogOpen: true,
    cancelRef: { current: null },
    setIsOverlapDialogOpen: vi.fn(),
    overlappingEvents: [] as Event[], // 타입 명시
    saveEvent: vi.fn(),
    editingEvent: null as Event | null, // 타입 명시
    eventData: {
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      isRepeating: false,
      repeatType: 'none' as RepeatType,
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    },
  };

  const propsWithData = {
    ...baseProps,
    overlappingEvents: [mockEvent], // 미리 정의된 Event 객체 사용
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('다이얼로그가 닫혀있을 때는 아무것도 렌더링되지 않아야 함', () => {
      renderWithChakra(<AlertWidget {...baseProps} isOverlapDialogOpen={false} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('다이얼로그가 열려있을 때 기본 구조가 렌더링되어야 함', () => {
      renderWithChakra(<AlertWidget {...baseProps} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
      expect(screen.getByText('다음 일정과 겹칩니다:계속 진행하시겠습니까?')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
      expect(screen.getByText('계속 진행')).toBeInTheDocument();
    });

    it('겹치는 일정이 있을 때 해당 일정들이 표시되어야 함', () => {
      renderWithChakra(<AlertWidget {...propsWithData} />);

      expect(screen.getByText(/기존 일정/)).toBeInTheDocument();
      expect(screen.getByText(/2024-03-20/)).toBeInTheDocument();
      expect(screen.getByText(/10:00-11:00/)).toBeInTheDocument();
    });
  });

  describe('UI 상호작용', () => {
    it('취소 버튼 클릭 시 닫기 함수가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<AlertWidget {...baseProps} />);

      await user.click(screen.getByText('취소'));
      expect(baseProps.setIsOverlapDialogOpen).toHaveBeenCalledWith(false);
    });

    it('계속 진행 버튼 클릭 시 이벤트가 저장되고 다이얼로그가 닫혀야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<AlertWidget {...baseProps} />);

      await user.click(screen.getByText('계속 진행'));
      expect(baseProps.setIsOverlapDialogOpen).toHaveBeenCalledWith(false);
      expect(baseProps.saveEvent).toHaveBeenCalled();
    });
  });
});
