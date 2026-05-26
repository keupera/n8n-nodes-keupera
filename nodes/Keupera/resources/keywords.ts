import {
	NodeApiError,
	type IExecuteSingleFunctions,
	type INodeExecutionData,
	type INodeProperties,
} from 'n8n-workflow';

/**
 * Map an internal Keupera job error string to a user-friendly message.
 * Internal stack-trace-style errors (e.g. "supabase.rpc(...).catch is not a function")
 * are unhelpful to n8n users, so we translate the most common cases.
 */
function friendlyJobErrorMessage(rawError: string): string {
	const e = (rawError || '').toString();
	if (!e) return 'Keyword research failed without an error message. Please contact support@keupera.com.';
	if (/catch is not a function|supabase\.rpc|TypeError|ReferenceError|undefined is not/i.test(e)) {
		return 'Keyword research failed due to an internal Keupera service error. Please retry, and if the issue persists contact support@keupera.com with the job ID.';
	}
	if (/exhausted|credit limit|usage cap|limit reached|quota/i.test(e)) {
		return 'Keyword research failed because your Keupera crawl credit limit was reached. Upgrade your plan or enable metered billing in your Keupera dashboard.';
	}
	if (/timeout|timed out|deadline/i.test(e)) {
		return 'Keyword research timed out. Try a smaller batch of seed keywords or retry shortly.';
	}
	if (/not found|404/i.test(e)) {
		return 'Keyword research job could not be processed: a required resource was not found. Verify your Website ID and seed keywords.';
	}
	// Default: surface the raw error but make it readable.
	return `Keyword research failed: ${e}`;
}

async function handlePollResearchResponse(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	for (const item of items) {
		const job = item.json as { id?: string; status?: string; error?: string } | undefined;
		if (job?.status === 'failed') {
			throw new NodeApiError(this.getNode(), {
				message: friendlyJobErrorMessage(job.error || ''),
				description: `Job ID: ${job.id ?? 'unknown'} · Raw error: ${job.error ?? 'none'}`,
			});
		}
	}
	return items;
}

const WEBSITE_ID_DESCRIPTION =
	'Leave empty to use the website your API key is bound to. Only set this to override and target a different website you own.';

export const keywordsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['keywords'] } },
		options: [
			{ name: 'Add', value: 'add', description: 'Add one or more keywords', action: 'Add keywords' },
			{ name: 'Bulk Update Status', value: 'bulkUpdateStatus', description: 'Set status on multiple keywords', action: 'Bulk update keyword status' },
			{ name: 'Delete', value: 'delete', description: 'Delete keywords by ID', action: 'Delete keywords' },
			{ name: 'List', value: 'list', description: 'List all tracked keywords', action: 'List keywords' },
			{ name: 'List Groups', value: 'listGroups', description: 'List all keyword groups', action: 'List keyword groups' },
			{ name: 'Poll Research Job', value: 'pollResearch', description: 'Check status of a research job', action: 'Poll keyword research job' },
			{ name: 'Toggle Star', value: 'toggleStar', description: 'Star or unstar a keyword', action: 'Toggle keyword star' },
			{ name: 'Trigger Research', value: 'triggerResearch', description: 'Start a keyword research job', action: 'Trigger keyword research' },
		],
		default: 'list',
	},
];

