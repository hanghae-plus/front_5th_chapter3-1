import { Event } from '../../types';

export interface EventListProps {
  events: Event[];
  notifiedEvents: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export interface EventItemProps {
  event: Event;
  isNotified: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}
