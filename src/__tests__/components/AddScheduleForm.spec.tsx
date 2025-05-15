import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { AddScheduleFrom } from '@/components/organisms/schedule/add-schedule-from/AddScheduleFrom';
import { DEFAULT_EVENT_FORM } from '@/constants/form';
import { RepeatInfo, ScheduleField } from '@/types';

describe('AddScheduleForm', () => {
  const mockAddOrUpdateEvent = vi.fn();
  const mockHandleOnChangeEvent = vi.fn();
  const mockSetIsRepeating = vi.fn();

  const defaultProps = {
    addOrUpdateEvent: mockAddOrUpdateEvent,
    eventForm: DEFAULT_EVENT_FORM,
    handleOnChangeEvent: mockHandleOnChangeEvent as (
      key: ScheduleField,
      value: string | number | RepeatInfo
    ) => void,
    startTimeError: null,
    endTimeError: null,
    isRepeating: false,
    setIsRepeating: mockSetIsRepeating,
    isEditEvent: false,
  };

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <AddScheduleFrom {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('제목 입력 시 handleOnChangeEvent가 호출된다', () => {
    renderComponent();

    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '새로운 미팅' } });

    expect(mockHandleOnChangeEvent).toHaveBeenCalledWith('title', '새로운 미팅');
  });

  it('날짜 입력 시 handleOnChangeEvent가 호출된다', () => {
    renderComponent();

    const dateInput = screen.getByLabelText('날짜');
    fireEvent.change(dateInput, { target: { value: '2025-06-01' } });

    expect(mockHandleOnChangeEvent).toHaveBeenCalledWith('date', '2025-06-01');
  });

  it('시작 시간 입력 시 handleOnChangeEvent가 호출된다', () => {
    renderComponent();

    const startTimeInput = screen.getByLabelText('시작 시간');
    fireEvent.change(startTimeInput, { target: { value: '13:00' } });

    expect(mockHandleOnChangeEvent).toHaveBeenCalledWith('startTime', '13:00');
  });

  it('종료 시간 입력 시 handleOnChangeEvent가 호출된다', () => {
    renderComponent();

    const endTimeInput = screen.getByLabelText('종료 시간');
    fireEvent.change(endTimeInput, { target: { value: '14:30' } });

    expect(mockHandleOnChangeEvent).toHaveBeenCalledWith('endTime', '14:30');
  });

  it('카테고리 선택 시 handleOnChangeEvent가 호출된다', () => {
    renderComponent();

    const categorySelect = screen.getByLabelText('카테고리');
    fireEvent.change(categorySelect, { target: { value: '업무' } });

    expect(mockHandleOnChangeEvent).toHaveBeenCalledWith('category', '업무');
  });

  it('반복 설정 체크박스를 클릭하면 setIsRepeating이 호출된다', () => {
    renderComponent();

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    fireEvent.click(repeatCheckbox);

    expect(mockSetIsRepeating).toHaveBeenCalledWith(true);
    expect(mockHandleOnChangeEvent).toHaveBeenCalled();
  });

  it('isRepeating이 true일 때 RepeatForm이 렌더링된다', () => {
    renderComponent({ isRepeating: true });

    // 반복 유형 라벨과 셀렉트 박스를 확인
    const repeatTypeLabel = screen.getByLabelText('반복 유형');
    expect(repeatTypeLabel).toBeInTheDocument();

    // 셀렉트 박스 내에 '매일' 옵션이 있는지 확인
    const dailyOption = screen.getByRole('option', { name: '매일' });
    expect(dailyOption).toBeInTheDocument();
    expect(dailyOption).toHaveValue('daily');
  });

  it('일정 추가 버튼 클릭 시 addOrUpdateEvent가 호출된다', () => {
    renderComponent();

    const submitButton = screen.getByTestId('event-submit-button');
    fireEvent.click(submitButton);

    expect(mockAddOrUpdateEvent).toHaveBeenCalled();
  });

  it('isEditEvent가 true일 때 버튼 텍스트가 "일정 수정"으로 표시된다', () => {
    renderComponent({ isEditEvent: true });

    const submitButton = screen.getByTestId('event-submit-button');
    expect(submitButton).toHaveTextContent('일정 수정');
  });

  it('startTimeError가 있을 때 시작 시간 입력에 에러가 표시된다', () => {
    renderComponent({ startTimeError: '시작 시간 에러 메시지' });

    const startTimeInput = screen.getByLabelText('시작 시간');
    expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('endTimeError가 있을 때 종료 시간 입력에 에러가 표시된다', () => {
    renderComponent({ endTimeError: '종료 시간 에러 메시지' });

    const endTimeInput = screen.getByLabelText('종료 시간');
    expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
  });
});
