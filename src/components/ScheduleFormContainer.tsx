import { useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import OverlapDialog from './OverlapDialog';
import ScheduleForm from './ScheduleForm';
import { useEventForm } from '../hooks/useEventForm';
import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

interface Props {
  events: Event[];
  saveEvent: (event: Event | EventForm) => Promise<void>;
  editingEvent: Event | null;
  setEditingEvent: (event: Event | null) => void;
}

const ScheduleFormContainer = ({ events, saveEvent, editingEvent, setEditingEvent }: Props) => {
  const { values, setters, errors, handlers, resetForm, editEvent } = useEventForm();

  const toast = useToast();

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (editingEvent) {
      editEvent(editingEvent);
    }
  }, [editingEvent]);

  const addOrUpdateEvent = async () => {
    if (!values.title || !values.date || !values.startTime || !values.endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (errors.startTimeError || errors.endTimeError) {
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
      ...values,
      repeat: {
        type: values.isRepeating ? values.repeatType : 'none',
        interval: values.repeatInterval,
        endDate: values.repeatEndDate || undefined,
      },
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
      setEditingEvent(null);
    }
  };

  const handleConfirmOverlap = async () => {
    setIsOverlapDialogOpen(false);
    await saveEvent({
      id: editingEvent ? editingEvent.id : undefined,
      ...values,
      repeat: {
        type: values.isRepeating ? values.repeatType : 'none',
        interval: values.repeatInterval,
        endDate: values.repeatEndDate || undefined,
      },
    });
    resetForm();
    setEditingEvent(null);
  };

  return (
    <>
      <ScheduleForm
        editingEvent={editingEvent}
        onSubmit={addOrUpdateEvent}
        values={values}
        setters={setters}
        errors={errors}
        handlers={handlers}
      />

      <OverlapDialog
        isOpen={isOverlapDialogOpen}
        onClose={() => setIsOverlapDialogOpen(false)}
        overlappingEvents={overlappingEvents}
        onConfirm={handleConfirmOverlap}
      />
    </>
  );
};

export default ScheduleFormContainer;
