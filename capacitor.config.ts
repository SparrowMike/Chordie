import { CapacitorConfig } from '@capacitor/cli';

const isDevelopment = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
	appId: 'com.chordie.app',
	appName: 'chordie',
	webDir: 'dist',
	...(isDevelopment && {
		server: {
			url: 'http://192.168.18.5:5173/',
			cleartext: true,
		},
	}),
};

export default config;
