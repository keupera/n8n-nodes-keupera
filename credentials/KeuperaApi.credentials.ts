import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KeuperaApi implements ICredentialType {
	name = 'keuperaApi';

	displayName = 'Keupera API';

	icon: Icon = 'file:keupera.svg';

	documentationUrl = 'https://docs.keupera.com/api-reference/introduction';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			placeholder: 'sk_live_xxxxxxxxxxxxxxxx',
			description: 'API key from your Keupera dashboard (requires a paid plan with API access)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.keupera.com/api/v1',
			url: '/me',
			method: 'GET',
		},
	};
}
