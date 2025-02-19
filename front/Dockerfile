FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Vite 서버를 외부에서 접근할 수 있도록 host를 0.0.0.0으로 설정
ENV VITE_HOST=0.0.0.0

CMD ["npx", "vite"]