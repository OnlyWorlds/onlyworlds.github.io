// The OnlyWorlds docs (onlyworlds.github.io), built with Starlight.
//
// URL law (OW Infra #81): every path in contract/urls.tsv marked load-bearing serves its real
// content, 200, on this host. So pages keep their old paths and the sidebar carries the new
// structure; the navigation and the URLs are independent on purpose.
// build.format 'file' writes page.html, which GitHub Pages serves as /page and /page.html (both
// old forms). scripts/postbuild.mjs moves the pages the old site served with a trailing slash
// back to page/index.html. scripts/verify-urls.mjs checks the result against the contract.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightPageActions from 'starlight-page-actions';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://onlyworlds.github.io',
  build: { format: 'file' },
  trailingSlash: 'ignore',
  // Pages folded into others. Each is a 'page' row in contract/urls.tsv (nothing outside links it),
  // so a redirect stub is enough; load-bearing rows may never be redirected.
  redirects: {
    '/docs/tools/base-tool': '/docs/tools/legacy#base-tool',
    '/docs/tools/write-tool': '/docs/tools/legacy#write-tool',
    '/docs/tools/zoner': '/docs/tools/legacy#zoner',
    '/docs/tools/mobile-companion': '/docs/tools/legacy#mobile-companion',
    '/docs/tools/element-viewer': '/docs/tools/legacy#little-lens-element-viewer',
    '/docs/tools/history': '/docs/tools/legacy#tool-history',
    '/docs/schema/element_categories/base_properties': '/docs/schema/fields',
    '/docs/schema/element_categories/world': '/docs/schema/worlds',
  },
  integrations: [
    starlight({
      title: 'OnlyWorlds',
      description: 'Documentation for OnlyWorlds: the open schema for world data, its API, SDKs and AI tools.',
      logo: { src: './src/assets/owlogo.png', alt: 'OnlyWorlds' },
      favicon: '/assets/images/favicon.ico',
      customCss: ['./src/styles/ow.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap' } },
        // the old pages' inline icons (<span class="material-symbols-outlined">) need the icon font
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block' } },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/OnlyWorlds' },
        { icon: 'discord', label: 'Discord', href: 'https://discord.gg/twCjqvVBwb' }, // from docs/contact.md
      ],
      editLink: { baseUrl: 'https://github.com/OnlyWorlds/onlyworlds.github.io/edit/main/' },
      lastUpdated: true,
      // Structure: Skeld's #991 (h37). Slugs are the old paths where a page existed; new pages are new slugs.
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Overview', link: '/' },
            { slug: 'docs/getting-started' },
            { slug: 'docs/getting-started/keys' },
            { slug: 'docs/development' },
          ],
        },
        {
          label: 'Schema',
          items: [
            { slug: 'docs/schema' },
            { slug: 'docs/schema/worlds' },
            { slug: 'docs/schema/fields' },
            { slug: 'docs/schema/conventions' },
            { slug: 'docs/development/schema', label: 'Schema Files' },
            {
              label: 'Element Types',
              collapsed: true,
              items: [
                { slug: 'docs/schema/element_categories', label: 'All 22 Types' },
                { autogenerate: { directory: 'docs/schema/element_categories' } },
              ],
            },
          ],
        },
        {
          label: 'API',
          items: [
            { slug: 'docs/development/api-reference', label: 'Overview' },
            { slug: 'docs/development/api/reads' },
            { slug: 'docs/development/api/links' },
            { slug: 'docs/development/api/writes' },
            { slug: 'docs/development/api/changes' },
            { slug: 'docs/development/api/members' },
            { slug: 'docs/development/api/images' },
            { slug: 'docs/development/api/cors' },
            { slug: 'docs/development/api/classic' },
            { slug: 'api/errors' },
            { label: 'Interactive Reference', link: 'https://www.onlyworlds.com/api/docs' },
          ],
        },
        {
          label: 'SDKs',
          items: [
            { slug: 'docs/development/packages', label: 'Overview' },
            { slug: 'docs/development/typescript' },
            { slug: 'docs/development/python' },
          ],
        },
        {
          // Quillon's (h37 #1028): engine-neutral overview, then one page per engine SDK
          label: 'Games',
          items: [
            { slug: 'docs/development/games', label: 'Overview' },
            { slug: 'docs/development/unity', label: 'Unity' },
          ],
        },
        {
          label: 'AI Agents',
          items: [
            { slug: 'docs/development/ai', label: 'Overview' },
            { slug: 'docs/development/mcp' },
            { slug: 'docs/development/agents' },
            { slug: 'docs/development/llm-guide' },
            { slug: 'docs/development/toolkit' },
          ],
        },
        {
          label: 'Tools',
          items: [
            { slug: 'docs/tools', label: 'Overview' },
            { slug: 'docs/tools/atlas' },
            { slug: 'docs/tools/obsidian-plugin' },
            { slug: 'docs/tools/onlyworlds-com' },
            { slug: 'docs/tools/easy-mobile' },
            { slug: 'docs/tools/explorer' },
            { slug: 'docs/tools/council' },
            { slug: 'docs/tools/legacy' },
          ],
        },
        {
          label: 'Resources',
          items: [{ slug: 'docs/contact' }, { slug: 'docs/changelog' }],
        },
      ],
      plugins: [
        starlightPageActions({
          prompt: 'Read {url} and help me with OnlyWorlds.',
          actions: { chatgpt: true, claude: true, markdown: true },
        }),
        starlightLlmsTxt({
          projectName: 'OnlyWorlds',
          description: 'OnlyWorlds is an open schema for world data (22 element types with typed links), a hosted platform with a REST API v2 and an MCP server, and SDKs for TypeScript, Python and Unity.',
        }),
        starlightLinksValidator({ errorOnLocalLinks: false }),
      ],
    }),
  ],
});
