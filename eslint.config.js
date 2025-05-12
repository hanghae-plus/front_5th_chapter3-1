import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import vitest from 'eslint-plugin-vitest';

export default tseslint.config(
  { ignores: ['**/node_modules/**', 'dist/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest', // 지원할 ECMAScript 버전 기본 값은 'latest'
      sourceType: 'module', // js 소스코드의 유형, ECMAScript의 모듈일 경우 'module', Commonjs인 경우 'commonjs'
      globals: {
        // linting 중 전역 범위에 추가되어야하는 추가 개체를 지정
        ...globals.browser,
        ...globals.es2021,
      },
      parser: typescriptParser, // parse() 또는 parseForESLint() 메서드를 포함하는 객체, 기본 값은 'espree', 추가적으로 레거시 프로젝트에서는 babel로 되어있는 parser일 수 있음
      parserOptions: {
        // parse() 또는 parseForESLint() 메서드에 직접 전달되는 추가 옵션을 지정
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // 플러그인 개체를 매핑
    plugins: {
      'prettier': eslintPluginPrettier,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      vitest,
    },
    // 모든 규칙에 사용할 수 있는 정보의 key-value 쌍이 포함된 객체
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Prettier 통합 규칙
      'prettier/prettier': 'error', // Prettier 포맷팅 오류를 ESLint 에러로 표시

      // React 관련 규칙
      'react/prop-types': 'off', // TypeScript 사용 시 prop-types 검사를 비활성화
      'react/react-in-jsx-scope': 'off', // React 17+에서는 필요 없음
      'react-hooks/rules-of-hooks': 'error', // 훅 사용 시 규칙 강제
      'react-hooks/exhaustive-deps': 'warn', // useEffect 의존성 배열 검증

      // TypeScript 관련 규칙
      '@typescript-eslint/no-explicit-any': 'warn', // any 사용 최소화
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }, // 사용하지 않는 변수 중 '_'로 시작하는 인자는 무시
      ],

      // 최신 JavaScript 스타일 규칙
      'prefer-const': 'error', // 가능하면 const 사용
      'no-var': 'error', // var 사용 금지
      'arrow-body-style': ['error', 'as-needed'], // 필요할 때만 중괄호 사용
      'object-shorthand': 'error', // 객체 속성 단축 표기법 사용
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }], // 빈 줄 제한

      // 코드 안전성 및 품질 규칙
      'eqeqeq': ['error', 'always'], // 항상 === 사용
      'no-console': ['warn', { allow: ['warn', 'error'] }], // console.log는 경고
      'no-debugger': 'warn', // 디버거 사용 경고
      'no-unused-vars': 'off', // TypeScript 규칙으로 대체
      'no-undef': 'off', // TypeScript 환경에서 처리

      // Vitest 관련 규칙
      "vitest/expect-expect": "off",
		},
	},
	// Test 파일 설정
	{
		files: [
			"**/src/**/*.{spec,test}.[jt]s?(x)",
			"**/__mocks__/**/*.[jt]s?(x)",
			"./src/setupTests.ts",
		],
		plugins: {
			vitest,
		},
		languageOptions: {
			globals: {
				...globals.node,
				globalThis: true,
				describe: true,
				it: true,
				expect: true,
				beforeEach: true,
				afterEach: true,
				beforeAll: true,
				afterAll: true,
				vi: true,
			},
		},
  },
  prettier, // Prettier 충돌 방지
);