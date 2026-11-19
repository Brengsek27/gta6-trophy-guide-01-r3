# Leonida Trophy Atlas — Neon Depths

[![GTA VI Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounties/gta6-trophy-guide-01) [![Rank](https://make.fun/badge/gta6-trophy-guide-01/Brengsek27/gta6-trophy-guide-01-r3/rank.svg)](https://make.fun/leaderboard/gta6-trophy-guide-01) [![Reward](https://make.fun/badge/gta6-trophy-guide-01/Brengsek27/gta6-trophy-guide-01-r3/reward.svg)](https://make.fun/leaderboard/gta6-trophy-guide-01)

A local, offline guide and personal tracker for all 55 GTA VI trophies. The audit strip explains the collection at a glance; individual field notes pair official descriptions with original instructions, numbered steps, and source citations. The Chapter 1 meditation gets a possibly-missable alert and a separate explanation of the uncertainty.

Five roadmap stages organize the run. Search, category and grade filters work together with the sort controls. Spoiler protection masks unearned hidden trophies until you reveal them. Counted objectives have progress bars and counters that mark a trophy earned at its target. The dashboard follows your grades, hidden finds, stage progress, and next objective.

Serve `app/` with a static server. From this directory, run `node serve.ts`, then visit `http://localhost:8080`. There is no package install or build step. All runtime assets and trophy data are local; the browser needs the local server to fetch the JSON. Progress stays in this browser's local storage. Export a JSON backup before switching browsers; Import restores it.

Share a starting run with `?earned=2,3,15&counts=28:9&open=28`: `earned` lists trophy IDs, `counts` holds comma-separated `id:amount` pairs, and `open` selects a dossier. Present query parameters replace that part of the saved run; omitted parameters keep browser progress. Use `?earned=&counts=` for a clean run. Append `#view=roadmap` to jump to the five stages, `#view=missables` to filter the warning trophy, or `#guide-28` to open its field notes. These links seed the receiving browser; they do not sync two trackers.

The source notes record four references, all read 19 Nov 2026:

- PowerPyx — GTA VI Trophy Guide & Roadmap: the meditation report and route details.
- GTABase — GTA VI Trophies: corroborating list and possibly-missable reporting.
- Exophase — GTA VI Trophies: published official descriptions and trophy grades.
- PSNProfiles — GTA VI Trophies: published official list cross-check.

Citation chips lead to the numbered source notes in the app. The meditation warning separates the reported Chapter 1 cutoff from the unconfirmed requirement to use that spot. Official description text is preserved; the guide prose is original.

This is an unofficial, fan-made project, with no affiliation to Rockstar Games or PlayStation.

[make.fun](https://make.fun)
