import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import { EventEdit, EventEditProps } from '../../components/event/edit/EventEdit';
import { categories, notificationOptions } from '../../consts';
import { Event } from '../../types';

describe('EventEdit', () => {
  const defaultProps: EventEditProps = {
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
    repeatType: 'none',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderEventEdit = (props = {}) => {
    return render(
      <ChakraProvider>
        <EventEdit {...defaultProps} {...props} />
      </ChakraProvider>
    );
  };

  it('새 일정 추가 모드에서 렌더링되어야 함', () => {
    renderEventEdit();

    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
  });

  it('일정 수정 모드에서 기존 데이터가 표시되어야 함', () => {
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

    renderEventEdit({
      title: mockEvent.title,
      date: mockEvent.date,
      startTime: mockEvent.startTime,
      endTime: mockEvent.endTime,
      description: mockEvent.description,
      location: mockEvent.location,
      category: mockEvent.category,
      isRepeating: mockEvent.repeat.type !== 'none',
      repeatType: mockEvent.repeat.type,
      repeatInterval: mockEvent.repeat.interval,
      repeatEndDate: mockEvent.repeat.endDate,
      notificationTime: mockEvent.notificationTime,
      editingEvent: mockEvent,
    });

    expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.date)).toBeInTheDocument();
  });

  it('반복 설정이 활성화되면 반복 설정 폼이 표시되어야 함', () => {
    renderEventEdit({ isRepeating: true });

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('시간 에러가 있을 때 툴팁이 표시되어야 함', () => {
    renderEventEdit({
      startTimeError: '시작 시간이 종료 시간보다 늦을 수 없습니다.',
    });

    expect(screen.getByText('시작 시간이 종료 시간보다 늦을 수 없습니다.')).toBeInTheDocument();
  });

  it('카테고리 선택이 정상적으로 동작해야 함', () => {
    renderEventEdit();

    const categorySelect = screen.getByLabelText('카테고리');
    expect(categorySelect).toBeInTheDocument();

    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('알림 시간 설정이 정상적으로 동작해야 함', () => {
    const setNotificationTime = vi.fn();

    renderEventEdit({
      setNotificationTime,
    });

    const notificationSelect = screen.getByLabelText('알림 설정');
    expect(notificationSelect).toBeInTheDocument();

    const optionValue = notificationOptions[1].value.toString();

    fireEvent.change(notificationSelect, {
      target: { value: optionValue },
    });

    expect(setNotificationTime).toHaveBeenCalledWith(Number(optionValue));
  });

  it('반복 설정이 활성화되면 반복 관련 필드들이 표시되어야 함', () => {
    renderEventEdit({ isRepeating: true });

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('입력 필드 변경 시 적절한 핸들러가 호출되어야 함', () => {
    const setTitle = vi.fn();
    const setDate = vi.fn();
    const setDescription = vi.fn();
    const setLocation = vi.fn();
    const handleStartTimeChange = vi.fn();
    const handleEndTimeChange = vi.fn();

    renderEventEdit({
      setTitle,
      setDate,
      setDescription,
      setLocation,
      handleStartTimeChange,
      handleEndTimeChange,
    });

    // 제목 입력
    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '새로운 일정' },
    });
    expect(setTitle).toHaveBeenCalledWith('새로운 일정');

    // 날짜 입력
    fireEvent.change(screen.getByLabelText('날짜'), {
      target: { value: '2025-05-16' },
    });
    expect(setDate).toHaveBeenCalledWith('2025-05-16');

    // 시작 시간 입력
    fireEvent.change(screen.getByLabelText('시작 시간'), {
      target: { value: '09:00' },
    });
    expect(handleStartTimeChange).toHaveBeenCalled();

    // 종료 시간 입력
    fireEvent.change(screen.getByLabelText('종료 시간'), {
      target: { value: '10:00' },
    });
    expect(handleEndTimeChange).toHaveBeenCalled();

    // 설명 입력
    fireEvent.change(screen.getByLabelText('설명'), {
      target: { value: '테스트 설명' },
    });
    expect(setDescription).toHaveBeenCalledWith('테스트 설명');

    // 위치 입력
    fireEvent.change(screen.getByLabelText('위치'), {
      target: { value: '테스트 장소' },
    });
    expect(setLocation).toHaveBeenCalledWith('테스트 장소');
  });

  it('저장 버튼이 정상적으로 동작해야 함', () => {
    const addOrUpdateEvent = vi.fn();

    renderEventEdit({
      addOrUpdateEvent,
    });

    const submitButton = screen.getByTestId('event-submit-button');
    fireEvent.click(submitButton);

    expect(addOrUpdateEvent).toHaveBeenCalled();
  });
});
