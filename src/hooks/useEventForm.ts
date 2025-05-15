import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Event } from '../types';
import { getTimeErrorMessage } from '../utils/timeValidation';

type TimeErrorRecord = Record<'startTimeError' | 'endTimeError', string | null>;

export const useEventForm = (initialEvent: Event | null) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialEvent?.title || '',
      date: initialEvent?.date || '',
      startTime: initialEvent?.startTime || '',
      endTime: initialEvent?.endTime || '',
      description: initialEvent?.description || '',
      location: initialEvent?.location || '',
      category: initialEvent?.category || '',
      isRepeating: initialEvent?.repeat.type !== 'none',
      repeatType: initialEvent?.repeat.type || 'none',
      repeatInterval: initialEvent?.repeat.interval || 1,
      repeatEndDate: initialEvent?.repeat.endDate || '',
      notificationTime: initialEvent?.notificationTime || 10,
    },
  });

  const [{ startTimeError, endTimeError }, setTimeError] = useState<TimeErrorRecord>({
    startTimeError: null,
    endTimeError: null,
  });

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  useEffect(() => {
    setTimeError(getTimeErrorMessage(startTime, endTime));
  }, [startTime, endTime]);

  const resetForm = () => {
    reset({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      description: '',
      location: '',
      category: '',
      isRepeating: false,
      repeatType: 'none',
      repeatInterval: 1,
      repeatEndDate: '',
      notificationTime: 10,
    });
  };

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    startTimeError,
    endTimeError,
    resetForm,
  };
};
