// ecosystem.config.cjs
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
				NODE_ENV: 'production',
				ORIGIN: 'http://localhost:3000',
				PORT: 3000,
				HOST: '0.0.0.0'
			}
		}
	]
};
