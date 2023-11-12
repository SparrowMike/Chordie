import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.chordie.app',
	appName: 'chordie',
	webDir: 'dist',
	server: {
		url: 'http://192.168.18.5:5173/',
		cleartext: true,
	},
};

export default config;
