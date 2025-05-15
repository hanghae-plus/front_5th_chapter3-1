import { Event } from '../../../types';

export interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  holidays: Record<string, string>;
}

export interface MonthViewEventProps {
  event: Event;
  isNotified: boolean;
}
