// src/lib/utils/breadcrumbUtils.js

/**
 * Route configuration untuk breadcrumb mapping
 * Key: route pattern, Value: display configuration
 */
export const routeConfig = {
	'/': {
		title: 'Home',
		icon: 'home',
		isHome: true
	},
	'/dashboard': {
		title: 'Dashboard',
		icon: 'dashboard'
	},
	'/atk': {
		title: 'ATK',
		icon: 'orders',
		parent: '/dashboard'
	},
	'/webservice-dc': {
		title: 'Webservice DC',
		icon: 'planogram',
		parent: '/dashboard'
	},
	'/webservice-dpd': {
		title: 'Webservice DPD',
		icon: 'orders',
		parent: '/dashboard'
	}
	// '/products/create': {
	// 	title: 'Add New Product',
	// 	icon: 'add',
	// 	parent: '/products'
	// },
	// '/products/[id]': {
	// 	title: 'Product Details',
	// 	icon: 'view',
	// 	parent: '/products',
	// 	dynamic: true
	// },
	// '/products/[id]/edit': {
	// 	title: 'Edit Product',
	// 	icon: 'edit',
	// 	parent: '/products/[id]',
	// 	dynamic: true
	// }
};

/**
 * Generate breadcrumb items dari current pathname
 * @param {string} pathname - Current page pathname
 * @param {Object} pageData - Optional page data untuk dynamic routes
 * @returns {Array} Array of breadcrumb items
 */
export function generateBreadcrumbs(pathname, pageData = {}) {
	// Handle root path
	if (pathname === '/') {
		return [
			{
				href: '/',
				title: 'Home',
				icon: 'home',
				isHome: true,
				isLast: true
			}
		];
	}

	// Find matching route config
	const matchedRoute = findMatchingRoute(pathname);
	if (!matchedRoute) {
		// Fallback untuk route yang tidak terdaftar
		return generateFallbackBreadcrumbs(pathname);
	}

	// Build breadcrumb chain
	const breadcrumbs = [];
	let currentRoute = matchedRoute;
	const processedRoutes = new Set(); // Prevent infinite loops

	// Build chain dari current route ke root
	while (currentRoute && !processedRoutes.has(currentRoute.pattern)) {
		processedRoutes.add(currentRoute.pattern);

		breadcrumbs.unshift({
			href: resolveDynamicPath(currentRoute.pattern, pathname, pageData),
			title: resolveDynamicTitle(currentRoute.config.title, pageData),
			icon: currentRoute.config.icon,
			isHome: currentRoute.config.isHome || false,
			isLast: breadcrumbs.length === 0
		});

		// Find parent route
		if (currentRoute.config.parent) {
			currentRoute = findRouteByPattern(currentRoute.config.parent);
		} else if (!currentRoute.config.isHome) {
			// Auto-add home if not present
			breadcrumbs.unshift({
				href: '/',
				title: 'Home',
				icon: 'home',
				isHome: true,
				isLast: false
			});
			break;
		} else {
			break;
		}
	}

	return breadcrumbs;
}

/**
 * Find matching route configuration
 * @param {string} pathname
 * @returns {Object|null}
 */
function findMatchingRoute(pathname) {
	// Exact match first
	if (routeConfig[pathname]) {
		return { pattern: pathname, config: routeConfig[pathname] };
	}

	// Dynamic route matching
	for (const [pattern, config] of Object.entries(routeConfig)) {
		if (config.dynamic && matchesDynamicPattern(pathname, pattern)) {
			return { pattern, config };
		}
	}

	return null;
}

/**
 * Find route config by exact pattern
 * @param {string} pattern
 * @returns {Object|null}
 */
function findRouteByPattern(pattern) {
	if (routeConfig[pattern]) {
		return { pattern, config: routeConfig[pattern] };
	}
	return null;
}

/**
 * Check if pathname matches dynamic pattern
 * @param {string} pathname
 * @param {string} pattern
 * @returns {boolean}
 */
function matchesDynamicPattern(pathname, pattern) {
	const patternParts = pattern.split('/');
	const pathParts = pathname.split('/');

	if (patternParts.length !== pathParts.length) {
		return false;
	}

	return patternParts.every((part, index) => {
		return (part.startsWith('[') && part.endsWith(']')) || part === pathParts[index];
	});
}

/**
 * Resolve dynamic path dengan actual values
 * @param {string} pattern
 * @param {string} actualPath
 * @param {Object} pageData
 * @returns {string}
 */
function resolveDynamicPath(pattern, actualPath, pageData) {
	if (!pattern.includes('[')) {
		return pattern;
	}

	// Untuk dynamic routes, return actual path
	return actualPath;
}

/**
 * Resolve dynamic title dengan page data
 * @param {string} title
 * @param {Object} pageData
 * @returns {string}
 */
function resolveDynamicTitle(title, pageData) {
	// Custom title dari page data
	if (pageData.breadcrumbTitle) {
		return pageData.breadcrumbTitle;
	}

	// Dynamic replacement
	// if (pageData.order?.id && title.includes('Products')) {
	// 	return title.replace('Products Details', `Product #${pageData.order.id}`);
	// }

	return title;
}

/**
 * Generate fallback breadcrumbs untuk unregistered routes
 * @param {string} pathname
 * @returns {Array}
 */
function generateFallbackBreadcrumbs(pathname) {
	const parts = pathname.split('/').filter(Boolean);
	const breadcrumbs = [
		{
			href: '/',
			title: 'Home',
			icon: 'home',
			isHome: true,
			isLast: false
		}
	];

	let currentPath = '';
	parts.forEach((part, index) => {
		currentPath += `/${part}`;
		breadcrumbs.push({
			href: currentPath,
			title: capitalizeFirst(part.replace(/[-_]/g, ' ')),
			icon: 'default',
			isHome: false,
			isLast: index === parts.length - 1
		});
	});

	return breadcrumbs;
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Add atau update route configuration
 * @param {string} pattern
 * @param {Object} config
 */
export function addRouteConfig(pattern, config) {
	routeConfig[pattern] = config;
}

/**
 * Get icon component name berdasarkan icon key
 * @param {string} iconKey
 * @returns {string}
 */
export function getIconComponent(iconKey) {
	const iconMap = {
		home: 'HomeOutline',
		dashboard: 'ChartPieOutline',
		products: 'ShoppingBagOutline',
		users: 'UsersOutline',
		orders: 'ClipboardListOutline',
		inventory: 'ArchiveBoxOutline',
		reports: 'DocumentChartBarOutline',
		settings: 'CogOutline',
		profile: 'UserCircleOutline',
		add: 'PlusCircleOutline',
		edit: 'PencilOutline',
		view: 'EyeOutline',
		default: 'FolderOutline'
	};

	return iconMap[iconKey] || iconMap.default;
}
