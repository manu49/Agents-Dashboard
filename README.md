# Agents Dashboard

Personal command center consolidating live data from Notion, Gmail, and Windsor.ai — powered by Claude.

## Live at

[manu49.github.io/Agents-Dashboard](https://manu49.github.io/Agents-Dashboard)

## What it shows

| Section | Source | Data |
|---|---|---|
| Job pipeline | Static | DB interview, XTX Markets, Gogi AI |
| Priority inbox | Gmail MCP | Important job-related threads (last 7d) |
| Notion tasks | Notion MCP | My Tasks database |
| Meetings | Static | Upcoming calendar items |
| Windsor.ai | Windsor MCP | Marketing/analytics snapshot + NL query |
| Action items | Claude AI | AI-synthesized daily priorities |

## Setup

1. Open `index.html` directly in a browser, or serve via GitHub Pages
2. The dashboard calls the Anthropic API (`/v1/messages`) — you need to be on Claude.ai with Notion, Gmail, and Windsor.ai connected
3. MCP connections (Notion, Gmail, Windsor.ai) use OAuth — no API keys required in the HTML

## Enable GitHub Pages

Repo → Settings → Pages → Source: Deploy from branch `main` → `/ (root)`

## Tech

- Vanilla HTML/CSS/JS, no build step
- Anthropic Claude API with MCP server integration
- DM Sans + DM Mono (Google Fonts)
- Dark mode via `prefers-color-scheme`
