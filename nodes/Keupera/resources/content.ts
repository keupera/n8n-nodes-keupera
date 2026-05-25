import type { INodeProperties } from 'n8n-workflow';

const WEBSITE_ID_DESCRIPTION =
	'Leave empty to use the website your API key is bound to. Only set this to override and target a different website you own.';

export const contentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['content'] } },
		options: [
			{ name: 'Create Article', value: 'createArticle', action: 'Create article' },
			{ name: 'Delete Article', value: 'deleteArticle', action: 'Delete article' },
			{ name: 'Get Article', value: 'getArticle', action: 'Get article' },
			{ name: 'Get Automation Settings', value: 'getAutomation', action: 'Get automation settings' },
			{ name: 'Get Calendar', value: 'getCalendar', action: 'Get content calendar' },
			{ name: 'List Articles', value: 'listArticles', action: 'List articles' },
			{ name: 'Trigger Generation', value: 'triggerGeneration', description: 'Start AI generation for an article', action: 'Trigger article generation' },
			{ name: 'Update Article', value: 'updateArticle', action: 'Update article' },
			{ name: 'Update Automation Settings', value: 'updateAutomation', action: 'Update automation settings' },
		],
		default: 'listArticles',
	},
];

export const contentFields: INodeProperties[] = [
	// ─── Shared Website ID for list-style ops ───────────────────────────────────
	{
		displayName: 'Website ID',
		name: 'websiteId',
		type: 'string',
		default: '',
		description: WEBSITE_ID_DESCRIPTION,
		displayOptions: { show: { resource: ['content'], operation: ['listArticles', 'getCalendar', 'getAutomation'] } },
		routing: { request: { qs: { website_id: '={{ $value || undefined }}' } } },
	},

	// ─── List Articles ──────────────────────────────────────────────────────────
	{
		displayName: 'Status Filter',
		name: 'articleStatus',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'In Progress', value: 'in-progress' },
			{ name: 'Planned', value: 'planned' },
			{ name: 'Published', value: 'published' },
			{ name: 'Queued', value: 'queued' },
		],
		default: '',
		displayOptions: { show: { resource: ['content'], operation: ['listArticles'] } },
		routing: { request: { qs: { status: '={{ $value || undefined }}' } } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 200 },
		default: 50,
		displayOptions: { show: { resource: ['content'], operation: ['listArticles'] } },
		routing: { request: { qs: { limit: '={{ $value }}' } } },
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		displayOptions: { show: { resource: ['content'], operation: ['listArticles'] } },
		routing: {
			request: { method: 'GET', url: '/articles', qs: { page: '={{ $value }}' } },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Get / Update / Delete / Trigger Generation (shared Article ID) ─────────
	{
		displayName: 'Article ID',
		name: 'articleId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the article',
		displayOptions: { show: { resource: ['content'], operation: ['getArticle', 'updateArticle', 'deleteArticle', 'triggerGeneration'] } },
	},

	// Get Article
	{
		displayName: 'Send Request',
		name: 'getArticleRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['content'], operation: ['getArticle'] } },
		routing: {
			request: { method: 'GET', url: '=/articles/{{ $parameter["articleId"] }}' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Create Article (plan) ──────────────────────────────────────────────────
	{
		displayName: 'Create From',
		name: 'createFrom',
		type: 'options',
		options: [
			{ name: 'Title', value: 'title', description: 'Provide a custom article title' },
			{ name: 'Keyword', value: 'keyword', description: 'Link to a tracked keyword (recommended)' },
		],
		default: 'title',
		required: true,
		description: 'Articles must be created from either a title or a tracked keyword',
		displayOptions: { show: { resource: ['content'], operation: ['createArticle'] } },
	},
	{
		displayName: 'Title',
		name: 'articleTitle',
		type: 'string',
		default: '',
		required: true,
		description: 'Article title',
		displayOptions: { show: { resource: ['content'], operation: ['createArticle'], createFrom: ['title'] } },
		routing: { request: { body: { title: '={{ $value }}' } } },
	},
	{
		displayName: 'Keyword ID',
		name: 'articleKeywordId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of an existing tracked keyword to link this article to',
		displayOptions: { show: { resource: ['content'], operation: ['createArticle'], createFrom: ['keyword'] } },
		routing: { request: { body: { keyword_id: '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Options',
		name: 'createArticleOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['content'], operation: ['createArticle'] } },
		options: [
			{
				displayName: 'Article Type',
				name: 'article_type',
				type: 'options',
				options: [
					{ name: 'Standard', value: 'standard' },
					{ name: 'Listicle', value: 'listicle' },
					{ name: 'How-To', value: 'how-to' },
				],
				default: 'standard',
				routing: { request: { body: { article_type: '={{ $value }}' } } },
			},
			{
				displayName: 'Schedule Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Schedule publish date (YYYY-MM-DD)',
				routing: { request: { body: { date: '={{ $value ? $value.substring(0, 10) : undefined }}' } } },
			},
			{
				displayName: 'Outline',
				name: 'outline',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Outline to guide AI-assisted drafting',
				routing: { request: { body: { outline: '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Website ID',
				name: 'website_id',
				type: 'string',
				default: '',
				description: WEBSITE_ID_DESCRIPTION,
				routing: { request: { body: { website_id: '={{ $value || undefined }}' } } },
			},
		],
		routing: {
			request: { method: 'POST', url: '/articles' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Update Article ─────────────────────────────────────────────────────────
	{
		displayName: 'Update Fields',
		name: 'updateArticleFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['content'], operation: ['updateArticle'] } },
		options: [
			{
				displayName: 'Article Type',
				name: 'article_type',
				type: 'options',
				options: [
					{ name: 'How-To', value: 'how-to' },
					{ name: 'Listicle', value: 'listicle' },
					{ name: 'Standard', value: 'standard' },
				],
				default: 'standard',
				routing: { request: { body: { article_type: '={{ $value }}' } } },
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 10 },
				default: '',
				description: 'Full article body (HTML)',
				routing: { request: { body: { content: '={{ $value }}' } } },
			},
			{
				displayName: 'Date (Shortcut)',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Convenience field — sets both Published At and Scheduled Publish At at once. ISO timestamp or YYYY-MM-DD.',
				routing: { request: { body: { date: '={{ $value }}' } } },
			},
			{
				displayName: 'Featured Image URL',
				name: 'featured_image',
				type: 'string',
				default: '',
				description: 'Cover image URL',
				routing: { request: { body: { featured_image: '={{ $value }}' } } },
			},
			{
				displayName: 'Meta Description',
				name: 'meta_description',
				type: 'string',
				typeOptions: { rows: 2 },
				default: '',
				routing: { request: { body: { meta_description: '={{ $value }}' } } },
			},
			{
				displayName: 'Published At',
				name: 'published_at',
				type: 'dateTime',
				default: '',
				description: 'Actual publish timestamp (ISO)',
				routing: { request: { body: { published_at: '={{ $value }}' } } },
			},
			{
				displayName: 'Scheduled Publish At',
				name: 'scheduled_publish_at',
				type: 'dateTime',
				default: '',
				description: 'When the article should be auto-published (ISO timestamp)',
				routing: { request: { body: { scheduled_publish_at: '={{ $value }}' } } },
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				default: '',
				description: 'URL slug',
				routing: { request: { body: { slug: '={{ $value }}' } } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Completed', value: 'completed' },
					{ name: 'In Progress', value: 'in-progress' },
					{ name: 'Planned', value: 'planned' },
					{ name: 'Published', value: 'published' },
					{ name: 'Queued', value: 'queued' },
				],
				default: 'planned',
				routing: { request: { body: { status: '={{ $value }}' } } },
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				routing: { request: { body: { title: '={{ $value }}' } } },
			},
		],
		routing: {
			request: { method: 'PATCH', url: '=/articles/{{ $parameter["articleId"] }}' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Delete Article ─────────────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'deleteArticleRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['content'], operation: ['deleteArticle'] } },
		routing: {
			request: { method: 'DELETE', url: '=/articles/{{ $parameter["articleId"] }}' },
		},
	},

	// ─── Trigger Generation ─────────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'triggerGenRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['content'], operation: ['triggerGeneration'] } },
		routing: {
			request: { method: 'POST', url: '=/articles/{{ $parameter["articleId"] }}/generate' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Get Calendar ───────────────────────────────────────────────────────────
	{
		displayName: 'Start Date',
		name: 'calStart',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Calendar window start (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['content'], operation: ['getCalendar'] } },
		routing: { request: { qs: { start: '={{ $value ? $value.substring(0, 10) : undefined }}' } } },
	},
	{
		displayName: 'End Date',
		name: 'calEnd',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Calendar window end (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['content'], operation: ['getCalendar'] } },
		routing: {
			request: {
				method: 'GET',
				url: '/articles/calendar',
				qs: { end: '={{ $value ? $value.substring(0, 10) : undefined }}' },
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Get Automation Settings ────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'getAutoRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['content'], operation: ['getAutomation'] } },
		routing: {
			request: { method: 'GET', url: '/automation' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Update Automation Settings ─────────────────────────────────────────────
	{
		displayName: 'Update Fields',
		name: 'automationSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: { show: { resource: ['content'], operation: ['updateAutomation'] } },
		options: [
			{
				displayName: 'Auto-Generate Articles',
				name: 'auto_generate',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-generate articles when planned',
				routing: { request: { body: { auto_generate: '={{ $value }}' } } },
			},
			{
				displayName: 'Auto-Plan Blog Posts',
				name: 'auto_plan_blog_posts',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-plan tracked keywords into articles',
				routing: { request: { body: { auto_plan_blog_posts: '={{ $value }}' } } },
			},
			{
				displayName: 'Auto-Plan Interval',
				name: 'auto_plan_interval',
				type: 'options',
				options: [
					{ name: 'Daily', value: 'daily' },
					{ name: 'Mon / Wed / Fri', value: 'mon_wed_fri' },
					{ name: 'Weekdays', value: 'weekdays' },
					{ name: 'Weekly', value: 'weekly' },
				],
				default: 'mon_wed_fri',
				routing: { request: { body: { auto_plan_interval: '={{ $value }}' } } },
			},
			{
				displayName: 'Auto-Promote on Social',
				name: 'auto_promote',
				type: 'boolean',
				default: false,
				routing: { request: { body: { auto_promote: '={{ $value }}' } } },
			},
			{
				displayName: 'Auto-Publish',
				name: 'auto_publish',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-publish articles when they finish generation',
				routing: { request: { body: { auto_publish: '={{ $value }}' } } },
			},
			{
				displayName: 'Auto-YouTube Videos',
				name: 'auto_youtube',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-generate matching YouTube videos for articles',
				routing: { request: { body: { auto_youtube: '={{ $value }}' } } },
			},
			{
				displayName: 'Track Bot Traffic',
				name: 'track_bot_traffic',
				type: 'boolean',
				default: false,
				description: 'Whether to track AI bot visits on the website',
				routing: { request: { body: { track_bot_traffic: '={{ $value }}' } } },
			},
			{
				displayName: 'Website ID',
				name: 'website_id',
				type: 'string',
				default: '',
				description: WEBSITE_ID_DESCRIPTION,
				routing: { request: { body: { website_id: '={{ $value || undefined }}' } } },
			},
		],
		routing: {
			request: { method: 'PATCH', url: '/automation' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
];
