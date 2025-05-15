import { useToast } from '@chakra-ui/react';
type ToastStatus = 'error' | 'info' | 'warning' | 'success' | 'loading' | undefined;

export const useToastManage = () => {
  const toast = useToast();

  const showToast = (message: string, status: ToastStatus, duration = 3000, isClosable = true) => {
    toast({
      title: message,
      status: status,
      duration: duration,
      isClosable: isClosable,
    });
  };

  return { showToast };
};
