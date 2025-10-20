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
				NODE_ENV: process.env.NODE_ENV,
				ORIGIN: process.env.ORIGIN,
				PORT: process.env.PORT,
				HOST: process.env.HOST
			}
		}
	]
};
