import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import * as ScheduleFormContext from '../../../modules/schedule/model/ScheduleFormContext';
import ScheduleRepeatAlarmForm from '../../../modules/schedule/ui/ScheduleRepeatAlarmForm';
describe('일정 반복 작성 양식 (ScheduleRepeatAlarmForm)', () => {
  const mockSetRepeatType = vi.fn();
  const mockSetRepeatInterval = vi.fn();
  const mockSetRepeatEndDate = vi.fn();

  beforeEach(() => {
    vi.spyOn(ScheduleFormContext, 'useScheduleFormContext').mockReturnValue({
      category: '',
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 0,
      repeatEndDate: '',
      notificationTime: 0,
      startTimeError: null,
      endTimeError: null,
      editingEvent: null,
      setCategory: vi.fn(),
      setTitle: vi.fn(),
      setDate: vi.fn(),
      setStartTime: vi.fn(),
      setEndTime: vi.fn(),
      setDescription: vi.fn(),
      setLocation: vi.fn(),
      setIsRepeating: vi.fn(),
      setRepeatType: mockSetRepeatType,
      setRepeatInterval: mockSetRepeatInterval,
      setRepeatEndDate: mockSetRepeatEndDate,
      setNotificationTime: vi.fn(),
      setEditingEvent: vi.fn(),
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      resetForm: vi.fn(),
      editEvent: vi.fn(),
    });
  });

  const renderScheduleRepeatAlarmForm = () => {
    return render(
      <ChakraProvider>
        <ScheduleRepeatAlarmForm />
      </ChakraProvider>
    );
  };

  it('모든 폼 요소(반복 유형, 반복 간격, 반복 종료일) 렌더링된다', () => {
    renderScheduleRepeatAlarmForm();

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 유형 Select에 모든 옵션이 있다', () => {
    renderScheduleRepeatAlarmForm();
    const options = screen.getAllByRole('option');
    const expectedOptions = [
      { value: 'daily', text: '매일' },
      { value: 'weekly', text: '매주' },
      { value: 'monthly', text: '매월' },
      { value: 'yearly', text: '매년' },
    ];

    options.forEach((option, index) => {
      expect(option).toHaveValue(expectedOptions[index].value);
      expect(option).toHaveTextContent(expectedOptions[index].text);
    });
    expect(options).toHaveLength(4);
  });

  it('반복 간격 변경시 setRepeatInterval이 호출된다', () => {
    renderScheduleRepeatAlarmForm();
    const input = screen.getByLabelText('반복 간격');

    fireEvent.change(input, { target: { value: '2' } });

    expect(mockSetRepeatInterval).toHaveBeenCalledWith(2);
  });

  it('반복 종료일 변경시 setRepeatEndDate가 호출된다', () => {
    renderScheduleRepeatAlarmForm();

    const input = screen.getByLabelText('반복 종료일');
    fireEvent.change(input, { target: { value: '2026-01-01' } });

    expect(mockSetRepeatEndDate).toHaveBeenCalledWith('2026-01-01');
  });
});
