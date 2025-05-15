import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

import EventFormComponent from '../../components/EventForm';
import { CATEGORIES, NOTIFICATION_OPTIONS } from '../../constants';
import { useEventFormContext, EventFormProvider } from '../../contexts/event-form-context';
import { useEventForm } from '../../hooks/useEventForm';
import { Event, EventFormState, RepeatType } from '../../types';

// Mocks
vi.mock('../../contexts/event-form-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/event-form-context')>();
  return {
    ...actual,
    useEventFormContext: vi.fn(),
  };
});

vi.mock('../../hooks/useEventForm', () => ({
  useEventForm: vi.fn(),
}));

const mockSetEventForm = vi.fn();
const mockHandleStartTimeChange = vi.fn();
const mockHandleEndTimeChange = vi.fn();
const mockAddOrUpdateEvent = vi.fn();
const mockSaveEvent = vi.fn().mockResolvedValue(undefined);
const mockCheckOverlap = vi.fn().mockReturnValue(false);

const initialEventFormState: EventFormState = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  isRepeating: false,
  repeatType: 'daily' as RepeatType,
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: NOTIFICATION_OPTIONS.find((opt) => opt.label === '없음')?.value ?? 0,
};

const mockEvents: Event[] = [];

const mapEventToEventFormState = (event: Event): EventFormState => {
  return {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    description: event.description,
    location: event.location,
    category: event.category,
    isRepeating: event.repeat.type !== 'none',
    repeatType: event.repeat.type === 'none' ? 'daily' : event.repeat.type,
    repeatInterval: event.repeat.interval,
    repeatEndDate: event.repeat.endDate || '',
    notificationTime: event.notificationTime,
  };
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChakraProvider>
      <EventFormProvider>{children}</EventFormProvider>
    </ChakraProvider>
  );
};

const renderEventForm = (ui: React.ReactNode, options?: RenderOptions) => {
  return render(ui, { wrapper: Providers, ...options });
};

