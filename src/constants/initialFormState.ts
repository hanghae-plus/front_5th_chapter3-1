import { RepeatType } from '../types';

export const INITIAL_FORM_STATE = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  location: '',
  category: '',
  isRepeating: false,
  repeatType: 'none' as RepeatType,
  repeatInterval: 1,
  repeatEndDate: '',
  notificationTime: 10,
};
