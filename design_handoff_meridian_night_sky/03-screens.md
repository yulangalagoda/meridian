# 03 · Screens

The design files are the source of truth for exact values. Every style is inline, so inspect an element in the browser to read it. Shared on every page: the header (three-column grid: left nav Collection / Narratives / Timeline, the centred "THE · MERIDIAN" logo with a glowing dot, right nav The Island / About / Search ⌘K; the active item is gold) and the motto footer.

**Home, `/`**: a ceremony. The epigraph fades in first, then the featured object rises up to a vertical gold meridian line inside a circular image well, with its date, verification ring and "Read the object →" link. Below that come the narrative constellation cards, the two threads (The Island / The Instruments of Progress) side by side with a gold rule between them, and the footer with links to every archive page.

**Object, `/collection/[slug]`**: the primary image in a zoomable frame with detail hotspots, three detail images, and a sticky meta aside (maker, materials, origin, verification, provenance, plus Copy citation, Write about this object and Send a provenance tip). The body renders the Notion page content word for word, as numbered sections (01 Opening, 02 The Object, …). A small indicator star tracks scroll progress. References sit in a collapsed `<details>` list.

**Narrative, `/narratives/[slug]`**: two columns. The constellation is pinned on the left while the story scrolls on the right. As each object's paragraph arrives, its star opens into a circular image and the line to it draws in.

**Timeline, `/timeline`**:
- *Sky (full viewport):* every object is a star (x = year on a piecewise scale, y = a hash of the slug). Narrative lines draw in once their last object's year has passed. A big Gloock year sits bottom-left with the era and an "N of 55 have risen" count. The "Passing through" list sits bottom-right. A 2200px dial wheel peeks up from the bottom under a gold pointer and fades out under the side panels.
- *Star click:* a 300px card (date · origin, name, short description, "In {narratives}", verification ring, "Read the object →"). The object's own constellations stay bright and the others dim to 0.2.
- *Below the sky:* the header row, a "Narratives through the sky" route row, then one shelf per era (gold pill · rule · "N objects · 1850–1899") with 4:5 cards. Clicking a card scrolls up and opens its star.

**Collection, `/collection`**: the same shelf-and-card structure. "Arrange by" Field / Era / A–Z and "Show" All / The Island / Research ongoing (with counts). Field shelves show the category description in italic.

**Narratives, `/narratives`**: a 260–380px sky band with all 55 stars and 12 constellation paths, with year ticks along the bottom. Below it is a grid of cards (mini constellation, number, name, premise, "N objects · span", "Follow →"). Hovering a card lights its path and stars in the band.

**The Island, `/the-island`**: a centred hero in island gold, then the island objects as rows (a large year on the left with a gold rule; a 4:3 image, meta, name, short description, ring and link on the right). A dashed segment between rows is labelled "295 years later", with its height scaled to the gap. It ends with "Still below the horizon", the four island entries from Seeking with dashed rings.

**Search, `/search`**: one large Gloock input with a gold underline. When it's empty, a "Try" row of example queries appears. Results come in four groups (Objects, Narratives, Fields, Pages) with matches highlighted in gold on a 14% gold background. Objects show 8 results, the other groups 5, each with "Show N more". If nothing matches, a line links to Seeking.

**Archive pages** (About, Collecting Policy, Verification & Provenance, Seeking, Access/Citation/Image Use, Annual Review): a sticky 220px "The Archive" rail on the left (the current page gets a glowing dot), and a reading column of up to 680–760px. All text comes word for word from Notion. Each page has its own treatment: About ends with a pull quote and a mailto block; Seeking lists five numbered wants, each with a dashed ring and an "I know of one →" mailto with the subject filled in; Collecting Policy shows the two threads as cards plus the test question in large type; Verification shows two panels and ring badges; Access shows label/text rows and a citation box; Annual Review is a year timeline.
