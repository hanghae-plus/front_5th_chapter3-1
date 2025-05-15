import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { HStack, IconButton, Select } from '@chakra-ui/react';
import React from 'react';

interface ViewNavigatorProps {
  view: 'week' | 'month'; // App.tsx에서 사용하는 타입과 일치시킵니다.
  setView: (_view: 'week' | 'month') => void;
  navigate: (_direction: 'prev' | 'next') => void;
}

export const ViewNavigator: React.FC<ViewNavigatorProps> = ({ view, setView, navigate }) => {
  return (
    <HStack mx="auto" justifyContent="space-between" w="full" maxW="sm">
      <IconButton
        aria-label="Previous Period"
        icon={<ChevronLeftIcon />}
        onClick={() => navigate('prev')}
      />
      <Select
        aria-label="Select View"
        value={view}
        onChange={(e) => setView(e.target.value as 'week' | 'month')}
        w="auto"
      >
        <option value="week">주간</option>
        <option value="month">월간</option>
        {/* 현재 App.tsx에서는 day, list 뷰 옵션이 없으므로 일단 주석 처리 또는 제외합니다.
        <option value="day">일간</option>
        <option value="list">목록</option> */}
      </Select>
      <IconButton
        aria-label="Next Period"
        icon={<ChevronRightIcon />}
        onClick={() => navigate('next')}
      />
    </HStack>
  );
};
