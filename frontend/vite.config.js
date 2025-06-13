import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,         // Tự động mở trình duyệt
    strictPort: true,   // Nếu cổng 5173 bị chiếm thì báo lỗi, không đổi cổng
  },
})
