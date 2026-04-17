// ecosystem.config.cjs
require('dotenv').config({ path: '.env.production' });

module.exports = {
	apps: [
		{
			name: 'wms-client',
			script: './build/index.js',
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
			env: {
				// Server & networking
				NODE_ENV: process.env.NODE_ENV,
				ORIGIN: process.env.ORIGIN,
				PORT: process.env.PORT,
				HOST: process.env.HOST,

				// Cookie
				COOKIE_SECURE: process.env.COOKIE_SECURE,

				// API URLs (local)
				API_LOCAL_IMS_URL: process.env.API_LOCAL_IMS_URL,
				API_LOCAL_WMS_URL: process.env.API_LOCAL_WMS_URL,
				API_LOCAL_WHS_URL: process.env.API_LOCAL_WHS_URL,
				API_LOCAL_DPD_URL: process.env.API_LOCAL_DPD_URL,

				// API Gateway (production)
				API_GATEWAY_URL: process.env.API_GATEWAY_URL,

				// API Endpoints
				ENDPOINT_IMS: process.env.ENDPOINT_IMS,
				ENDPOINT_WMS: process.env.ENDPOINT_WMS,
				ENDPOINT_WHS: process.env.ENDPOINT_WHS,
				ENDPOINT_DPD: process.env.ENDPOINT_DPD,

				// API Keys & Auth
				JWT_SECRET: process.env.JWT_SECRET,
				API_KEY_WHS: process.env.API_KEY_WHS,
				API_KEY_DPD: process.env.API_KEY_DPD,
				API_KEY_WMS: process.env.API_KEY_WMS,

				// Additional config
				API_TIMEOUT: process.env.API_TIMEOUT,
				API_RETRY_ATTEMPTS: process.env.API_RETRY_ATTEMPTS,
				API_RESPONSE_TIME: process.env.API_RESPONSE_TIME,

				// Logging
				LOG_LEVEL: process.env.LOG_LEVEL,

				// Public app metadata
				PUBLIC_APP_VERSION: process.env.PUBLIC_APP_VERSION,
				PUBLIC_APP_DEVELOPER: process.env.PUBLIC_APP_DEVELOPER,
				PUBLIC_APP_DEVELOPER_URL: process.env.PUBLIC_APP_DEVELOPER_URL
			}
		}
	]
};
