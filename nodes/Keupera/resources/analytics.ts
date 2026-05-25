import type { INodeProperties } from 'n8n-workflow';

const dateRangeFields = (showOps: string[]): INodeProperties[] => [
	{
		displayName: 'Date Range',
		name: 'range',
		type: 'options',
		options: [
			{ name: '7 Days', value: '7d' },
			{ name: '30 Days (Default)', value: '30d' },
			{ name: '90 Days', value: '90d' },
			{ name: 'Custom', value: 'custom' },
		],
		default: '30d',
		displayOptions: { show: { resource: ['analytics'], operation: showOps } },
		routing: {
			request: { qs: { range: '={{ $value !== "custom" ? $value : undefined }}' } },
		},
	},
	{
		displayName: 'From Date',
		name: 'fromDate',
		type: 'dateTime',
		default: '',
		description: 'Start date (YYYY-MM-DD) — only used when Date Range is Custom',
		displayOptions: { show: { resource: ['analytics'], operation: showOps, range: ['custom'] } },
		routing: { request: { qs: { from: '={{ $value ? $value.substring(0, 10) : undefined }}' } } },
	},
	{
		displayName: 'To Date',
		name: 'toDate',
		type: 'dateTime',
		default: '',
		description: 'End date (YYYY-MM-DD) — only used when Date Range is Custom',
		displayOptions: { show: { resource: ['analytics'], operation: showOps, range: ['custom'] } },
		routing: { request: { qs: { to: '={{ $value ? $value.substring(0, 10) : undefined }}' } } },
	},
];

const allAnalyticsOps = [
	'websiteSummary', 'websiteDaily', 'websiteTopPages', 'websiteReferrers',
	'websiteDevices', 'websiteBrowsers', 'websiteGeo',
	'scDaily', 'scKeywords', 'scPages',
	'botSummary', 'botDaily', 'botTopPages',
];

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{ name: 'Bot Traffic: Daily', value: 'botDaily', description: 'Day-by-day bot traffic', action: 'Get bot traffic daily' },
			{ name: 'Bot Traffic: Summary', value: 'botSummary', description: 'AI & search bot visit summary', action: 'Get bot traffic summary' },
			{ name: 'Bot Traffic: Top Pages', value: 'botTopPages', description: 'Most bot-crawled pages', action: 'Get bot traffic top pages' },
			{ name: 'Search Console: Daily Stats', value: 'scDaily', description: 'Daily clicks, impressions, CTR, position', action: 'Get search console daily stats' },
			{ name: 'Search Console: Top Keywords', value: 'scKeywords', description: 'Top keywords from Search Console', action: 'Get search console top keywords' },
			{ name: 'Search Console: Top Pages', value: 'scPages', description: 'Top pages from Search Console', action: 'Get search console top pages' },
			{ name: 'Website: Browser Breakdown', value: 'websiteBrowsers', description: 'Browser share', action: 'Get website browser breakdown' },
			{ name: 'Website: Daily Traffic', value: 'websiteDaily', description: 'Day-by-day traffic breakdown', action: 'Get website daily traffic' },
			{ name: 'Website: Device Breakdown', value: 'websiteDevices', description: 'Desktop / mobile / tablet split', action: 'Get website device breakdown' },
			{ name: 'Website: Geographic Traffic', value: 'websiteGeo', description: 'Traffic by country', action: 'Get website geographic traffic' },
			{ name: 'Website: Referrers', value: 'websiteReferrers', description: 'Traffic sources / referrers', action: 'Get website referrers' },
			{ name: 'Website: Summary', value: 'websiteSummary', description: 'Overall traffic summary', action: 'Get website analytics summary' },
			{ name: 'Website: Top Pages', value: 'websiteTopPages', description: 'Most-visited pages', action: 'Get website top pages' },
		],
		default: 'websiteSummary',
	},
];

export const analyticsFields: INodeProperties[] = [
	// ─── Shared website_id ──────────────────────────────────────────────────────
	{
		displayName: 'Website ID',
		name: 'websiteId',
		type: 'string',
		default: '',
		description: 'Leave empty to use the website your API key is bound to. Only set this to override and target a different website you own.',
		displayOptions: { show: { resource: ['analytics'], operation: allAnalyticsOps } },
		routing: { request: { qs: { website_id: '={{ $value || undefined }}' } } },
	},

	// ─── Shared date range ──────────────────────────────────────────────────────
	...dateRangeFields(allAnalyticsOps),

	// ─── Limit (for top-N endpoints) ────────────────────────────────────────────
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['websiteTopPages', 'websiteReferrers', 'scKeywords', 'scPages', 'botTopPages'],
			},
		},
		routing: { request: { qs: { limit: '={{ $value }}' } } },
	},

	// ─── Per-operation routing notices ──────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'websiteSummaryReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteSummary'] } },
		routing: {
			request: { method: 'GET', url: '/website/summary' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteDailyReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteDaily'] } },
		routing: {
			request: { method: 'GET', url: '/website/daily' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteTopPagesReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteTopPages'] } },
		routing: {
			request: { method: 'GET', url: '/website/top-pages' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteReferrersReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteReferrers'] } },
		routing: {
			request: { method: 'GET', url: '/website/referrers' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteDevicesReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteDevices'] } },
		routing: {
			request: { method: 'GET', url: '/website/devices' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteBrowsersReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteBrowsers'] } },
		routing: {
			request: { method: 'GET', url: '/website/browsers' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'websiteGeoReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['websiteGeo'] } },
		routing: {
			request: { method: 'GET', url: '/website/geo' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'scDailyReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['scDaily'] } },
		routing: {
			request: { method: 'GET', url: '/search-console/daily' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'scKeywordsReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['scKeywords'] } },
		routing: {
			request: { method: 'GET', url: '/search-console/keywords' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'scPagesReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['scPages'] } },
		routing: {
			request: { method: 'GET', url: '/search-console/pages' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'botSummaryReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['botSummary'] } },
		routing: {
			request: { method: 'GET', url: '/bot-traffic/summary' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'botDailyReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['botDaily'] } },
		routing: {
			request: { method: 'GET', url: '/bot-traffic/daily' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Send Request',
		name: 'botTopPagesReq',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['analytics'], operation: ['botTopPages'] } },
		routing: {
			request: { method: 'GET', url: '/bot-traffic/top-pages' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
];
