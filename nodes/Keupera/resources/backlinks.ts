import type { INodeProperties } from 'n8n-workflow';

const WEBSITE_ID_DESCRIPTION =
	'Leave empty to use the website your API key is bound to. Only set this to override and target a different website you own.';

export const backlinksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['backlinks'] } },
		options: [
			{ name: 'Create Campaign', value: 'createCampaign', description: 'Create a new backlink campaign', action: 'Create backlink campaign' },
			{ name: 'Generate Outreach Email', value: 'generateEmail', description: 'AI-generate an outreach email for an opportunity', action: 'Generate outreach email' },
			{ name: 'Get Campaign', value: 'getCampaign', description: 'Get details of a campaign', action: 'Get backlink campaign' },
			{ name: 'Get Opportunity', value: 'getOpportunity', description: 'Get a single opportunity', action: 'Get backlink opportunity' },
			{ name: 'Get Recommendations', value: 'getRecommendations', description: 'Get strategic recommendations for a campaign', action: 'Get campaign recommendations' },
			{ name: 'List Campaigns', value: 'listCampaigns', description: 'List all backlink campaigns', action: 'List backlink campaigns' },
			{ name: 'List Opportunities', value: 'listOpportunities', description: 'List opportunities for a campaign', action: 'List campaign opportunities' },
			{ name: 'Send Outreach Email', value: 'sendEmail', description: 'Send the outreach email for an opportunity', action: 'Send outreach email' },
			{ name: 'Update Opportunity', value: 'updateOpportunity', description: 'Update an opportunity', action: 'Update backlink opportunity' },
		],
		default: 'listCampaigns',
	},
];

