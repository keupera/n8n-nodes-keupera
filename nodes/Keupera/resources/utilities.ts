import type { INodeProperties } from 'n8n-workflow';

export const utilitiesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utilities'] } },
		options: [
			{ name: 'Verify Credentials', value: 'verifyCredentials', description: 'Return the authenticated user profile', action: 'Verify keupera credentials' },
			{ name: 'Connect CMS', value: 'connectCms', description: 'Connect a CMS integration (Framer or WordPress)', action: 'Connect CMS integration' },
			{ name: 'Track Bot Hit', value: 'trackBot', description: 'Record a bot visit (internal use)', action: 'Track bot hit' },
		],
		default: 'verifyCredentials',
	},
];

export const utilitiesFields: INodeProperties[] = [
	// ─── Verify Credentials ─────────────────────────────────────────────────────
	{
		displayName: 'Send Request',
		name: 'verifyRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['utilities'], operation: ['verifyCredentials'] } },
		routing: {
			request: { method: 'GET', url: '/me' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Connect CMS ────────────────────────────────────────────────────────────
	{
		displayName: 'CMS Type',
		name: 'cmsType',
		type: 'options',
		options: [
			{ name: 'Framer', value: 'framer' },
			{ name: 'WordPress', value: 'wordpress' },
		],
		default: 'framer',
		required: true,
		displayOptions: { show: { resource: ['utilities'], operation: ['connectCms'] } },
		routing: { request: { body: { type: '={{ $value }}' } } },
	},
	{
		displayName: 'WordPress Site URL',
		name: 'wpSiteUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com',
		description: 'Required for WordPress integrations',
		displayOptions: { show: { resource: ['utilities'], operation: ['connectCms'], cmsType: ['wordpress'] } },
		routing: { request: { body: { site_url: '={{ $value }}' } } },
	},
	{
		displayName: 'WordPress Username',
		name: 'wpUsername',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['utilities'], operation: ['connectCms'], cmsType: ['wordpress'] } },
		routing: { request: { body: { username: '={{ $value }}' } } },
	},
	{
		displayName: 'WordPress Application Password',
		name: 'wpAppPassword',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		description: 'WordPress application password (not your login password)',
		displayOptions: { show: { resource: ['utilities'], operation: ['connectCms'], cmsType: ['wordpress'] } },
		routing: { request: { body: { app_password: '={{ $value }}' } } },
	},
	{
		displayName: 'Send Request',
		name: 'connectCmsRequest',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['utilities'], operation: ['connectCms'] } },
		routing: {
			request: { method: 'POST', url: '/connect' },
			output: { postReceive: [{ type: 'rootProperty', properties: { property: 'data' } }] },
		},
	},

	// ─── Track Bot Hit ───────────────────────────────────────────────────────────
	{
		displayName: 'Bot Name',
		name: 'botName',
		type: 'string',
		default: '',
		description: 'Name of the bot (e.g. GPTBot, ClaudeBot)',
		displayOptions: { show: { resource: ['utilities'], operation: ['trackBot'] } },
		routing: { request: { body: { bot_name: '={{ $value || undefined }}' } } },
	},
	{
		displayName: 'Path',
		name: 'botPath',
		type: 'string',
		default: '',
		description: 'The page path the bot visited',
		displayOptions: { show: { resource: ['utilities'], operation: ['trackBot'] } },
		routing: {
			request: {
				method: 'POST',
				url: '/track-bot',
				body: { path: '={{ $value || undefined }}' },
			},
		},
	},
];
