import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

interface NavigationProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  navigate: (direction: 'prev' | 'next') => void;
}

export const Navigation = ({ view, setView, navigate }: NavigationProps) => {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        data-testid="view-selector"
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton aria-label="Next" icon={<ChevronRightIcon />} onClick={() => navigate('next')} />
    </HStack>
  );
};
