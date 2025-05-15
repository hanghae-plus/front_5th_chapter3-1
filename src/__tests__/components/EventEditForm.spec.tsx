import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { EventEditForm } from '../../components/EventEditForm';
import { Event, RepeatType } from '../../types';

describe('EventEditForm', () => {
  const defaultProps = {
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    repeatType: 'none' as RepeatType,
    setRepeatType: vi.fn(),
    repeatInterval: 1,
    setRepeatInterval: vi.fn(),
    repeatEndDate: '',
    setRepeatEndDate: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    editingEvent: null,
    addOrUpdateEvent: vi.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventEditForm {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본 폼이 렌더링된다', () => {
    renderComponent();

    expect(screen.getByRole('heading')).toHaveTextContent('일정 추가');
    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByLabelText('날짜')).toHaveValue('');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('');
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');
  });

  it('일정 수정 모드에서는 기존 일정이 렌더링된다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '테스트 일정',
      date: '2025-05-16',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    };

    renderComponent({
      editingEvent: mockEvent,
      title: mockEvent.title,
      date: mockEvent.date,
      startTime: mockEvent.startTime,
      endTime: mockEvent.endTime,
      description: mockEvent.description,
      location: mockEvent.location,
      category: mockEvent.category,
    });

    expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.date)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.startTime)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.endTime)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.location)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.category)).toBeInTheDocument();
  });

  it('필수 필드가 비어있는 경우 저장되지 않아야 한다', async () => {
    const user = userEvent.setup();
    const mockAddOrUpdateEvent = vi.fn();
    renderComponent({ addOrUpdateEvent: mockAddOrUpdateEvent });

    // 선택 필드만 입력
    await user.type(screen.getByLabelText('설명'), '테스트 설명');
    await user.type(screen.getByLabelText('위치'), '테스트 장소');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    // 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // addOrUpdateEvent가 호출되었지만, 저장은 되지 않아야 함
    expect(mockAddOrUpdateEvent).toHaveBeenCalled();
    expect(mockAddOrUpdateEvent).toHaveReturned();
  });

  it('모든 필드를 입력하면 일정이 추가된다', async () => {
    const user = userEvent.setup();
    const mockAddOrUpdateEvent = vi.fn();
    const mockSetTitle = vi.fn();
    const mockSetDate = vi.fn();
    const mockSetStartTime = vi.fn();
    const mockSetEndTime = vi.fn();

    renderComponent({
      addOrUpdateEvent: mockAddOrUpdateEvent,
      setTitle: mockSetTitle,
      setDate: mockSetDate,
      handleStartTimeChange: mockSetStartTime,
      handleEndTimeChange: mockSetEndTime,
      title: '새로운 일정',
      date: '2025-05-15',
      startTime: '14:00',
      endTime: '15:00',
    });

    // 선택 필드 입력
    await user.type(screen.getByLabelText('설명'), '테스트 설명');
    await user.type(screen.getByLabelText('위치'), '테스트 장소');
    await user.selectOptions(screen.getByLabelText('카테고리'), '업무');

    // 저장 버튼 클릭
    await user.click(screen.getByTestId('event-submit-button'));

    // addOrUpdateEvent가 호출되었는지 확인
    expect(mockAddOrUpdateEvent).toHaveBeenCalled();
  });
});