export const backlinksFields: INodeProperties[] = [
	// ─── List Campaigns ─────────────────────────────────────────────────────────
	{
		displayName: 'Website ID',
		name: 'websiteId',
		type: 'string',
		default: '',
		description: WEBSITE_ID_DESCRIPTION,
		displayOptions: { show: { resource: ['backlinks'], operation: ['listCampaigns'] } },
		routing: {
			request: {
				method: 'GET',
				url: '/campaigns',
				qs: { website_id: '={{ $value || undefined }}' },
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Create Campaign ────────────────────────────────────────────────────────
	{
		displayName: 'Target Keyword',
		name: 'campaignKeyword',
		type: 'string',
		default: '',
		required: true,
		description: 'Target keyword for backlink research',
		displayOptions: { show: { resource: ['backlinks'], operation: ['createCampaign'] } },
		routing: { request: { body: { keyword: '={{ $value }}' } } },
	},
	{
		displayName: 'Niche',
		name: 'campaignNiche',
		type: 'string',
		default: '',
		required: true,
		description: 'Industry / niche context (e.g. "Digital Marketing")',
		displayOptions: { show: { resource: ['backlinks'], operation: ['createCampaign'] } },
		routing: { request: { body: { niche: '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Options',
		name: 'createCampaignOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['backlinks'], operation: ['createCampaign'] } },
		options: [
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				placeholder: 'en',
				description: 'Language code. Defaults to website language.',
				routing: { request: { body: { language: '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Target Domain',
				name: 'target_domain',
				type: 'string',
				default: '',
				placeholder: 'myblog.com',
				description: 'Domain to research backlinks for. Defaults to the website\'s own domain. Useful when researching backlinks for a different domain (e.g. a subdomain or partner site).',
				routing: { request: { body: { target_domain: '={{ $value || undefined }}' } } },
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
				url: '/campaigns',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Get Campaign / List Opportunities / Get Recommendations (shared ID) ────
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the backlink campaign',
		displayOptions: { show: { resource: ['backlinks'], operation: ['getCampaign'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/campaigns/{{ $value }}',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Campaign ID',
		name: 'oppCampaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the backlink campaign',
		displayOptions: { show: { resource: ['backlinks'], operation: ['listOpportunities'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/campaigns/{{ $value }}/opportunities',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
	{
		displayName: 'Campaign ID',
		name: 'recCampaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the backlink campaign',
		displayOptions: { show: { resource: ['backlinks'], operation: ['getRecommendations'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/campaigns/{{ $value }}/recommendations',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Opportunity-level shared ID ────────────────────────────────────────────
	{
		displayName: 'Opportunity ID',
		name: 'opportunityId',
		type: 'string',
		default: '',
		required: true,
		description: 'UUID of the opportunity',
		displayOptions: { show: { resource: ['backlinks'], operation: ['getOpportunity', 'updateOpportunity', 'generateEmail', 'sendEmail'] } },
	},

	// ─── Get Opportunity ────────────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'getOppRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['backlinks'], operation: ['getOpportunity'] } },
		routing: {
			request: {
				method: 'GET',
				url: '=/opportunities/{{ $parameter["opportunityId"] }}',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Update Opportunity ─────────────────────────────────────────────────────
	{
		displayName: 'Update Fields',
		name: 'updateOpportunityFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['backlinks'], operation: ['updateOpportunity'] } },
		options: [
			{
				displayName: 'Contact Email',
				name: 'contact_email',
				type: 'string',
				default: '',
				placeholder: 'editor@target-site.com',
				routing: { request: { body: { contact_email: '={{ $value }}' } } },
			},
			{
				displayName: 'Contact Name',
				name: 'contact_name',
				type: 'string',
				default: '',
				routing: { request: { body: { contact_name: '={{ $value }}' } } },
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				routing: { request: { body: { notes: '={{ $value }}' } } },
			},
			{
				displayName: 'Outreach Status',
				name: 'outreach_status',
				type: 'string',
				default: '',
				placeholder: 'email_sent',
				description: 'Outreach progress status (free-text, e.g. "email_sent", "replied", "won")',
				routing: { request: { body: { outreach_status: '={{ $value }}' } } },
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Contacted', value: 'contacted' },
					{ name: 'Ignored', value: 'ignored' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'Lost', value: 'lost' },
					{ name: 'New', value: 'new' },
					{ name: 'Won', value: 'won' },
				],
				default: 'new',
				routing: { request: { body: { status: '={{ $value }}' } } },
			},
		],
		routing: {
			request: {
				method: 'PATCH',
				url: '=/opportunities/{{ $parameter["opportunityId"] }}',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Generate Outreach Email ────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'genEmailRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['backlinks'], operation: ['generateEmail'] } },
		routing: {
			request: {
				method: 'POST',
				url: '=/opportunities/{{ $parameter["opportunityId"] }}/generate-email',
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Send Outreach Email ────────────────────────────────────────────────────
	{
		displayName: 'To Email',
		name: 'toEmail',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'editor@target-site.com',
		description: 'Recipient email address',
		displayOptions: { show: { resource: ['backlinks'], operation: ['sendEmail'] } },
		routing: { request: { body: { to_email: '={{ $value }}' } } },
	},
	{
		displayName: 'Subject',
		name: 'emailSubject',
		type: 'string',
		default: '',
		required: true,
		description: 'Email subject line',
		displayOptions: { show: { resource: ['backlinks'], operation: ['sendEmail'] } },
		routing: { request: { body: { subject: '={{ $value }}' } } },
	},
	{
		displayName: 'Body (Plain Text)',
		name: 'emailBodyText',
		type: 'string',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		description: 'Plain text email body',
		displayOptions: { show: { resource: ['backlinks'], operation: ['sendEmail'] } },
		routing: { request: { body: { body_text: '={{ $value }}' } } },
	},
	{
		displayName: 'Body (HTML)',
		name: 'emailBodyHtml',
		type: 'string',
		typeOptions: { rows: 8 },
		default: '',
		description: 'Optional HTML email body',
		displayOptions: { show: { resource: ['backlinks'], operation: ['sendEmail'] } },
		routing: {
			request: {
				method: 'POST',
				url: '=/opportunities/{{ $parameter["opportunityId"] }}/send-email',
				body: { body_html: '={{ $value || undefined }}' },
			},
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},
];
