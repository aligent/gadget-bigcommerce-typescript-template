import react from '@vitejs/plugin-react-swc';
import { gadget } from 'gadget-server/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    // @ts-expect-error @vitejs/plugin-react-swc does not export types correctly: https://arethetypeswrong.github.io/?p=%40vitejs%2Fplugin-react-swc%403.8.0
    plugins: [gadget(), react()],
    clearScreen: false,
});
