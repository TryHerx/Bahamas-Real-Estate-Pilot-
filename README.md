# Bahamas Real Estate Pilot

A branded production dashboard for the Bahamas Real Estate media project, prepared for GitHub and Netlify. Uploading this repository does not publish the dashboard or connect a custom domain.

## Included

- 29 property briefs: 20 Nassau / Paradise Island listings and three each in Abaco, Eleuthera and Exuma.
- 12 community guides and 12 proposed filming blocks.
- 115 draft video scripts and captions, including The Rum Club feature.
- 18 Buying in The Bahamas FAQ answers and a full-session script.
- Shot checklists, production stages, take notes and teleprompter controls.
- Autosaving notes for each dashboard module, property, community, shoot route and FAQ/script. Property production notes stay separate from agent-confirmation details; FAQ and script notes use the same take log.
- A nine-week draft release queue.
- The master Word plan, Excel production tracker and planning map.

## Netlify setup

Import this GitHub repository into Netlify, or link it to your existing Netlify project. Use the `main` branch. The root `netlify.toml` provides:

| Setting | Value |
| --- | --- |
| Base directory | Repository root (leave blank) |
| Build command | `node build.mjs && node check.mjs` |
| Publish directory | `dist` |
| Node version | `22` |

No environment secrets, package installation or database are required for this version. Deploy only when ready to make the dashboard accessible. This static application has no built-in sign-in; a private GitHub repository does not make the deployed website private. Configure the intended site access before sharing an internal workspace.

After deployment, add your chosen domain or subdomain in Netlify. Use the exact DNS records shown for that project at the provider managing your DNS. Domain registration and DNS management can remain with your existing provider. No domain or DNS records are configured by this repository.

Reference: https://docs.netlify.com/build/configure-builds/file-based-configuration/

## Local build and checks

Requires Node.js 22. Run from the repository root:

```sh
node build.mjs
node check.mjs
```

The build inlines the stylesheet, application and catalogue into `dist/index.html`. Upload the entire `dist` directory when deploying manually so the document downloads remain available. Google Fonts load without blocking the dashboard, and embedded maps load only when requested. Both need internet access; core dashboard content is bundled. The catalogue is compacted in the generated HTML to reduce the initial transfer size.

## Editing

- `index.template.html`: page title, navigation shell and layout structure.
- `dist/assets/styles.css`: palette, typography and responsive styling.
- `dist/assets/app.js`: views, filtering, progress and teleprompter behaviour.
- `dist/assets/production.json`: property, community, script and route catalogue.
- `dist/downloads/`: Word, Excel and map files.
- `build.mjs`: standalone HTML generation.
- `check.mjs`: automated application checks.

Edit the sources, then rebuild. Do not edit the generated `dist/index.html` directly. The `dist/assets` files are source inputs and intentionally tracked.

## Brand and data

Dashboard title: **Bahamas Real Estate Pilot**. Palette: Midnight Navy `#071B2C`, Coldwell Banker Blue `#012169`, Deep Ocean `#123F43`, Warm Ivory `#F4F0E8`, Champagne `#B5A17A`. Display type: Bodoni Moda; body type: Roboto, both with local fallbacks.

The public listing research snapshot is dated **16 November 2026**. Confirm current availability, price/currency, representation, specifications, permissions and property access before filming or publication. Public Coldwell Banker pages include syndicated IDX listings. There is no automatic MLS refresh, social publishing or booking service.

Production progress is stored in the browser's localStorage. It is not shared between users, devices or domains. All notes are included in Export progress. Export before moving to a new domain or browser, then import the backup there. Older backups remain compatible; importing one without the new section notes replaces those notes with an empty set. The existing storage and backup identifiers are retained for compatibility with earlier Sienna Evans dashboard exports.

Automated checks cover the nine views, island and MLS filtering, empty states, property and community briefs, feature and FAQ scripts, teleprompter markup, progress persistence, backup validation, escaped text, bundled downloads and standalone build. Browser visual verification is separate from these checks.
