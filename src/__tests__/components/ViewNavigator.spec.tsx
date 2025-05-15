import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

import { ViewNavigator } from '../../components/ViewNavigator';

// Helper function to render with ChakraProvider
const renderWithChakraProvider = (ui: React.ReactElement) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ViewNavigator', () => {
  const mockSetView = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    mockSetView.mockClear();
    mockNavigate.mockClear();
  });

  it('view prop이 "month"일 때 Select 값이 "month"로 올바르게 설정되어야 합니다.', () => {
    renderWithChakraProvider(
      <ViewNavigator view="month" setView={mockSetView} navigate={mockNavigate} />
    );
    const selectElement = screen.getByRole('combobox', { name: /Select View/i });
    expect(selectElement).toHaveValue('month');
  });

  it('view prop이 "week"일 때 Select 값이 "week"으로 올바르게 설정되어야 합니다.', () => {
    renderWithChakraProvider(
      <ViewNavigator view="week" setView={mockSetView} navigate={mockNavigate} />
    );
    const selectElement = screen.getByRole('combobox', { name: /Select View/i });
    expect(selectElement).toHaveValue('week');
  });

  it('Select 변경 시 setView가 올바른 값으로 호출되어야 합니다.', () => {
    renderWithChakraProvider(
      <ViewNavigator view="month" setView={mockSetView} navigate={mockNavigate} />
    );
    const selectElement = screen.getByRole('combobox', { name: /Select View/i });

    fireEvent.change(selectElement, { target: { value: 'week' } });
    expect(mockSetView).toHaveBeenCalledWith('week');
  });

  it('이전 버튼 클릭 시 navigate("prev")가 호출되어야 합니다.', () => {
    renderWithChakraProvider(
      <ViewNavigator view="month" setView={mockSetView} navigate={mockNavigate} />
    );
    const prevButton = screen.getByRole('button', { name: /Previous Period/i });

    fireEvent.click(prevButton);
    expect(mockNavigate).toHaveBeenCalledWith('prev');
  });

  it('다음 버튼 클릭 시 navigate("next")가 호출되어야 합니다.', () => {
    renderWithChakraProvider(
      <ViewNavigator view="month" setView={mockSetView} navigate={mockNavigate} />
    );
    const nextButton = screen.getByRole('button', { name: /Next Period/i });

    fireEvent.click(nextButton);
    expect(mockNavigate).toHaveBeenCalledWith('next');
  });
});
