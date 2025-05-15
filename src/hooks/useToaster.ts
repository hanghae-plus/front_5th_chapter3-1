import { ToastId, useToast, UseToastOptions } from '@chakra-ui/react';
import { useCallback } from 'react';

type ToastStatus = 'info' | 'warning' | 'success' | 'error' | 'loading';
type ToastOptions = Omit<UseToastOptions, 'title' | 'status'>;

export const useToaster = () => {
  const toast = useToast();

  const showToast = useCallback(
    (title: string, status: ToastStatus, options?: Partial<ToastOptions>): ToastId => {
      return toast({
        title,
        status,
        duration: 3000,
        isClosable: true,
        ...options,
      });
    },
    [toast]
  );

  // 상태별 헬퍼 함수들
  const showSuccessToast = useCallback(
    (title: string, options?: Partial<ToastOptions>): ToastId => {
      return showToast(title, 'success', options);
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (title: string, options?: Partial<ToastOptions>): ToastId => {
      return showToast(title, 'error', options);
    },
    [showToast]
  );

  const showInfoToast = useCallback(
    (title: string, options?: Partial<ToastOptions>): ToastId => {
      return showToast(title, 'info', options);
    },
    [showToast]
  );

  return {
    showToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast,
  };
};
