# 7주차 테스트 과제 - Medium

## 7주차 과제 체크포인트

### 기본과제

#### Medium

- [ ] 총 11개의 파일, 115개의 단위 테스트를 무사히 작성하고 통과시킨다.

#### 질문

> Q. medium.useEventOperations.spec.tsx > 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
```javascript
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});
```

- vi는 vitest의 유틸함수들이 모여있는 헬퍼함수입니다! 
- **const toastFn = vi.fn()** 부분은 **vitest**에서 제공하는 유틸함수중 **fn()**이라는 함수를 사용했는데 해당함수는 vitest.dev/api/vi.html#vi-fn 링크에 의하면 다음과 같습니다.
> Creates a spy on a function, though can be initiated without one. Every time a function is invoked, it stores its call arguments, returns, and instances. Also, you can manipulate its behavior with methods. If no function is given, mock will return undefined, when invoked.
- 위 내용을 토대로 고민해본 제 생각은 이후 사용될 **useToast**를 테스트하기 위해 해당 함수를 toastFn으로 대체하고 vi.fn()함수를 이용해 해당함수가 호출되었는지, 호출횟수는 몇번인지, 호출인자는 무엇이 출력되었는지 등을 파악하기위함이라고 생각이 듭니다.
- 테스트 환경에서 외부의 영향을 안받고 독립적인 환경에서 테스트가 진행되어야하기때문에 **chakra-ui/react**의 경로에서 가져오는모듈을 두번째인자의 콜백함수의 결과값으로 대체하여 추후 테스트환경에서는 해당 값으로만 테스트 할 수 있게 합니다! 이때 앞서 말한거처럼 @chakra-ui/react 모듈중 **useToast** 함수를 **toastFn**으로 대체하여 향후 테스트에서는 useToast를 toastFn으로 대체하여 사용한것으로 생각하였습니다.

> Q. medium.integration.spec.tsx > 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
- 영향을 끼칠꺼라고 생각합니다. 왜냐하면 테스트코드는 독립되어야하지만 최대한 유저가 사용하는 환경과 비슷해야한다고 생각하기 때문입니다. ChakraProvider가 제공하는 Context가 분명 있을태고, 해당 Context를 이용해 <App />의 UI가 구성된다면, 결국 유저 역시 똑같은 과정을 거치고 Chakra로부터 어떠한 전역값 혹은 Context들을 상속받아 작동하기때문에 테스트환경에서도 똑같이 상속받았다고 가정하고 테스트해야한다고 생각합니다.
> Q. handlersUtils > 아래 여러가지 use 함수는 어떤 역할을 할까요? 어떻게 사용될 수 있을까요?

> Q. setupTests.ts > 왜 이 시간을 설정해주는 걸까요?

### 심화 과제

- [ ] App 컴포넌트 적절한 단위의 컴포넌트, 훅, 유틸 함수로 분리했는가?
- [ ] 해당 모듈들에 대한 적절한 테스트를 5개 이상 작성했는가?

## 과제 셀프회고

<!-- 과제에 대한 회고를 작성해주세요 -->

### 기술적 성장

<!-- 예시
- 새로 학습한 개념
- 기존 지식의 재발견/심화
- 구현 과정에서의 기술적 도전과 해결
-->

### 코드 품질

<!-- 예시
- 특히 만족스러운 구현
- 리팩토링이 필요한 부분
- 코드 설계 관련 고민과 결정
-->

### 학습 효과 분석

<!-- 예시
- 가장 큰 배움이 있었던 부분
- 추가 학습이 필요한 영역
- 실무 적용 가능성
-->

### 과제 피드백

<!-- 예시
- 과제에서 모호하거나 애매했던 부분
- 과제에서 좋았던 부분
-->

## 리뷰 받고 싶은 내용

<!--
피드백 받고 싶은 내용을 구체적으로 남겨주세요
모호한 요청은 피드백을 남기기 어렵습니다.

참고링크: https://chatgpt.com/share/675b6129-515c-8001-ba72-39d0fa4c7b62

모호한 요청의 예시)
- 코드 스타일에 대한 피드백 부탁드립니다.
- 코드 구조에 대한 피드백 부탁드립니다.
- 개념적인 오류에 대한 피드백 부탁드립니다.
- 추가 구현이 필요한 부분에 대한 피드백 부탁드립니다.

구체적인 요청의 예시)
- 현재 함수와 변수명을 보면 직관성이 떨어지는 것 같습니다. 함수와 변수를 더 명확하게 이름 지을 수 있는 방법에 대해 조언해주실 수 있나요?
- 현재 파일 단위로 코드가 분리되어 있지만, 모듈화나 계층화가 부족한 것 같습니다. 어떤 기준으로 클래스를 분리하거나 모듈화를 진행하면 유지보수에 도움이 될까요?
- MVC 패턴을 따르려고 했는데, 제가 구현한 구조가 MVC 원칙에 맞게 잘 구성되었는지 검토해주시고, 보완할 부분을 제안해주실 수 있을까요?
- 컴포넌트 간의 의존성이 높아져서 테스트하기 어려운 상황입니다. 의존성을 낮추고 테스트 가능성을 높이는 구조 개선 방안이 있을까요?
-->
