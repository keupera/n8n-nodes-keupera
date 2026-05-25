# n8n-nodes-keupera

An [n8n](https://n8n.io) community node for the [Keupera](https://keupera.com) SEO, GEO and AI Visibility platform.

Automate every part of your SEO and GEO workflows with Keupera, inside n8n — keyword research, content planning, backlink outreach, AI-visibility monitoring (Brand Radar, Prompt Research), and detailed analytics.

## Resources

| Resource | Operations |
|---|---|
| **Keywords** | List, Add, Delete, Toggle Star, Bulk Update Status, Trigger Research, Poll Research Job, List Groups |
| **Backlinks** | List Campaigns, Create Campaign, Get Campaign, List Opportunities, Get Recommendations, Get Opportunity, Update Opportunity, Generate Email, Send Email |
| **Content** | List Articles, Get Article, Create Article, Update Article, Delete Article, Trigger Generation, Get Calendar, Get Automation Settings, Update Automation Settings |
| **AI Visibility** | Brand Radar List/Create/Delete/Update/Get Results; Prompt Research List/Create/Get; AI Score |
| **Analytics** | Website Summary/Daily/Top Pages/Referrers/Devices/Browsers/Geo; Search Console Daily/Keywords/Pages; Bot Traffic Summary/Daily/Top Pages |
| **Utilities** | Verify Credentials, Connect CMS, Track Bot Hit |

## Authentication

This node uses an **API Key** (Bearer token). Obtain your key from the [Keupera dashboard](https://app.keupera.com) under **Settings → Developers**.

> **Note**: each API key is bound to a single website. The `Website ID` field is optional in most cases — leave it empty to use the website your key is bound to. Only set it to override and target another website you own.

## Compatibility

- n8n >= 2.21.7
- Node.js >= 20
- Requires a Keupera paid subscription with API access enabled.

## API Reference

Full API documentation: [https://docs.keupera.com/api-reference/introduction](https://docs.keupera.com/api-reference/introduction)

## Support

We're here to help you get the most out of Keupera + n8n.

- **Email**: [ask@support.keupera.com](mailto:ask@support.keupera.com)
- **Website**: [https://keupera.com](https://keupera.com)
- **Docs**: [https://docs.keupera.com](https://docs.keupera.com)
- **Bug reports & feature requests**: [open an issue on GitHub](https://github.com/keupera/n8n-nodes-keupera/issues)
- **Community help (n8n)**: [n8n community forum](https://community.n8n.io)

When reporting a bug, please include:

1. n8n version (`Settings → Version`)
2. `n8n-nodes-keupera` version
3. The resource + operation in use
4. A screenshot or copy of the error message
5. (If possible) a workflow JSON export with credentials stripped

## Contributing

Contributions are welcome! To get a local dev environment running:

```bash
git clone https://github.com/keupera/n8n-nodes-keupera.git
cd n8n-nodes-keupera
npm install
npm run lint
npm run dev
```

Open a pull request against the `main` branch describing the change and linking any related issue.

## License

[MIT](LICENSE) © [Keupera](https://keupera.com) 2026 - present
