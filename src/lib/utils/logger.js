// src/lib/utils/logger.js
import { dev } from '$app/environment';

/**
 * Log levels dengan priority
 */
export const LOG_LEVELS = {
	ERROR: 0,
	WARN: 1,
	INFO: 2,
	HTTP: 3,
	DEBUG: 4
};

/**
 * Log level names
 */
export const LOG_LEVEL_NAMES = {
	0: 'ERROR',
	1: 'WARN',
	2: 'INFO',
	3: 'HTTP',
	4: 'DEBUG'
};

/**
 * Colors untuk console logging
 */
const LOG_COLORS = {
	ERROR: '\x1b[31m', // Red
	WARN: '\x1b[33m', // Yellow
	INFO: '\x1b[36m', // Cyan
	HTTP: '\x1b[35m', // Magenta
	DEBUG: '\x1b[32m', // Green
	RESET: '\x1b[0m' // Reset
};

class Logger {
	constructor() {
		// Konfigurasi dari environment atau default
		this.logLevel = this.getLogLevelFromEnv();
		this.enableConsole = true; // Selalu enable console logging
		this.enableFile = !dev; // File logging hanya di production
		this.logDir = null;
		this.fs = null;
		this.path = null;

		// Import file system modules hanya di server-side dan production
		this.initFileLogging();
	}

	/**
	 * Initialize file logging modules
	 */
	async initFileLogging() {
		if (typeof window === 'undefined' && this.enableFile) {
			try {
				// Dynamic import untuk server-side only
				const fs = await import('fs');
				const path = await import('path');
				const { fileURLToPath } = await import('url');
				const { dirname } = await import('path');

				this.fs = fs;
				this.path = path.default;

				// Set log directory
				if (import.meta.url) {
					const __filename = fileURLToPath(import.meta.url);
					const __dirname = dirname(__filename);
					this.logDir = this.path.join(__dirname, '../../..', 'logs');
				} else {
					this.logDir = this.path.join(process.cwd(), 'logs');
				}

				// Buat folder logs jika belum ada
				this.ensureLogDirectory();
			} catch (error) {
				console.warn('File logging not available:', error.message);
				this.enableFile = false;
			}
		}
	}

	/**
	 * Mendapatkan log level dari environment variable
	 */
	getLogLevelFromEnv() {
		// Untuk development, gunakan DEBUG level jika tidak ada environment variable
		const defaultLevel = dev ? 'DEBUG' : 'INFO';
		const envLevel =
			(typeof process !== 'undefined' ? process.env.LOG_LEVEL : null) || defaultLevel;

		return LOG_LEVELS[envLevel.toUpperCase()] !== undefined
			? LOG_LEVELS[envLevel.toUpperCase()]
			: LOG_LEVELS[defaultLevel];
	}

	/**
	 * Memastikan direktori logs ada
	 */
	ensureLogDirectory() {
		if (this.enableFile && this.fs && this.logDir) {
			try {
				if (!this.fs.existsSync(this.logDir)) {
					this.fs.mkdirSync(this.logDir, { recursive: true });
					console.log(`📁 Created logs directory: ${this.logDir}`);
				}
			} catch (error) {
				console.warn('Failed to create logs directory:', error);
				this.enableFile = false;
			}
		}
	}

	/**
	 * Format timestamp
	 */
	formatTimestamp() {
		return new Date().toISOString();
	}

	/**
	 * Format log message
	 */
	formatMessage(level, message, meta = {}) {
		const timestamp = this.formatTimestamp();
		const levelName = LOG_LEVEL_NAMES[level];

		const logEntry = {
			timestamp,
			level: levelName,
			message,
			...meta,
			environment: dev ? 'development' : 'production'
		};

		return logEntry;
	}

	/**
	 * Write to console dengan colors
	 */
	writeToConsole(level, formattedMessage) {
		if (!this.enableConsole) return;

		const levelName = LOG_LEVEL_NAMES[level];
		const color = LOG_COLORS[levelName];
		const resetColor = LOG_COLORS.RESET;

		const consoleMessage = `${color}[${formattedMessage.timestamp}] ${levelName}: ${formattedMessage.message}${resetColor}`;

		// Gunakan console method yang tepat berdasarkan level
		if (level === LOG_LEVELS.ERROR) {
			console.error(consoleMessage);
			if (formattedMessage.error) {
				console.error('Error details:', formattedMessage.error);
			}
		} else if (level === LOG_LEVELS.WARN) {
			console.warn(consoleMessage);
		} else {
			console.log(consoleMessage);
		}

		// Tampilkan metadata jika ada dan significant
		const { timestamp, level: logLevel, message, environment, ...remainingMeta } = formattedMessage;
		if (Object.keys(remainingMeta).length > 0) {
			console.log('Meta:', remainingMeta);
		}
	}

