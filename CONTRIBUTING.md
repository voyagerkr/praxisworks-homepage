# Contributing to the PraxisWorks atlas

Thanks for helping grow the applied atlas of AI agents. There are two ways in.

## 1. Suggest an agent (no code)

Open a **➕ New agent** issue with the project name, a one-line description, a working
GitHub/notebook URL, its industry, and (if any) its framework. We'll review and add it.

## 2. Add agents yourself (PR)

The gallery is data-driven — one JSON file, no per-card code.

1. Add objects to [`src/data/agents.json`](src/data/agents.json):

   ```json
   {
     "id": "unique-slug",
     "name": "Project name",
     "description": "One-line description",
     "industry": "Healthcare",
     "category": "Healthcare",
     "framework": "CrewAI",
     "url": "https://github.com/owner/repo"
   }
   ```

   - `framework` is one of `CrewAI`, `AutoGen`, `Agno`, `LangGraph`, or `null` (industry showcase).
   - `category` is the normalized domain bucket used by the filter — reuse an existing one, or
     see the `CATEGORY_RULES` map in [`scripts/parse-readme.mjs`](scripts/parse-readme.mjs).

2. Or regenerate the whole dataset from the upstream catalog:

   ```bash
   curl -sSL https://raw.githubusercontent.com/ashishpatel26/500-AI-Agents-Projects/main/README.md -o /tmp/agents_readme.md
   pnpm data /tmp/agents_readme.md
   ```

3. Verify before opening the PR:

   ```bash
   pnpm install && pnpm build && pnpm lint
   ```

Every card must link to **public, working** source. Thanks! 🙏
