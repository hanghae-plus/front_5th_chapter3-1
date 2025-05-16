import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { createEventToasts } from '../utils/toastUtils';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);

  const toast = useToast();
  const { showSuccessToast, showErrorToast, showInfoToast } = createEventToasts(toast);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();

      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      showErrorToast('이벤트 로딩 실패');
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      if (editing) {
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

      onSave?.();

      showSuccessToast(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.');
    } catch (error) {
      console.error('Error saving event:', error);
      showErrorToast('일정 저장 실패');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      showInfoToast('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting event:', error);
      showErrorToast('일정 삭제 실패');
    }
  };

  async function init() {
    await fetchEvents();
    showInfoToast('일정 로딩 완료!', 1000);
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
