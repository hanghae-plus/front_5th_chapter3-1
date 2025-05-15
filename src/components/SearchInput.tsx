import { FormControl, FormLabel, Input } from '@chakra-ui/react';

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
}

export const SearchInput = ({ searchTerm, setSearchTerm }: SearchInputProps) => {
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
};
