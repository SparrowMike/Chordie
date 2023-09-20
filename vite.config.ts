import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } })],
	css: {
		modules: {
			generateScopedName: '[local]--[hash:base64:5]',
		},
	},
	server: {
		host: true,
	},
});
