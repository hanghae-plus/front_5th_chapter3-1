import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EventFormWrapper from '../../components/EventFormWrapper';

// 테스트용 이벤트 데이터
const mockEvent = {
  id: '1',
  title: '기존 일정',
  date: '2025-05-15',
  startTime: '09:00',
  endTime: '10:00',
  description: '회의',
  location: '회의실',
  category: '업무',
  notificationTime: 10,
  repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-07-31' },
};

const setup = ({ isEditMode = false } = {}) => {
  const mockSaveEvent = vitest.fn(() => Promise.resolve());
  const user = userEvent.setup();

  const renderResult = render(
    <EventFormWrapper saveEvent={mockSaveEvent} editingEvent={isEditMode ? mockEvent : null} />
  );

  return {
    user,
    mockSaveEvent,
    ...renderResult,
  };
};

describe('EventForm Component', () => {
  describe('일정 추가/수정 폼 렌더링', () => {
    it('일정 추가 모드에서는 빈 폼이 렌더링되어야 한다', () => {
      setup();

      expect(screen.getByRole('heading')).toHaveTextContent('일정 추가');
      expect(screen.getByLabelText('제목')).toHaveValue('');
      expect(screen.getByLabelText('날짜')).toHaveValue('');
      expect(screen.getByLabelText('시작 시간')).toHaveValue('');
      expect(screen.getByLabelText('종료 시간')).toHaveValue('');
      expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
    });

    it('수정 모드에서는 기존 데이터가 폼에 표시되어야 한다', () => {
      setup({ isEditMode: true });

      expect(screen.getByRole('heading')).toHaveTextContent('일정 수정');
      expect(screen.getByLabelText('제목')).toHaveValue('기존 일정');
      expect(screen.getByLabelText('날짜')).toHaveValue('2025-05-15');
      expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
      expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');
      expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');
    });
  });

  describe('일정 저장 동작', () => {
    it('필수 필드가 모두 입력된 경우 저장이 성공해야 한다', async () => {
      const { user, mockSaveEvent } = setup();

      // 필수 필드 입력
      await user.type(screen.getByLabelText('제목'), '새로운 일정');
      await user.type(screen.getByLabelText('날짜'), '2025-05-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      // 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 함수 호출 확인
      await waitFor(() => {
        expect(mockSaveEvent).toHaveBeenCalledTimes(1);
        expect(mockSaveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '새로운 일정',
            date: '2025-05-15',
            startTime: '14:00',
            endTime: '15:00',
          })
        );
      });
    });

    it('필수 필드가 누락된 경우 저장되지 않아야 한다', async () => {
      const { user, mockSaveEvent } = setup();

      // 제목을 제외한 필수 필드만 입력
      await user.type(screen.getByLabelText('날짜'), '2025-05-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');

      // 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 함수가 호출되지 않아야 함
      expect(mockSaveEvent).not.toHaveBeenCalled();
    });

    it('기존 일정을 수정하고 저장하면 수정된 데이터로 저장되어야 한다', async () => {
      const { user, mockSaveEvent } = setup({ isEditMode: true });

      // 기존 데이터가 폼에 표시되어 있는지 확인
      expect(screen.getByLabelText('제목')).toHaveValue('기존 일정');
      expect(screen.getByLabelText('날짜')).toHaveValue('2025-05-15');
      expect(screen.getByLabelText('시작 시간')).toHaveValue('09:00');
      expect(screen.getByLabelText('종료 시간')).toHaveValue('10:00');

      // 데이터 수정
      const titleInput = screen.getByLabelText('제목');
      const dateInput = screen.getByLabelText('날짜');
      const startTimeInput = screen.getByLabelText('시작 시간');
      const endTimeInput = screen.getByLabelText('종료 시간');
      const descriptionInput = screen.getByLabelText('설명');

      await user.clear(titleInput);
      await user.type(titleInput, '수정된 일정');

      await user.clear(dateInput);
      await user.type(dateInput, '2025-05-16');

      await user.clear(startTimeInput);
      await user.type(startTimeInput, '09:30');

      await user.clear(endTimeInput);
      await user.type(endTimeInput, '10:30');

      await user.clear(descriptionInput);
      await user.type(descriptionInput, '회의 내용이 수정되었습니다');

      // 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 수정된 데이터로 저장 함수가 호출되었는지 확인
      await waitFor(() => {
        expect(mockSaveEvent).toHaveBeenCalledTimes(1);
        expect(mockSaveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1', // 기존 일정의 id가 유지되어야 함
            title: '수정된 일정',
            date: '2025-05-16',
            startTime: '09:30',
            endTime: '10:30',
            description: '회의 내용이 수정되었습니다',
            repeat: {
              type: 'weekly',
              interval: 1,
              endDate: '2025-07-31',
            },
          })
        );
      });
    });

    it('수정 모드에서 필수 필드를 비우면 저장되지 않아야 한다', async () => {
      const { user, mockSaveEvent } = setup({ isEditMode: true });

      // 제목 필드를 비움
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);

      // 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 저장 함수가 호출되지 않아야 함
      expect(mockSaveEvent).not.toHaveBeenCalled();
    });
  });
});
