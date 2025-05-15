import { useEffect, useState } from 'react';

import {
  createEvent,
  deleteEvent as deleteEventApi,
  fetchEvents as fetchEventsApi,
  updateEvent,
} from '../apis/eventApi';
import { Event, EventForm } from '../types';
import { useToaster } from './useToaster';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { showSuccessToast, showErrorToast, showInfoToast } = useToaster();

  const fetchEvents = async () => {
    try {
      const eventsData = await fetchEventsApi();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      showErrorToast('이벤트 로딩 실패');
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      if (editing) {
        await updateEvent((eventData as Event).id, eventData);
      } else {
        await createEvent(eventData as EventForm);
      }

      await fetchEvents();
      onSave?.();
      showSuccessToast(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.'); // 변경
    } catch (error) {
      console.error('Error saving event:', error);
      showErrorToast('일정 저장 실패');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await deleteEventApi(id);
      await fetchEvents();
      showInfoToast('일정이 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting event:', error);
      showErrorToast('일정 삭제 실패');
    }
  };

  async function init() {
    await fetchEvents();
    showInfoToast('일정 로딩 완료!', { duration: 1000 });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
