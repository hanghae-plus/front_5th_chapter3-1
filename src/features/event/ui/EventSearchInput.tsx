import { FormControl, FormLabel, Input } from '@chakra-ui/react';

export const EventSearchInput = ({
  searchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}) => {
  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        data-testid="search-input"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </FormControl>
  );
};
