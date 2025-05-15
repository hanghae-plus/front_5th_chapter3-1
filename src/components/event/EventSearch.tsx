/* eslint-disable no-unused-vars */
import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import React from 'react';

interface EventSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EventSearch: React.FC<EventSearchProps> = ({ searchTerm, setSearchTerm }) => {
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

export default EventSearch;