describe('EventForm Component Test', () => {
  beforeEach(() => {
    (useEventFormContext as Mock).mockReturnValue({
      eventForm: { ...initialEventFormState },
      setEventForm: mockSetEventForm,
      editingEvent: null,
      startTimeError: null,
      endTimeError: null,
    });
    (useEventForm as Mock).mockReturnValue({
      handleStartTimeChange: mockHandleStartTimeChange,
      handleEndTimeChange: mockHandleEndTimeChange,
      addOrUpdateEvent: mockAddOrUpdateEvent,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    editingEventDataInput: Event | null = null,
    startTimeError: string | null = null,
    endTimeError: string | null = null
  ) => {
    let currentEventFormState = { ...initialEventFormState };
    if (editingEventDataInput) {
      currentEventFormState = mapEventToEventFormState(editingEventDataInput);
    }
    (useEventFormContext as Mock).mockReturnValue({
      eventForm: currentEventFormState,
      setEventForm: mockSetEventForm,
      editingEvent: editingEventDataInput,
      startTimeError,
      endTimeError,
    });

    return renderEventForm(
      <EventFormComponent
        events={mockEvents}
        saveEvent={mockSaveEvent}
        checkOverlap={mockCheckOverlap}
      />
    );
  };

  describe('렌더링', () => {
    it('기본 UI 요소들이 올바르게 렌더링되어야 한다.', () => {
      renderComponent();
      expect(screen.getByRole('heading', { name: '일정 추가' })).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
      expect(screen.getByLabelText('날짜')).toBeInTheDocument();
      expect(screen.getByLabelText('시작 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 시간')).toBeInTheDocument();
      expect(screen.getByLabelText('설명')).toBeInTheDocument();
      expect(screen.getByLabelText('위치')).toBeInTheDocument();
      expect(screen.getByLabelText('카테고리')).toBeInTheDocument();
      expect(screen.getByLabelText('알림 설정')).toBeInTheDocument();
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument();
    });

    it('수정 모드일 때 UI가 올바르게 표시되고, 일정 수정 버튼 클릭 시 addOrUpdateEvent가 호출되어야 한다.', async () => {
      const editingEventData: Event = {
        id: '1',
        title: '기존 일정',
        date: '2024-07-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 설명',
        location: '기존 위치',
        category: CATEGORIES[1],
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };
      renderComponent(editingEventData);

      expect(screen.getByRole('heading', { name: '일정 수정' })).toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toHaveValue(editingEventData.title);

      const submitButton = screen.getByRole('button', { name: '일정 수정' });
      await userEvent.click(submitButton);
      expect(mockAddOrUpdateEvent).toHaveBeenCalledWith(
        mockEvents,
        mockSaveEvent,
        mockCheckOverlap
      );
    });

    it('시작 시간에 에러가 있을 경우 툴팁이 표시되어야 한다.', () => {
      const errorMessage = '시작 시간은 종료 시간보다 빨라야 합니다.';
      renderComponent(null, errorMessage, null);

      const startTimeInput = screen.getByLabelText('시작 시간');
      expect(startTimeInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('종료 시간에 에러가 있을 경우 툴팁이 표시되어야 한다.', () => {
      const errorMessage = '종료 시간은 시작 시간보다 늦어야 합니다.';
      renderComponent(null, null, errorMessage);

      const endTimeInput = screen.getByLabelText('종료 시간');
      expect(endTimeInput).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('제목 입력 시 setEventForm이 호출되고 제목이 입력되어야 한다.', () => {
      renderComponent();
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      const date = '2024-07-30';
      fireEvent.change(dateInput, { target: { value: date } });

      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ ...initialEventFormState, date })
      );
    });

    it('날짜 입력 시 setEventForm이 호출되고 날짜가 변경되어야 한다.', () => {
      renderComponent();
      const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
      fireEvent.change(dateInput, { target: { value: '2024-07-30' } });
      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2024-07-30' })
      );
    });

    it('시작 시간 변경 시 handleStartTimeChange가 호출되고 시작 시간이 변경되어야 한다.', async () => {
      renderComponent();
      const startTimeInput = screen.getByLabelText('시작 시간');
      await userEvent.type(startTimeInput, '10:00');
      expect(mockHandleStartTimeChange).toHaveBeenCalled();
    });

    it('종료 시간 변경 시 handleEndTimeChange가 호출되고 종료 시간이 변경되어야 한다.', async () => {
      renderComponent();
      const endTimeInput = screen.getByLabelText('종료 시간');
      await userEvent.type(endTimeInput, '11:00');
      expect(mockHandleEndTimeChange).toHaveBeenCalled();
    });

    it('설명 입력 시 setEventForm이 호출되고 설명이 입력되어야 한다.', () => {
      renderComponent();
      const descriptionInput = screen.getByLabelText('설명');
      fireEvent.change(descriptionInput, { target: { value: '회의 준비' } });
      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ description: '회의 준비' })
      );
    });

    it('위치 입력 시 setEventForm이 호출되고 위치가 입력되어야 한다.', () => {
      renderComponent();
      const locationInput = screen.getByLabelText('위치');
      fireEvent.change(locationInput, { target: { value: '회의실 A' } });
      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ location: '회의실 A' })
      );
    });

    it('카테고리 선택 시 setEventForm이 호출되어야 합니다', async () => {
      renderComponent();
      const categorySelect = screen.getByLabelText('카테고리');
      await userEvent.selectOptions(categorySelect, CATEGORIES[0]);
      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ category: CATEGORIES[0] })
      );
    });

    it('알림 설정 변경 시 setEventForm이 호출되어야 합니다', async () => {
      renderComponent();
      const notificationSelect = screen.getByLabelText('알림 설정');
      const optionToSelect = NOTIFICATION_OPTIONS.find((opt) => opt.label === '10분 전');
      if (!optionToSelect) throw new Error('Notification option not found for "10분 전"');

      await userEvent.selectOptions(notificationSelect, optionToSelect.value.toString());
      expect(mockSetEventForm).toHaveBeenCalledWith(
        expect.objectContaining({ notificationTime: optionToSelect.value })
      );
    });

    describe('반복 설정', () => {
      it('반복 일정 체크박스 클릭 시 isRepeating 상태가 변경되고 관련 UI가 토글되어야 한다.', async () => {
        const { rerender } = renderComponent();

        const repeatCheckbox1 = screen.getByTestId('repeat-checkbox');
        expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
        await userEvent.click(repeatCheckbox1);
        expect(mockSetEventForm).toHaveBeenCalledWith(
          expect.objectContaining({ isRepeating: true })
        );

        (useEventFormContext as Mock).mockReturnValue({
          eventForm: { ...initialEventFormState, isRepeating: true },
          setEventForm: mockSetEventForm,
          editingEvent: null,
          startTimeError: null,
          endTimeError: null,
        });
        rerender(
          <EventFormComponent
            events={mockEvents}
            saveEvent={mockSaveEvent}
            checkOverlap={mockCheckOverlap}
          />
        );

        expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
        expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
        expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();

        const repeatCheckbox2 = screen.getByTestId('repeat-checkbox');
        await userEvent.click(repeatCheckbox2);
        expect(mockSetEventForm).toHaveBeenCalledWith(
          expect.objectContaining({ isRepeating: false })
        );

        (useEventFormContext as Mock).mockReturnValue({
          eventForm: { ...initialEventFormState, isRepeating: false },
          setEventForm: mockSetEventForm,
          editingEvent: null,
          startTimeError: null,
          endTimeError: null,
        });
        rerender(
          <EventFormComponent
            events={mockEvents}
            saveEvent={mockSaveEvent}
            checkOverlap={mockCheckOverlap}
          />
        );
        expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
      });

      it('반복 유형 변경 시 setEventForm이 호출되고 유형이 선택되어야 한다.', async () => {
        const { rerender } = renderComponent(null);
        const repeatCheckbox = screen.getByTestId('repeat-checkbox');
        await userEvent.click(repeatCheckbox);

        (useEventFormContext as Mock).mockReturnValue({
          eventForm: { ...initialEventFormState, isRepeating: true },
          setEventForm: mockSetEventForm,
          editingEvent: null,
          startTimeError: null,
          endTimeError: null,
        });

        rerender(
          <EventFormComponent
            events={mockEvents}
            saveEvent={mockSaveEvent}
            checkOverlap={mockCheckOverlap}
          />
        );

        const repeatTypeSelect = screen.getByLabelText('반복 유형');
        await userEvent.selectOptions(repeatTypeSelect, 'weekly');
        expect(mockSetEventForm).toHaveBeenCalledWith(
          expect.objectContaining({ repeatType: 'weekly' as RepeatType })
        );
      });

      it('반복 간격 변경 시 setEventForm이 호출되고 반복 간격이 입력되어야 한다.', async () => {
        const { rerender } = renderComponent(null);

        const repeatCheckbox = screen.getByTestId('repeat-checkbox');
        await userEvent.click(repeatCheckbox);

        (useEventFormContext as Mock).mockReturnValue({
          eventForm: { ...initialEventFormState, isRepeating: true },
          setEventForm: mockSetEventForm,
          editingEvent: null,
          startTimeError: null,
          endTimeError: null,
        });

        rerender(
          <EventFormComponent
            events={mockEvents}
            saveEvent={mockSaveEvent}
            checkOverlap={mockCheckOverlap}
          />
        );

        const repeatIntervalInput = screen.getByLabelText('반복 간격');
        fireEvent.change(repeatIntervalInput, { target: { value: '7' } });
        expect(mockSetEventForm).toHaveBeenCalledWith(
          expect.objectContaining({ repeatInterval: 7 })
        );
      });

      it('반복 종료일 변경 시 setEventForm이 호출되고 날짜가 변경되어야 한다.', async () => {
        const { rerender } = renderComponent(null);

        const repeatCheckbox = screen.getByTestId('repeat-checkbox');
        await userEvent.click(repeatCheckbox);

        (useEventFormContext as Mock).mockReturnValue({
          eventForm: { ...initialEventFormState, isRepeating: true },
          setEventForm: mockSetEventForm,
          editingEvent: null,
          startTimeError: null,
          endTimeError: null,
        });

        rerender(
          <EventFormComponent
            events={mockEvents}
            saveEvent={mockSaveEvent}
            checkOverlap={mockCheckOverlap}
          />
        );

        const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;
        fireEvent.change(repeatEndDateInput, { target: { value: '2024-12-31' } });
        expect(mockSetEventForm).toHaveBeenCalledWith(
          expect.objectContaining({ repeatEndDate: '2024-12-31' })
        );
      });
    });

    it('일정 추가 버튼 클릭 시 addOrUpdateEvent가 호출되어야 한다.', async () => {
      renderComponent();
      const submitButton = screen.getByRole('button', { name: '일정 추가' });
      await userEvent.click(submitButton);
      expect(mockAddOrUpdateEvent).toHaveBeenCalledWith(
        mockEvents,
        mockSaveEvent,
        mockCheckOverlap
      );
    });
  });
});
