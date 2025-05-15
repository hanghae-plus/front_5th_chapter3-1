import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import ScheduleCategorySelectForm from '../../../features/schedule/ui/ScheduleCategorySelectForm';
import { ScheduleFormProvider } from '../../../modules/schedule/model/ScheduleFormContext';
import * as ScheduleFormContext from '../../../modules/schedule/model/ScheduleFormContext';
describe('카테고리 선택 입력 폼 (ScheduleCategorySelectForm)', () => {
  const mockSetCategory = vi.fn();

  beforeEach(() => {
    vi.spyOn(ScheduleFormContext, 'useScheduleFormContext').mockReturnValue({
      category: '',
      setCategory: mockSetCategory,
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
      setTitle: vi.fn(),
      setDate: vi.fn(),
      setStartTime: vi.fn(),
      setEndTime: vi.fn(),
      setDescription: vi.fn(),
      setLocation: vi.fn(),
      setIsRepeating: vi.fn(),
      setRepeatType: vi.fn(),
      setRepeatInterval: vi.fn(),
      setRepeatEndDate: vi.fn(),
      setNotificationTime: vi.fn(),
      setEditingEvent: vi.fn(),
      handleStartTimeChange: vi.fn(),
      handleEndTimeChange: vi.fn(),
      resetForm: vi.fn(),
      editEvent: vi.fn(),
    });
  });

  const renderScheduleCategorySelectForm = () => {
    return render(
      <ChakraProvider>
        <ScheduleFormProvider>
          <ScheduleCategorySelectForm />
        </ScheduleFormProvider>
      </ChakraProvider>
    );
  };

  it('카테고리 선택 폼이 렌더링된다', () => {
    renderScheduleCategorySelectForm();

    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('모든 카테고리 옵션이 표시된다', () => {
    renderScheduleCategorySelectForm();
    const categories = ['업무', '개인', '가족', '기타'];
    const options = screen.getAllByRole('option');

    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });

    expect(screen.getByText('카테고리 선택')).toBeInTheDocument();
    expect(options).toHaveLength(categories.length + 1);
  });

  it('카테고리 변경시 setCategory가 호출된다', () => {
    renderScheduleCategorySelectForm();
    const select = screen.getByRole('combobox');
    const categories = ['업무', '개인', '가족', '기타'];
    const newCategory = categories[0];

    fireEvent.change(select, { target: { value: newCategory } });

    expect(mockSetCategory).toHaveBeenCalledWith(newCategory);
    expect(mockSetCategory).toHaveBeenCalledTimes(1);
  });
});
