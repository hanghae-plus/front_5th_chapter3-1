// src/__tests__/features/calendar-header/CalendarHeader.test.tsx
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { CalendarHeader } from '../../features/calendar-header/ui/CalendarHeader';
import { renderWithChakra } from '../utils/test-utils';

describe('CalendarHeader', () => {
  const mockProps = {
    view: 'week' as const,
    setView: vi.fn(),
    navigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('모든 기본 요소들이 렌더링되어야 함', () => {
      renderWithChakra(<CalendarHeader {...mockProps} />);

      // 네비게이션 버튼 확인
      expect(screen.getByLabelText('Previous')).toBeInTheDocument();
      expect(screen.getByLabelText('Next')).toBeInTheDocument();

      // 뷰 선택 드롭다운 확인
      const viewSelect = screen.getByLabelText('view');
      expect(viewSelect).toBeInTheDocument();
      expect(viewSelect).toHaveValue('week');
    });

    it('드롭다운에 모든 뷰 옵션이 포함되어야 함', () => {
      renderWithChakra(<CalendarHeader {...mockProps} />);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveValue('week');
      expect(options[1]).toHaveValue('month');
    });
  });

  describe('네비게이션 기능', () => {
    it('이전 버튼 클릭 시 navigate("prev")가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<CalendarHeader {...mockProps} />);

      const prevButton = screen.getByLabelText('Previous');
      await user.click(prevButton);

      expect(mockProps.navigate).toHaveBeenCalledWith('prev');
      expect(mockProps.navigate).toHaveBeenCalledTimes(1);
    });

    it('다음 버튼 클릭 시 navigate("next")가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<CalendarHeader {...mockProps} />);

      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      expect(mockProps.navigate).toHaveBeenCalledWith('next');
      expect(mockProps.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('뷰 전환 기능', () => {
    it('월간 뷰로 변경 시 setView("month")가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<CalendarHeader {...mockProps} />);

      const viewSelect = screen.getByLabelText('view');
      await user.selectOptions(viewSelect, 'month');

      expect(mockProps.setView).toHaveBeenCalledWith('month');
      expect(mockProps.setView).toHaveBeenCalledTimes(1);
    });

    it('주간 뷰로 변경 시 setView("week")가 호출되어야 함', async () => {
      const user = userEvent.setup();
      renderWithChakra(<CalendarHeader {...mockProps} view="month" />);

      const viewSelect = screen.getByLabelText('view');
      await user.selectOptions(viewSelect, 'week');

      expect(mockProps.setView).toHaveBeenCalledWith('week');
      expect(mockProps.setView).toHaveBeenCalledTimes(1);
    });
  });

  describe('props 변경에 따른 동작', () => {
    it('view prop이 변경되면 드롭다운 값이 업데이트되어야 함', () => {
      const { rerender } = renderWithChakra(<CalendarHeader {...mockProps} />);

      // 초기값 확인
      expect(screen.getByLabelText('view')).toHaveValue('week');

      // view prop을 month로 변경
      rerender(<CalendarHeader {...mockProps} view="month" />);

      // 변경된 값 확인
      expect(screen.getByLabelText('view')).toHaveValue('month');
    });
  });
});
