import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 모든 외부 IP에서 접근 가능하도록 설정
    port: 5173,        // 포트 설정 (기본값 5173)
  },
})
