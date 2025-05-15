FROM node:20-slim

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치
RUN pnpm install

# 소스 코드 복사
COPY . .

# 빌드
RUN pnpm build

# 서버 실행
EXPOSE 3000
CMD ["node", "server.js"]