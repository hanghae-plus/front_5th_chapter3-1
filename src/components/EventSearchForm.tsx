import { FormControl, FormLabel, Input } from '@chakra-ui/react';

interface EventSearchFormProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export function EventSearchForm({ searchTerm, setSearchTerm }: EventSearchFormProps) {
  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </FormControl>
  );
}
