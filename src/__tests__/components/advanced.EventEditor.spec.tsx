import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import EventEditor from '../../components/form/EventForm';
import { RepeatType } from '../../types';

const mockFn = () => vi.fn();

const renderComponent = (children: React.ReactElement) => {
  return render(<ChakraProvider>{children}</ChakraProvider>);
};

const defaultProps = {
  title: '',
  setTitle: mockFn(),
  date: '2025-05-04',
  setDate: mockFn(),
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  setDescription: mockFn(),
  location: '',
  setLocation: mockFn(),
  category: '',
  setCategory: mockFn(),
  isRepeating: false,
  setIsRepeating: mockFn(),
  repeatType: 'daily' as RepeatType,
  setRepeatType: mockFn(),
  repeatInterval: 1,
  setRepeatInterval: mockFn(),
  repeatEndDate: '',
  setRepeatEndDate: mockFn(),
  notificationTime: 10,
  setNotificationTime: mockFn(),
  startTimeError: null,
  endTimeError: null,
  editingEvent: null,
  handleStartTimeChange: mockFn(),
  handleEndTimeChange: mockFn(),
  addOrUpdateEvent: mockFn(),
  categories: ['업무', '개인', '가족', '기타'],
  notificationOptions: [
    { value: 1, label: '1분 전' },
    { value: 10, label: '10분 전' },
    { value: 60, label: '1시간 전' },
  ],
};

describe('EventEditor 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('기본 렌더링이 되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();

    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 추가');

    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('날짜')).toBeInTheDocument();
    expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
    expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
  });

  it('편집 모드일 때 헤더와 버튼이 변경되어야 한다', () => {
    const editingProps = {
      ...defaultProps,
      editingEvent: {
        id: '1',
        title: '회의',
        date: '2025-05-04',
        startTime: '10:00',
        endTime: '11:00',
        description: '중요 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none' as RepeatType, interval: 0 },
        notificationTime: 10,
      },
    };

    renderComponent(<EventEditor {...editingProps} />);

    expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
    expect(screen.getByTestId('event-submit-button')).toHaveTextContent('일정 수정');
  });

  it('제목 입력 시 setTitle이 호출되어야 한다', async () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const titleInput = screen.getByLabelText('제목');
    await userEvent.type(titleInput, '새 회의');

    expect(defaultProps.setTitle).toHaveBeenCalledTimes('새 회의'.length);
  });

  it('날짜 변경 시 setDate가 호출되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const dateInput = screen.getByLabelText('날짜');
    fireEvent.change(dateInput, { target: { value: '2025-05-10' } });

    expect(defaultProps.setDate).toHaveBeenCalledWith('2025-05-10');
  });

  it('시작 시간 변경 시 handleStartTimeChange가 호출되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const startTimeInput = screen.getByLabelText('시작 시간');
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });

    expect(defaultProps.handleStartTimeChange).toHaveBeenCalled();
  });

  it('종료 시간 변경 시 handleEndTimeChange가 호출되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const endTimeInput = screen.getByLabelText('종료 시간');
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });

    expect(defaultProps.handleEndTimeChange).toHaveBeenCalled();
  });

  it('카테고리 선택 시 setCategory가 호출되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const categorySelect = screen.getByLabelText('카테고리');
    fireEvent.change(categorySelect, { target: { value: '업무' } });

    expect(defaultProps.setCategory).toHaveBeenCalledWith('업무');
  });

  it('반복 일정 체크박스 클릭 시 setIsRepeating이 호출되어야 한다', async () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const repeatCheckbox = screen.getByLabelText('반복 일정');
    await userEvent.click(repeatCheckbox);

    expect(defaultProps.setIsRepeating).toHaveBeenCalledWith(true);
  });

  it('반복 설정이 활성화 되면 반복 유형 옵션이 표시되어야 한다', () => {
    const repeatingProps = {
      ...defaultProps,
      isRepeating: true,
    };

    renderComponent(<EventEditor {...repeatingProps} />);

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 유형 변경 시 setRepeatType이 호출되어야 한다', () => {
    const repeatingProps = {
      ...defaultProps,
      isRepeating: true,
    };

    renderComponent(<EventEditor {...repeatingProps} />);

    const repeatTypeSelect = screen.getByLabelText('반복 유형');
    fireEvent.change(repeatTypeSelect, { target: { value: 'weekly' } });

    expect(defaultProps.setRepeatType).toHaveBeenCalledWith('weekly');
  });

  it('반복 간격 변경 시 setRepeatInterval이 호출되어야 한다', () => {
    const repeatingProps = {
      ...defaultProps,
      isRepeating: true,
    };

    renderComponent(<EventEditor {...repeatingProps} />);

    const repeatIntervalInput = screen.getByLabelText('반복 간격');
    fireEvent.change(repeatIntervalInput, { target: { value: '2' } });

    expect(defaultProps.setRepeatInterval).toHaveBeenCalledWith(2);
  });

  it('알림 설정 변경 시 setNotificationTime이 호출되어야 한다', () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const notificationSelect = screen.getByLabelText('알림 설정');
    fireEvent.change(notificationSelect, { target: { value: '60' } });

    expect(defaultProps.setNotificationTime).toHaveBeenCalledWith(60);
  });

  it('시간 에러가 있을 때 오류 메시지가 표시되어야 한다', () => {
    const errorProps = {
      ...defaultProps,
      startTimeError: '시작 시간이 종료 시간보다 늦을 수 없습니다',
    };

    renderComponent(<EventEditor {...errorProps} />);

    expect(screen.getByText('시작 시간이 종료 시간보다 늦을 수 없습니다')).toBeInTheDocument();
  });

  it('저장 버튼 클릭 시 addOrUpdateEvent가 호출되어야 한다', async () => {
    renderComponent(<EventEditor {...defaultProps} />);

    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    expect(defaultProps.addOrUpdateEvent).toHaveBeenCalled();
  });
});
