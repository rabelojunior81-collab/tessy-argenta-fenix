## Research Summary

### Authentication Strategy
- **Finding:** GitHub OAuth Apps support the standard authorization code flow and device flow, but the web flow does not support PKCE parameters. GitHub also recommends GitHub Apps over OAuth Apps because GitHub Apps use fine-grained permissions and short-lived tokens. For GitHub Apps, user access tokens can be generated with PKCE and can expire, with refresh tokens available.
  - **Evidence:** [Authorizing OAuth apps](https://docs.github.com/apps/building-oauth-apps/authorizing-oauth-apps); [Differences between GitHub Apps and OAuth apps](https://docs.github.com/enterprise-cloud%40latest/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps); [Generating a user access token for a GitHub App](https://docs.github.com/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app); [Refreshing user access tokens](https://docs.github.com/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens).
  - **Implication for planning:** Phase 3 should not plan an OAuth App implementation as if PKCE were available. If we keep the user decision of OAuth + PAT fallback, the plan needs a non-PKCE auth path and a safe token-exchange boundary outside the browser bundle. If the long-term direction wants PKCE and short-lived credentials, that belongs to a GitHub App migration, not to an OAuth App retrofit.

- **Finding:** The current Tessy auth layer is still PAT-oriented. `authProviders.ts` stores GitHub tokens in the `tessy_auth` IndexedDB store and validates `ghp_` / `github_pat_` formats. The current UI is built around manual token entry.
  - **Evidence:** `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\authProviders.ts`; `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\components\viewers\GitHubViewer.tsx`.
  - **Implication for planning:** The phase needs an auth model split into at least two providers: OAuth login state and PAT fallback state. Planning should include the storage and UI transition work, not only the login button.

### Repo Browsing / Data Loading
- **Finding:** GitHub repo browsing can be built on `contents` for directory/file reads and `git/trees` for tree-shaped hierarchy. The tree endpoint supports recursive reads, but GitHub caps recursive tree responses at 100,000 entries and 7 MB, and returns `truncated` when the payload is too large. GitHub REST requests should now send `X-GitHub-Api-Version`; the current supported versions are `2026-03-10` and `2022-11-28`, with `2022-11-28` as the default if the header is omitted.
  - **Evidence:** [Repository contents](https://docs.github.com/rest/repos/contents?apiVersion=2022-11-28); [Git trees](https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28); [API versions](https://docs.github.com/en/rest/about-the-rest-api/api-versions?apiVersion=2026-03-10).
  - **Implication for planning:** Do not plan a default full-repo recursive load. The viewer should load the root or a shallow tree, expand subtrees lazily, and use search as a jump path. The GitHub REST client should be centralized so the version header, Accept header, and auth handling are consistent across all calls.

- **Finding:** The current `githubService.ts` implementation recursively expands directory contents to a max depth of 3 by repeatedly calling `contents`, and it does not send the API version header. That is fine for small repos but will not scale cleanly for large repos or deep trees.
  - **Evidence:** `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\githubService.ts` (`fetchRepositoryStructure`, `fetchDirectoryContents`, `getHeaders`).
  - **Implication for planning:** Treat the current recursive loader as a prototype, not the final data model. The phase should plan a tree cache and subtree fetch strategy, plus clear empty/loading/error states for each subtree.

- **Finding:** The current UI already supports repo-specific file reads and code search (`contents`, `/search/code`, README fetch, branch list). The viewer is still mostly tree-driven and does not yet expose search-first navigation or branch context in the header.
  - **Evidence:** `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\githubService.ts`; `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\components\viewers\GitHubViewer.tsx`.
  - **Implication for planning:** Search should be a first-class entry point in the GitHub viewer, not a secondary modal. The plan should include search result normalization by full path so users can jump directly into files without walking the entire tree.

### Branch / Commit / PR / Worktree Operations
- **Finding:** GitHub REST exposes the primitives needed for repo writes: refs for branch creation and updates, trees and commits for content changes, and pull requests for PR creation and merge flow. The current code already implements branch creation, commit creation, and PR creation via pending actions, but it is still manually orchestrated and does not model merge or branch-status state in the UI.
  - **Evidence:** [Git references](https://docs.github.com/en/rest/git/refs); [Git trees](https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28); [Pull requests](https://docs.github.com/rest/pulls/pulls); `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\githubService.ts`.
  - **Implication for planning:** Plan Git mutations as a guided action pipeline with explicit branch/base/head/destination state. The UI should show the target repo and branch before any write action, and the service layer should refresh repo state after each successful mutation.

- **Finding:** `isomorphic-git` supports `clone`, `branch`, `checkout`, `commit`, `pull`, `push`, `status`, `log`, and `merge`, but the supported command list does not include a `worktree` command. The current Tessy `gitService.ts` wraps the supported branch/checkout/commit/pull/push/status APIs, so it can handle branch workflows, but it cannot create a real git worktree by itself.
  - **Evidence:** [isomorphic-git repository README / supported commands list](https://github.com/isomorphic-git/isomorphic-git); `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\gitService.ts`.
  - **Implication for planning:** Worktree must be treated as a product workflow, not a library primitive. If Phase 3 requires a real separate worktree on disk, we need either native git in the local broker/terminal path or a separate workspace-per-branch model. If the phase only needs a guided "branch workspace" experience, the UI should say that explicitly so we do not overpromise native git worktree semantics.

- **Finding:** The workspace already has a local filesystem abstraction and a workspace clone URL field, which can support a branch-scoped workspace model. There is no existing worktree abstraction in the browser Git layer.
  - **Evidence:** `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\workspaceService.ts`; `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\services\gitService.ts`.
  - **Implication for planning:** The worktree part of the phase should likely introduce a workspace/branch mapping and persistence for branch workspace state. That is safer than assuming `isomorphic-git` can create filesystem worktrees.

### Current Code Baseline
- **Finding:** `GitHubContext.tsx` still centers around a single token, a single repo path, a single tree, and a queue of pending actions. `GitHubViewer.tsx` is a PAT login screen plus a tree browser with a refresh button and a large-file warning modal.
  - **Evidence:** `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\contexts\GitHubContext.tsx`; `E:\tessy-argenta-fenix\tessy-antigravity-rabelus-lab\components\viewers\GitHubViewer.tsx`.
  - **Implication for planning:** Phase 3 planning needs state-model work as a first-class task. The viewer will need repo, branch, mode (`guided` vs `direct`), YOLO preference, override source, and worktree state before the modal and action flows can feel coherent.

## Caveats / Risks

- GitHub docs clearly recommend GitHub Apps over OAuth Apps, but the phase decision currently keeps OAuth + PAT fallback. That is workable, but it means we should not plan PKCE into the OAuth App path.
- The current Tessy auth store keeps GitHub tokens in plaintext IndexedDB. If PAT fallback stays, that security posture remains unless Phase 3 explicitly adds a safer migration path.
- The repo is internally inconsistent on `isomorphic-git` versioning. The workspace pins `^1.36.1`, but live npm metadata fetched during research reported `1.33.1`. Re-check before planning any dependency upgrade or capability assumption.
- `isomorphic-git` does not provide a native worktree primitive. Any "worktree" feature in Phase 3 must be a workflow abstraction or a different execution path, not a direct wrapper.
- The current GitHub REST wrapper does not send `X-GitHub-Api-Version`. Planning should include this as a mandatory client update, otherwise the app will keep drifting on old defaults.

## RESEARCH COMPLETE
