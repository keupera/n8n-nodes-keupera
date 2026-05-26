import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { keywordsOperations, keywordsFields } from './resources/keywords';
import { backlinksOperations, backlinksFields } from './resources/backlinks';
import { contentOperations, contentFields } from './resources/content';
import { aiVisibilityOperations, aiVisibilityFields } from './resources/aiVisibility';
import { analyticsOperations, analyticsFields } from './resources/analytics';
import { utilitiesOperations, utilitiesFields } from './resources/utilities';

export class Keupera implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Keupera',
		name: 'keupera',
		icon: 'file:keupera.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " · " + $parameter["resource"]}}',
		description: 'Automate your SEO, AEO and GEO with Keupera.',
		defaults: {
			name: 'Keupera',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'keuperaApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://app.keupera.com/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ── Resource selector ──────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'AI Visibility', value: 'aiVisibility' },
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Backlink', value: 'backlinks' },
					{ name: 'Content', value: 'content' },
					{ name: 'Keyword', value: 'keywords' },
					{ name: 'Utility', value: 'utilities' },
				],
				default: 'keywords',
			},

			// ── Operations (one block per resource) ────────────────────────────────
			...keywordsOperations,
			...backlinksOperations,
			...contentOperations,
			...aiVisibilityOperations,
			...analyticsOperations,
			...utilitiesOperations,

			// ── Fields (one block per resource) ────────────────────────────────────
			...keywordsFields,
			...backlinksFields,
			...contentFields,
			...aiVisibilityFields,
			...analyticsFields,
			...utilitiesFields,
		],
	};
}
