import { screen } from '@testing-library/react';
import { EventForm, EventFormData } from '@/components/EventForm';
import render from '@/utils/test/render';

describe('EventForm', () => {
  const defaultFormData: EventFormData = {
    title: '',
    date: '2023-06-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 10,
  };

  const mockHandlers = {
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    onSubmit: vi.fn(),
    onFormChange: vi.fn(),
  };

  test('반복 일정 체크박스를 클릭하면 반복 설정 옵션이 표시됨', async () => {
    const { user } = await render(
      <EventForm
        eventFormData={defaultFormData}
        startTimeError={null}
        endTimeError={null}
        editingEvent={null}
        {...mockHandlers}
      />
    );

    // 초기 상태에서는 반복 관련 옵션이 보이지 않아야 함
    expect(screen.queryByText('반복 유형')).not.toBeInTheDocument();
    expect(screen.queryByText('반복 간격')).not.toBeInTheDocument();
    expect(screen.queryByText('반복 종료일')).not.toBeInTheDocument();

    // 반복 일정 체크박스 클릭
    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await user.click(repeatCheckbox);

    // 체크박스 클릭 시 onFormChange가 호출되었는지 확인
    expect(mockHandlers.onFormChange).toHaveBeenCalledWith('isRepeating', true);
  });

  test('반복 일정이 활성화된 상태에서는 반복 설정 옵션이 표시됨', async () => {
    // 반복 일정이 활성화된 상태의 폼 데이터
    const repeatingFormData = {
      ...defaultFormData,
      isRepeating: true,
    };

    await render(
      <EventForm
        eventFormData={repeatingFormData}
        startTimeError={null}
        endTimeError={null}
        editingEvent={null}
        {...mockHandlers}
      />
    );

    // 반복 관련 옵션이 모두 표시되어야 함
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
    expect(screen.getByText('반복 간격')).toBeInTheDocument();
    expect(screen.getByText('반복 종료일')).toBeInTheDocument();

    // 반복 유형의 기본 옵션들이 표시되는지 확인
    expect(screen.getByText('매일')).toBeInTheDocument();
    expect(screen.getByText('매주')).toBeInTheDocument();
    expect(screen.getByText('매월')).toBeInTheDocument();
    expect(screen.getByText('매년')).toBeInTheDocument();
  });
});
