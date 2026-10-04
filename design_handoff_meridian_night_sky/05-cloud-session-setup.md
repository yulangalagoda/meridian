# 05 · Setting up the Claude Code cloud session

You do these steps once, before the first session.

## 1. Put the handoff on GitHub
1. Unzip the download.
2. On github.com/yulangalagoda/meridian, go to **Add file → Upload files** and drag in the whole `design_handoff_meridian_night_sky` folder.
3. Upload `design_handoff_meridian_night_sky/CLAUDE.md` again, this time to the **root** of the repo. If the repo already has a CLAUDE.md, paste these rules at the top of it instead.
4. Commit to `main`. These files don't change the live site, because Astro only builds what's in `src/`.

## 2. Prepare Notion
In Notion, open Settings → Integrations, then the integration your site uses. Turn on **Read content**, **Update content** and **Insert content**, and make sure The Meridian pages are shared with it. Claude makes the Phase 0 changes through the API with this token, so no connector is needed.

## 3. Create the cloud environment (claude.ai/code)
1. Connect GitHub and allow access to `yulangalagoda/meridian`.
2. Add an environment called `meridian`:
   - **Network access:** Full. This is the simplest option, because the build needs `api.notion.com`, Notion's image storage and Google Fonts, and screenshots need a browser download. The default Trusted level blocks those.
   - **Environment variables:** your `NOTION_TOKEN=…` line, plus any other lines from your local `.env`.
   - **Setup script:** `npm ci`

## 4. Turn on Cloudflare preview builds
In Cloudflare Pages, go to the project → Settings → Environment variables → **Preview** and add `NOTION_TOKEN` there too. Each phase Claude pushes then gets a preview link, which you check against the design.

## 5. Start the session
Choose the repo and the `meridian` environment, then paste the prompt from `06-claude-code-prompt.md`. Claude will work on its own branch and open a pull request. Merge it to `main` only once every phase is approved.

Long builds can run over several sessions. Start each new session with "Continue the Night Sky rebuild from the last approved phase."
