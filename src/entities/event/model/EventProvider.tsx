import { useToast } from '@chakra-ui/react';
import React, { ReactNode, useState, useCallback, useEffect } from 'react';

import { findOverlappingEvents } from '@/entities/event/lib/eventOverlap';
import { getTimeErrorMessage } from '@/entities/event/lib/timeValidation';
import { EventContext } from '@/entities/event/model/EventContext';
import { EventContextType } from '@/entities/event/model/EventContextType';
import { Event, EventForm, RepeatType } from '@/entities/event/model/types';

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider = ({ children }: EventProviderProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatEndDate, setRepeatEndDate] = useState('');
  const [notificationTime, setNotificationTime] = useState(10);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [startTimeError, setStartTimeError] = useState<string | null>(null);
  const [endTimeError, setEndTimeError] = useState<string | null>(null);

  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);

  const toast = useToast();

  // Form 관련
  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStartTime = e.target.value;
      setStartTime(newStartTime);
      const { startTimeError: newStartTimeError, endTimeError: newEndTimeError } =
        getTimeErrorMessage(newStartTime, endTime);
      setStartTimeError(newStartTimeError);
      setEndTimeError(newEndTimeError);
    },
    [endTime]
  );

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEndTime = e.target.value;
      setEndTime(newEndTime);
      const { startTimeError: newStartTimeError, endTimeError: newEndTimeError } =
        getTimeErrorMessage(startTime, newEndTime);
      setStartTimeError(newStartTimeError);
      setEndTimeError(newEndTimeError);
    },
    [startTime]
  );

  const editEvent = useCallback((event: Event) => {
    setTitle(event.title);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setDescription(event.description);
    setLocation(event.location);
    setCategory(event.category);
    setIsRepeating(event.repeat.type !== 'none');
    setRepeatType(event.repeat.type);
    setRepeatInterval(event.repeat.interval);
    setRepeatEndDate(event.repeat.endDate || '');
    setNotificationTime(event.notificationTime);
    setEditingEvent(event);
  }, []);

  const resetForm = useCallback(() => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setLocation('');
    setCategory('');
    setIsRepeating(false);
    setRepeatType('daily');
    setRepeatInterval(1);
    setRepeatEndDate('');
    setNotificationTime(10);
    setEditingEvent(null);
    setStartTimeError(null);
    setEndTimeError(null);
  }, []);

  // Operation 관련
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: '이벤트 로딩 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const saveEvent = async (eventData: Event | EventForm, isEditing: boolean) => {
    try {
      let response;
      if (isEditing) {
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      setEditingEvent(null);
      toast({
        title: isEditing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
        toast({
          title: '일정이 삭제되었습니다.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        toast({
          title: '일정 삭제 실패',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const init = useCallback(async () => {
    await fetchEvents();
    toast({
      title: '일정 로딩 완료!',
      status: 'info',
      duration: 1000,
    });
  }, [fetchEvents, toast]);

  useEffect(() => {
    init();
  }, [init]);

  // 이벤트 추가 및 수정
  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData, false);
      resetForm();
    }
  };

  const contextValue: EventContextType = {
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    isRepeating,
    repeatType,
    repeatInterval,
    repeatEndDate,
    notificationTime,
    editingEvent,
    startTimeError,
    endTimeError,
    events,
    fetchEvents,
    deleteEvent,
    setTitle,
    setDate,
    setStartTime,
    setEndTime,
    setDescription,
    setLocation,
    setCategory,
    setIsRepeating,
    setRepeatType,
    setRepeatInterval,
    setRepeatEndDate,
    setNotificationTime,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
    overlappingEvents,
    setOverlappingEvents,
    isOverlapDialogOpen,
    setIsOverlapDialogOpen,
    addOrUpdateEvent,
    saveEvent,
  };

  return <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>;
};
