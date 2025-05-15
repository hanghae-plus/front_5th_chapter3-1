// ScheduleEventForm.spec.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';

import ScheduleEventForm from '@/entities/eventForm/ui/ScheduleEventForm';
import { RepeatType } from '@/types';

describe('ScheduleEventForm 컴포넌트', () => {
  const mockSet = vi.fn();

  const mockFormState = {
    title: '',
    setTitle: mockSet,
    date: '',
    setDate: mockSet,
    startTime: '',
    endTime: '',
    startTimeError: null,
    endTimeError: null,
    handleStartTimeChange: mockSet,
    handleEndTimeChange: mockSet,
    description: '',
    setDescription: mockSet,
    location: '',
    setLocation: mockSet,
    category: '',
    setCategory: mockSet,
    isRepeating: false,
    setIsRepeating: mockSet,
    repeatType: 'daily' as RepeatType,
    setRepeatType: mockSet,
    repeatInterval: 1,
    setRepeatInterval: mockSet,
    repeatEndDate: '',
    setRepeatEndDate: mockSet,
    notificationTime: 0,
    setNotificationTime: mockSet,
    editingEvent: null,
  };

  const mockSubmit = vi.fn();

  const notificationOptions = [
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
  ];

  const renderWithProvider = () =>
    render(
      <ChakraProvider>
        <ScheduleEventForm
          formState={mockFormState}
          onSubmit={mockSubmit}
          notificationOptions={notificationOptions}
        />
      </ChakraProvider>
    );

  it('제목 입력 필드와 제출 버튼이 렌더링 되는지 확인', () => {
    renderWithProvider();

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByTestId('event-submit-button')).toBeInTheDocument();
  });

  it('제출 버튼 클릭 시 onSubmit 함수가 호출되는지 확인', () => {
    renderWithProvider();

    const button = screen.getByTestId('event-submit-button');
    fireEvent.click(button);
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('반복 설정 체크박스가 잘 렌더링 되는지 확인', () => {
    renderWithProvider();

    expect(screen.getByText('반복 일정')).toBeInTheDocument();
  });
});
