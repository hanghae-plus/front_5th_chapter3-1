import { Event } from '../../types';

export interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
}

export interface WeekViewEventProps {
  event: Event;
  isNotified: boolean;
}
