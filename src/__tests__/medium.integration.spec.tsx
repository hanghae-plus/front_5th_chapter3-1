import {ChakraProvider} from '@chakra-ui/react';
import {render, screen, within, act, waitFor} from '@testing-library/react';
import {UserEvent, userEvent} from '@testing-library/user-event';
import {http, HttpResponse} from 'msw';
import {ReactElement} from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import {server} from '../setupTests';
import {Event} from '../types';
import {expect} from "vitest";

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {...render(<ChakraProvider>{element}</ChakraProvider>), user}; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const {title, date, startTime, endTime, location, description, category} = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};


// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  const {user} = setup(<App/>)

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const title = "new event"
    const date = "2025-10-19"
    const startTime = "09:00"
    const endTime = "12:00"
    const location = "본사 3층"
    const description = "새 이벤트"
    const category = "업무"
    const form = {
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      category
    }
    await saveSchedule(user, form)
    expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument();
    waitFor(() => {
      expect(screen.getByTestId('event-list')).toHaveTextContent(title);
      expect(screen.getByTestId('event-list')).toHaveTextContent(date);
      expect(screen.getByTestId('event-list')).toHaveTextContent(startTime);
      expect(screen.getByTestId('event-list')).toHaveTextContent(endTime);
      expect(screen.getByTestId('event-list')).toHaveTextContent(location);
      expect(screen.getByTestId('event-list')).toHaveTextContent(description);
      expect(screen.getByTestId('event-list')).toHaveTextContent(category);
    })
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    waitFor(async () => {
      expect(screen.queryByText('검색 결과가 없습니다')).not.toBeInTheDocument()
      const editButton = screen.getByRole('button', { name: 'Edit event' });
      await user.click(editButton);

      const newTitle = "updated event";
      const newLocation = "본사 2층"
      const newDescription = "새 이벤트2"
      await user.type(screen.getByLabelText('제목'), newTitle);
      await user.type(screen.getByLabelText('위치'), newLocation);
      await user.type(screen.getByLabelText('설명'), newDescription);
      await user.click(screen.getByTestId('event-submit-button'));

      waitFor(() => {
        expect(screen.getByTestId('event-list')).toHaveTextContent(newTitle);
        expect(screen.getByTestId('event-list')).toHaveTextContent(newLocation);
        expect(screen.getByTestId('event-list')).toHaveTextContent(newDescription);
      })
    })
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion()

    waitFor(async () => {
      const deleteButton = await screen.findByRole('button', { name: 'Delete event' });
      await user.click(deleteButton);

    })
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
});