export const keywordsFields: INodeProperties[] = [
	// ─── List ───────────────────────────────────────────────────────────────────
	{
		displayName: 'Website ID',
		name: 'websiteId',
		type: 'string',
		default: '',
		description: WEBSITE_ID_DESCRIPTION,
		displayOptions: { show: { resource: ['keywords'], operation: ['list', 'listGroups'] } },
		routing: { request: { qs: { website_id: '={{ $value || undefined }}' } } },
	},
	{
		displayName: 'Status Filter',
		name: 'statusFilter',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Active', value: 'active' },
			{ name: 'Ignored', value: 'ignored' },
			{ name: 'Planned', value: 'planned' },
		],
		default: '',
		displayOptions: { show: { resource: ['keywords'], operation: ['list'] } },
		routing: { request: { qs: { status: '={{ $value || undefined }}' } } },
	},
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		description: 'Filter by keyword group UUID',
		displayOptions: { show: { resource: ['keywords'], operation: ['list'] } },
		routing: { request: { qs: { group_id: '={{ $value || undefined }}' } } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		description: 'Max number of results to return',
		typeOptions: { minValue: 1, maxValue: 500 },
		default: 50,
		displayOptions: { show: { resource: ['keywords'], operation: ['list'] } },
		routing: { request: { qs: { limit: '={{ $value }}' } } },
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1,
		displayOptions: { show: { resource: ['keywords'], operation: ['list'] } },
		routing: {
			request: {
				method: 'GET',
				url: '/keywords',
				qs: { page: '={{ $value }}' },
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── List Groups (no extra fields, just send request) ───────────────────────
	{
		displayName: 'Send Request',
		name: 'listGroupsRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['keywords'], operation: ['listGroups'] } },
		routing: {
			request: { method: 'GET', url: '/keywords/groups' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Add ────────────────────────────────────────────────────────────────────
	{
		displayName: 'Keywords',
		name: 'keywordsToAdd',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: { keyword: [{ term: '' }] },
		required: true,
		description: 'One or more keywords to add. Add a row per keyword.',
		displayOptions: { show: { resource: ['keywords'], operation: ['add'] } },
		placeholder: 'Add Keyword',
		options: [
			{
				displayName: 'Keyword',
				name: 'keyword',
				values: [
					{
						displayName: 'CPC',
						name: 'cpc',
						type: 'number',
						default: 0,
						description: 'Cost per click',
					},
					{
						displayName: 'Difficulty',
						name: 'difficulty',
						type: 'number',
						default: 0,
						description: 'Keyword difficulty (0-100)',
					},
					{
						displayName: 'Funnel Stage',
						name: 'funnel_stage',
						type: 'options',
						options: [
							{ name: 'Awareness', value: 'awareness' },
							{ name: 'Consideration', value: 'consideration' },
							{ name: 'Decision', value: 'decision' },
						],
						default: 'consideration',
					},
					{
						displayName: 'Intent',
						name: 'intent',
						type: 'string',
						default: '',
						description: 'Search intent (e.g. Commercial, Informational)',
					},
					{
						displayName: 'Keyword Group',
						name: 'keyword_group',
						type: 'string',
						default: '',
						description: 'Group name. Auto-created if it does not exist.',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'en',
						description: 'Language code (e.g. en, fr)',
					},
					{
						displayName: 'Opportunity',
						name: 'opportunity',
						type: 'options',
						options: [
							{ name: 'High', value: 'High' },
							{ name: 'Low', value: 'Low' },
							{ name: 'Medium', value: 'Medium' },
						],
						default: 'Medium',
					},
					{
						displayName: 'Term',
						name: 'term',
						type: 'string',
						default: '',
						required: true,
						description: 'The keyword term',
					},
					{
						displayName: 'Volume',
						name: 'volume',
						type: 'number',
						default: 0,
						description: 'Search volume. Auto-filled if Enrich is enabled.',
					},
				],
			},
		],
		routing: {
			request: {
				body: {
					keywords:
						'={{ $value.keyword.map(k => Object.fromEntries(Object.entries(k).filter(([_, v]) => v !== "" && v !== 0))) }}',
				},
			},
		},
	},
	{
		displayName: 'Additional Options',
		name: 'addKeywordsOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['keywords'], operation: ['add'] } },
		options: [
			{
				displayName: 'Enrich',
				name: 'enrich',
				type: 'boolean',
				default: false,
				description: 'Whether to auto-enrich keywords with volume/difficulty data (uses crawl credits)',
				routing: { request: { body: { enrich: '={{ $value }}' } } },
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
			request: {
				method: 'POST',
				url: '/keywords',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Delete ─────────────────────────────────────────────────────────────────
	{
		displayName: 'Keyword IDs',
		name: 'keywordIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of keyword UUIDs to delete',
		displayOptions: { show: { resource: ['keywords'], operation: ['delete'] } },
		routing: { request: { body: { ids: '={{ $value.split(",").map((id) => id.trim()).filter(Boolean) }}' } } },
	},
	{
		displayName: 'Website ID',
		name: 'deleteWebsiteId',
		type: 'string',
		default: '',
		description: WEBSITE_ID_DESCRIPTION,
		displayOptions: { show: { resource: ['keywords'], operation: ['delete'] } },
		routing: {
			request: {
				method: 'DELETE',
				url: '/keywords',
				body: { website_id: '={{ $value || undefined }}' },
			},
		},
	},

	// ─── Toggle Star ────────────────────────────────────────────────────────────
	{
		displayName: 'Keyword ID',
		name: 'keywordId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the keyword to star/unstar',
		displayOptions: { show: { resource: ['keywords'], operation: ['toggleStar'] } },
	},
	{
		displayName: 'Starred',
		name: 'isStarred',
		type: 'boolean',
		default: true,
		description: 'Whether to mark the keyword as starred',
		displayOptions: { show: { resource: ['keywords'], operation: ['toggleStar'] } },
		routing: {
			request: {
				method: 'PATCH',
				url: '=/keywords/{{ $parameter["keywordId"] }}/star',
				body: { is_starred: '={{ $value }}' },
			},
		},
	},

	// ─── Bulk Update Status ─────────────────────────────────────────────────────
	{
		displayName: 'Keyword IDs',
		name: 'bulkIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated list of keyword UUIDs',
		displayOptions: { show: { resource: ['keywords'], operation: ['bulkUpdateStatus'] } },
		routing: { request: { body: { ids: '={{ $value.split(",").map((id) => id.trim()).filter(Boolean) }}' } } },
	},
	{
		displayName: 'New Status',
		name: 'newStatus',
		type: 'options',
		options: [
			{ name: 'Active', value: 'active' },
			{ name: 'Ignored', value: 'ignored' },
			{ name: 'Planned', value: 'planned' },
		],
		default: 'active',
		required: true,
		displayOptions: { show: { resource: ['keywords'], operation: ['bulkUpdateStatus'] } },
		routing: {
			request: {
				method: 'PATCH',
				url: '/keywords/status',
				body: { status: '={{ $value }}' },
			},
		},
	},

	// ─── Trigger Research ───────────────────────────────────────────────────────
	{
		displayName: 'Seed Keywords',
		name: 'seedKeywords',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated seed terms to expand from',
		placeholder: 'seo tools, content marketing',
		displayOptions: { show: { resource: ['keywords'], operation: ['triggerResearch'] } },
		routing: { request: { body: { seed_keywords: '={{ $value.split(",").map((k) => k.trim()).filter(Boolean) }}' } } },
	},
	{
		displayName: 'Additional Options',
		name: 'researchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['keywords'], operation: ['triggerResearch'] } },
		options: [
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				placeholder: 'US',
				description: 'Country code (e.g. US, GB)',
				routing: { request: { body: { country: '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'en',
				description: 'Language code (e.g. en, fr)',
				routing: { request: { body: { language: '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Sync (Wait Inline)',
				name: 'sync',
				type: 'boolean',
				default: false,
				description: 'Whether to wait inline for the result. Not recommended — subject to gateway timeouts. Use Poll Research Job instead.',
				routing: { request: { body: { sync: '={{ $value }}' } } },
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
			request: {
				method: 'POST',
				url: '/keywords/research',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Poll Research Job ──────────────────────────────────────────────────────
	{
		displayName: 'Job ID',
		name: 'researchJobId',
		type: 'string',
		default: '',
		required: true,
		description: 'The research job ID returned by Trigger Research',
		displayOptions: { show: { resource: ['keywords'], operation: ['pollResearch'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/keywords/research/{{ $value }}',
			},
			output: {
				postReceive: [
					{ type: 'rootProperty', properties: { property: 'data' } },
					handlePollResearchResponse,
				],
			},
		},
	},
];
