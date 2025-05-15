// ScheduleEventForm.spec.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { RepeatType } from '../../entities/event/model/types';
import { EventFormView } from '../../features/events-form/ui/EventForm';

const baseProps = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  notificationTime: 10,
  repeatType: 'daily' as RepeatType,
  repeatInterval: 1,
  repeatEndDate: '',
  isRepeating: false,
  editingEvent: null,
  startTimeError: '',
  endTimeError: '',
  setTitle: vi.fn(),
  setDate: vi.fn(),
  setDescription: vi.fn(),
  setLocation: vi.fn(),
  setCategory: vi.fn(),
  setIsRepeating: vi.fn(),
  setNotificationTime: vi.fn(),
  setRepeatType: vi.fn(),
  setRepeatInterval: vi.fn(),
  setRepeatEndDate: vi.fn(),
  handleStartTimeChange: vi.fn(),
  handleEndTimeChange: vi.fn(),
  addOrUpdateEvent: vi.fn(),
};

const renderWithProvider = () =>
  render(
    <ChakraProvider>
      <EventFormView {...baseProps} />
    </ChakraProvider>
  );

describe('EventFormView 컴포넌트', () => {
  test('제목, 날짜, 시간 등의 입력 필드가 화면에 보여야 한다', () => {
    renderWithProvider();

    expect(screen.getByLabelText(/제목/)).toBeInTheDocument();
    expect(screen.getByLabelText(/날짜/)).toBeInTheDocument();
    expect(screen.getByLabelText(/시작 시간/)).toBeInTheDocument();
    expect(screen.getByLabelText(/종료 시간/)).toBeInTheDocument();
    expect(screen.getByLabelText(/설명/)).toBeInTheDocument();
    expect(screen.getByLabelText(/위치/)).toBeInTheDocument();
    expect(screen.getByLabelText(/카테고리/)).toBeInTheDocument();
    expect(screen.getByLabelText(/알림 설정/)).toBeInTheDocument();
  });

  test('일정 추가 버튼을 클릭하면 addOrUpdateEvent 함수가 호출되어야 한다', () => {
    renderWithProvider();
    const button = screen.getByRole('button', { name: /일정 추가/ });
    fireEvent.click(button);
    expect(baseProps.addOrUpdateEvent).toHaveBeenCalled();
  });

  test('입력값 변경 시 setter 함수가 호출되어야 한다', () => {
    renderWithProvider();

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '테스트 일정' } });
    expect(baseProps.setTitle).toHaveBeenCalledWith('테스트 일정');

    fireEvent.change(screen.getByLabelText(/날짜/), { target: { value: '2025-05-16' } });
    expect(baseProps.setDate).toHaveBeenCalledWith('2025-05-16');
  });
});
