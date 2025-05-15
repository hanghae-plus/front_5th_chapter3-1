import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';

import ScheduleSearch from '../../../features/schedule/ui/ScheduleSearch';

describe('일정 검색 (ScheduleSearch)', () => {
  const mockSetSearchTerm = vi.fn();

  const renderScheduleSearch = (searchTerm: string = '') => {
    return render(
      <ChakraProvider>
        <ScheduleSearch searchTerm={searchTerm} setSearchTerm={mockSetSearchTerm} />
      </ChakraProvider>
    );
  };

  it('검색 입력 필드가 일정 검색 제목과 검색어를 입력하는 입력란이 렌더링된다', () => {
    renderScheduleSearch();
    const input = screen.getByPlaceholderText('검색어를 입력하세요');

    expect(screen.getByLabelText('일정 검색')).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('입력값이 변경되면 setSearchTerm이 변경된 값으로 호출된다', () => {
    renderScheduleSearch();

    const input = screen.getByPlaceholderText('검색어를 입력하세요');
    fireEvent.change(input, { target: { value: '팀 회의' } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith('팀 회의');
  });
});
