import type { INodeProperties } from 'n8n-workflow';

const WEBSITE_ID_DESCRIPTION =
	'Leave empty to use the website your API key is bound to. Only set this to override and target a different website you own.';

export const aiVisibilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['aiVisibility'] } },
		options: [
			{ name: 'Brand Radar: Create Campaign', value: 'brCreateCampaign', description: 'Create a Brand Radar campaign', action: 'Create brand radar campaign' },
			{ name: 'Brand Radar: Delete Campaign', value: 'brDeleteCampaign', description: 'Delete a Brand Radar campaign', action: 'Delete brand radar campaign' },
			{ name: 'Brand Radar: Get Results', value: 'brGetResults', description: 'Get results for a Brand Radar campaign', action: 'Get brand radar campaign results' },
			{ name: 'Brand Radar: List Campaigns', value: 'brListCampaigns', description: 'List all Brand Radar campaigns', action: 'List brand radar campaigns' },
			{ name: 'Brand Radar: Update Campaign', value: 'brUpdateCampaign', description: 'Update a Brand Radar campaign', action: 'Update brand radar campaign' },
			{ name: 'Get AI Visibility Score', value: 'getScore', description: 'Get aggregated AI visibility score', action: 'Get AI visibility score' },
			{ name: 'Prompt Research: Create Campaign', value: 'prCreateCampaign', description: 'Create a Prompt Research campaign', action: 'Create prompt research campaign' },
			{ name: 'Prompt Research: Get Details', value: 'prGetDetails', description: 'Get campaign details and results', action: 'Get prompt research campaign details' },
			{ name: 'Prompt Research: List Campaigns', value: 'prListCampaigns', description: 'List all Prompt Research campaigns', action: 'List prompt research campaigns' },
		],
		default: 'brListCampaigns',
	},
];

