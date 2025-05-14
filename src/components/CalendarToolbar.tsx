import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';

export default function CalendarToolbar({ view, setView, navigate }) {
  return (
    <HStack mx="auto" justifyContent="space-between">
      <IconButton
        aria-label="Previous"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        aria-label="view"
        value={view}
        onChange={(e) => setView(e.target.value)}
      >
        <option value="week">Week</option>
        <option value="month">Month</option>
      </Select>
      <IconButton
        aria-label="Next"
        icon={<ChevronRightIcon />}
        onClick={() => navigate('next')}
      />
    </HStack>
  );
}
