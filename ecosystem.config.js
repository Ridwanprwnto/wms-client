// ecosystem.config.js
module.exports = {
	apps: [
		{
			name: 'wms-client', // Nama app di PM2
			script: 'build/index.js', // Entry point hasil build SvelteKit
			instances: 'max', // Gunakan semua core CPU (bisa diganti 1 kalau mau single instance)
			exec_mode: 'cluster', // Cluster mode untuk scale otomatis
			watch: false, // Jangan watch di production
			env: {
				NODE_ENV: 'development',
				LOG_LEVEL: 'DEBUG'
			},
			env_production: {
				NODE_ENV: 'production',
				LOG_LEVEL: 'INFO'
			}
		}
	]
};
