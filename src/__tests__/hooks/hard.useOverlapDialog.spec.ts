import { renderHook, act } from '@testing-library/react';

import { useOverlapDialog } from '../../hooks/useOverlapDialog';
import { mockTestDataList } from '../data/mockTestData';

describe('useOverlapDialog hook test', () => {
  it('초기 상태는 closed, overlappingEvents는 빈 배열, cancelRef.current는 null 이다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
    expect(result.current.cancelRef.current).toBeNull();
  });

  it('openOverlapDialog 호출 시 다이얼로그가 열리고 이벤트 배열이 state에 설정된다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    act(() => {
      result.current.openOverlapDialog(mockTestDataList);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockTestDataList);
  });

  it('closeOverlapDialog 호출 시 상태가 초기화된다', () => {
    const { result } = renderHook(() => useOverlapDialog());

    // 열기
    act(() => {
      result.current.openOverlapDialog(mockTestDataList);
    });
    expect(result.current.isOverlapDialogOpen).toBe(true);

    // 닫기
    act(() => {
      result.current.closeOverlapDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
    expect(result.current.overlappingEvents).toEqual([]);
  });
});