export const aiVisibilityFields: INodeProperties[] = [
	// ─── Shared website_id for list-style ops ───────────────────────────────────
	{
		displayName: 'Website ID',
		name: 'websiteId',
		type: 'string',
		default: '',
		description: WEBSITE_ID_DESCRIPTION,
		displayOptions: {
			show: {
				resource: ['aiVisibility'],
				operation: ['brListCampaigns', 'prListCampaigns', 'getScore'],
			},
		},
		routing: { request: { qs: { website_id: '={{ $value || undefined }}' } } },
	},

	// ─── Brand Radar: List Campaigns ────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'brListRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brListCampaigns'] } },
		routing: {
			request: { method: 'GET', url: '/brand-radar/campaigns' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Brand Radar: Create Campaign ───────────────────────────────────────────
	{
		displayName: 'Prompt',
		name: 'brPrompt',
		type: 'string',
		default: '',
		required: true,
		description: 'The search prompt / query to monitor across LLMs',
		placeholder: 'best project management tools',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brCreateCampaign'] } },
		routing: { request: { body: { prompt: '={{ $value }}' } } },
	},
	{
		displayName: 'Brands',
		name: 'brBrands',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: { brand: [{ name: '', domain: '' }] },
		required: true,
		description: 'Brands to track mentions for. At least one is required.',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brCreateCampaign'] } },
		placeholder: 'Add Brand',
		options: [
			{
				displayName: 'Brand',
				name: 'brand',
				values: [
					{
						displayName: 'Domain',
						name: 'domain',
						type: 'string',
						default: '',
						placeholder: 'mybrand.com',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						required: true,
					},
				],
			},
		],
		routing: { request: { body: { brands: '={{ $value.brand }}' } } },
	},
	{
		displayName: 'Additional Options',
		name: 'brCreateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brCreateCampaign'] } },
		options: [
			{
				displayName: 'Competitors',
				name: 'competitors',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: { competitor: [] },
				description: 'Competitors to track alongside the brand(s)',
				placeholder: 'Add Competitor',
				options: [
					{
						displayName: 'Competitor',
						name: 'competitor',
						values: [
							{
								displayName: 'Domain',
								name: 'domain',
								type: 'string',
								default: '',
								placeholder: 'competitor.com',
							},
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
				routing: { request: { body: { competitors: '={{ $value.competitor }}' } } },
			},
			{
				displayName: 'Frequency (Days)',
				name: 'frequency',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 7,
				description: 'How often (in days) the campaign runs. Default: 7.',
				routing: { request: { body: { frequency: '={{ $value }}' } } },
			},
			{
				displayName: 'Languages',
				name: 'languages',
				type: 'string',
				default: '',
				placeholder: 'en, de',
				description: 'Comma-separated language codes (max 3). Default: en.',
				routing: { request: { body: { languages: '={{ $value ? $value.split(",").map((l) => l.trim()).filter(Boolean) : undefined }}' } } },
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
			request: { method: 'POST', url: '/brand-radar/campaigns' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Brand Radar: Shared campaign ID ────────────────────────────────────────
	{
		displayName: 'Campaign ID',
		name: 'brCampaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the Brand Radar campaign',
		displayOptions: {
			show: {
				resource: ['aiVisibility'],
				operation: ['brDeleteCampaign', 'brUpdateCampaign', 'brGetResults'],
			},
		},
	},

	// Brand Radar: Delete
	{
		displayName: 'Send Request',
		name: 'brDeleteRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brDeleteCampaign'] } },
		routing: {
			request: { method: 'DELETE', url: '=/brand-radar/campaigns/{{ $parameter["brCampaignId"] }}' },
		},
	},

	// Brand Radar: Update
	{
		displayName: 'Update Fields',
		name: 'brUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brUpdateCampaign'] } },
		options: [
			{
				displayName: 'Frequency (Days)',
				name: 'frequency',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 7,
				description: 'Run frequency in days',
				routing: { request: { body: { frequency: '={{ $value }}' } } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
				],
				default: 'active',
				routing: { request: { body: { status: '={{ $value }}' } } },
			},
			{
				displayName: 'Toggle Competitor Name',
				name: 'toggle_competitor_name',
				type: 'string',
				default: '',
				description: 'Name of competitor to enable / disable tracking for',
				routing: { request: { body: { toggle_competitor: { name: '={{ $value }}' } } } },
			},
			{
				displayName: 'Toggle Competitor Disabled',
				name: 'toggle_competitor_disabled',
				type: 'boolean',
				default: false,
				description: 'Whether to disable the competitor (true = disable, false = enable). Requires Toggle Competitor Name to be set.',
				routing: { request: { body: { toggle_competitor: { disabled: '={{ $value }}' } } } },
			},
		],
		routing: {
			request: {
				method: 'PATCH',
				url: '=/brand-radar/campaigns/{{ $parameter["brCampaignId"] }}',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// Brand Radar: Get Results
	{
		displayName: 'Limit',
		name: 'brResultsLimit',
		type: 'number',
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 50,
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['brGetResults'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/brand-radar/campaigns/{{ $parameter["brCampaignId"] }}/results',
				qs: { limit: '={{ $value }}' },
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Prompt Research: List Campaigns ────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'prListRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['prListCampaigns'] } },
		routing: {
			request: { method: 'GET', url: '/prompt-research/campaigns' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Prompt Research: Create Campaign ───────────────────────────────────────
	{
		displayName: 'Custom Prompt',
		name: 'prCustomPrompt',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		description: 'The prompt to research across AI models',
		placeholder: 'What are the best SEO tools for small businesses?',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['prCreateCampaign'] } },
		routing: { request: { body: { custom_prompt: '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Options',
		name: 'prCreateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['prCreateCampaign'] } },
		options: [
			{
				displayName: 'Frequency (Days)',
				name: 'frequency',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 7,
				description: 'How often (in days) the campaign runs. Default: 7.',
				routing: { request: { body: { frequency: '={{ $value }}' } } },
			},
			{
				displayName: 'Languages',
				name: 'languages',
				type: 'string',
				default: '',
				placeholder: 'en, de',
				description: 'Comma-separated language codes (max 3). Default: en.',
				routing: { request: { body: { languages: '={{ $value ? $value.split(",").map((l) => l.trim()).filter(Boolean) : undefined }}' } } },
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
			request: { method: 'POST', url: '/prompt-research/campaigns' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Prompt Research: Get Details ───────────────────────────────────────────
	{
		displayName: 'Campaign ID',
		name: 'prCampaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the Prompt Research campaign',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['prGetDetails'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/prompt-research/campaigns/{{ $value }}',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── AI Visibility Score ─────────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'getScoreRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['aiVisibility'], operation: ['getScore'] } },
		routing: {
			request: { method: 'GET', url: '/score' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
];
