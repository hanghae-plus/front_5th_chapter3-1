import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

interface Props {
  view: 'week' | 'month';
  onChangeView: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const CalendarHeader = ({ view, onChangeView, onNavigate }: Props) => {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => onNavigate('prev')}
      />
      <Select
        aria-label="view"
        data-testid="view-select"
        value={view}
        onChange={(e) => onChangeView(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon />}
        onClick={() => onNavigate('next')}
      />
    </HStack>
  );
};

export default CalendarHeader;
