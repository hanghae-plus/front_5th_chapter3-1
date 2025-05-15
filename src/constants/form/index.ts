import { EventForm } from '@/types';

export const DEFAULT_EVENT_FORM: EventForm = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  repeat: {
    type: 'none',
    interval: 1,
    endDate: '',
  },
  notificationTime: 10,
};
