import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { useToastManage } from './useToastManage'; // useToastManage 경로 맞게 수정

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { showToast } = useToastManage();

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
      showToast('이벤트 로딩 실패', 'error');
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
      showToast(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', 'success');
    } catch (error) {
      console.error('Error saving event:', error);
      showToast('일정 저장 실패', 'error');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      showToast('일정이 삭제되었습니다.', 'info');
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('일정 삭제 실패', 'error');
    }
  };

  async function init() {
    await fetchEvents();
    showToast('일정 로딩 완료!', 'info', 1000);
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