	/**
	 * Write to file
	 */
	async writeToFile(level, formattedMessage) {
		if (!this.enableFile || !this.fs || !this.path || !this.logDir) return;

		try {
			// Pastikan direktori masih ada
			await this.initFileLogging();

			const today = new Date().toISOString().split('T')[0];
			const levelName = LOG_LEVEL_NAMES[level];
			const filename = `${today}-${levelName.toLowerCase()}.log`;
			const filepath = this.path.join(this.logDir, filename);

			const logLine = JSON.stringify(formattedMessage) + '\n';
			this.fs.appendFileSync(filepath, logLine, 'utf8');
		} catch (error) {
			// Fallback ke console jika file logging gagal
			console.warn('Failed to write log to file, falling back to console:', error.message);
		}
	}

	/**
	 * Generic log method
	 */
	async log(level, message, meta = {}) {
		// Cek apakah level ini harus di-log
		if (level > this.logLevel) return;

		const formattedMessage = this.formatMessage(level, message, meta);

		// Selalu write ke console
		this.writeToConsole(level, formattedMessage);

		// Write ke file jika enabled
		if (this.enableFile) {
			await this.writeToFile(level, formattedMessage);
		}
	}

	/**
	 * Error logging
	 */
	error(message, error = null, meta = {}) {
		const errorMeta = {
			...meta,
			...(error && {
				error: {
					name: error.name,
					message: error.message,
					stack: error.stack
				}
			})
		};
		this.log(LOG_LEVELS.ERROR, message, errorMeta);
	}

	/**
	 * Warning logging
	 */
	warn(message, meta = {}) {
		this.log(LOG_LEVELS.WARN, message, meta);
	}

	/**
	 * Info logging
	 */
	info(message, meta = {}) {
		this.log(LOG_LEVELS.INFO, message, meta);
	}

	/**
	 * HTTP request logging
	 */
	http(message, meta = {}) {
		this.log(LOG_LEVELS.HTTP, message, meta);
	}

	/**
	 * Debug logging
	 */
	debug(message, meta = {}) {
		this.log(LOG_LEVELS.DEBUG, message, meta);
	}

	/**
	 * API Request logging helper
	 */
	logApiRequest(method, url, statusCode, responseTime, meta = {}) {
		const level = statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.HTTP;
		const message = `${method} ${url} - ${statusCode}`;

		this.log(level, message, {
			...meta,
			method,
			url,
			statusCode,
			responseTime: `${responseTime}ms`,
			type: 'api_request'
		});
	}

	/**
	 * Authentication logging
	 */
	logAuth(event, username, success, meta = {}) {
		const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
		const message = `Auth ${event}: ${username} - ${success ? 'SUCCESS' : 'FAILED'}`;

		this.log(level, message, {
			...meta,
			event,
			username,
			success,
			type: 'authentication'
		});
	}

	/**
	 * Business logic logging
	 */
	logBusiness(action, details, meta = {}) {
		this.info(`Business Action: ${action}`, {
			...meta,
			action,
			details,
			type: 'business'
		});
	}

	/**
	 * Performance logging
	 */
	logPerformance(operation, duration, meta = {}) {
		const level = duration > 5000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
		const message = `Performance: ${operation} took ${duration}ms`;

		this.log(level, message, {
			...meta,
			operation,
			duration,
			type: 'performance'
		});
	}

	/**
	 * Security logging
	 */
	logSecurity(event, severity = 'medium', meta = {}) {
		const level = severity === 'high' ? LOG_LEVELS.ERROR : LOG_LEVELS.WARN;
		const message = `Security Event: ${event}`;

		this.log(level, message, {
			...meta,
			event,
			severity,
			type: 'security'
		});
	}
}

// Export singleton instance
export const logger = new Logger();

// Export untuk testing atau custom instances
export { Logger };
