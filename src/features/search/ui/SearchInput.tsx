import { FormControl, FormLabel, Input } from '@chakra-ui/react';

type Props = {
  searchTerm: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
};

export function SearchInput({ searchTerm, onChange }: Props) {
  return (
    <FormControl>
      <FormLabel>일정 검색</FormLabel>
      <Input
        data-testid="search-input"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
      />
    </FormControl>
  );
}
