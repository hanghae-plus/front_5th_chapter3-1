import { FormControl, FormLabel, Input } from '@chakra-ui/react';

type Props = {
  searchTerm: string;
  setSearchTerm: (_value: string) => void;
};

const EventSearchInput = ({ searchTerm, setSearchTerm }: Props) => (
  <FormControl>
    <FormLabel>일정 검색</FormLabel>
    <Input
      placeholder="검색어를 입력하세요"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </FormControl>
);

export default EventSearchInput;
