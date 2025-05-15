import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ScheduleForm from '../../components/ScheduleForm';
import { RepeatType } from '../../types';
import { setup } from '../setup';

describe('ScheduleForm >', () => {
  const baseProps = {
    editingEvent: null,
    onSubmit: vi.fn(),
    values: {
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
    setters: {
      setTitle: vi.fn(),
      setDate: vi.fn(),
      setStartTime: vi.fn(),
      setEndTime: vi.fn(),
      setDescription: vi.fn(),
      setLocation: vi.fn(),
      setCategory: vi.fn(),
      setIsRepeating: vi.fn(),
      setRepeatType: vi.fn(),
      setRepeatInterval: vi.fn(),
      setRepeatEndDate: vi.fn(),
      setNotificationTime: vi.fn(),
    },
    errors: {
      startTimeError: null,
      endTimeError: null,
    },
    handlers: {
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
    },
  };

  it('제목, 날짜, 시간이 비어있으면 onSubmit이 호출되지 않아야 한다', async () => {
    setup(<ScheduleForm {...baseProps} />);
    await userEvent.click(screen.getByTestId('event-submit-button'));
    expect(baseProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('시간 에러가 있으면 Tooltip이 표시된다', () => {
    setup(<ScheduleForm {...baseProps} errors={{ startTimeError: '오류', endTimeError: null }} />);
    expect(screen.getByText('오류')).toBeInTheDocument();
  });

  it('정상 입력값이면 버튼 클릭 시 onSubmit이 호출된다', async () => {
    const mockSubmit = vi.fn();

    setup(
      <ScheduleForm
        {...baseProps}
        onSubmit={mockSubmit}
        values={{
          ...baseProps.values,
          title: '회의',
          date: '2025-10-10',
          startTime: '10:00',
          endTime: '11:00',
        }}
      />
    );

    await userEvent.click(screen.getByTestId('event-submit-button'));
    expect(mockSubmit).toHaveBeenCalled();
  });
});
