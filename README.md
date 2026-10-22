# droo-bin.github.io

droo-bin's site: a landing page and a blog, built by GitHub Pages with Jekyll. No build step on your
side: push to `main` and it's live at <https://droo-bin.github.io> a minute later.

Project sites keep their own addresses underneath it (`/loupe/`, `/smoke-signal/`).

## Writing a post

1. Add a Markdown file to `_posts/` named with the date and a short title, e.g. `_posts/2026-11-01-why-offline.md`.
2. Start it with:

   ```yaml
   ---
   title: Why I build things that work offline
   description: One line for the list of posts and for search results.
   tags: [offline, radio]
   ---
   ```
3. Write the post in Markdown below that, then commit and push. It appears at `/blog/2026/why-offline/`,
   at the top of the blog, on the home page (the latest three) and in the feed at `/blog/feed.xml`.

### Charts

Charts come from [Loupe](https://droo-bin.github.io/loupe/). For a file on your computer, open it in Loupe,
choose **Embed in a web page** on a chart and paste the code into the post: the chart's numbers are in the
code, so nothing else is needed. For a chart that follows a file as it changes, Loupe can read it from this site:

1. Put the data in `data/`, e.g. `data/runs.csv`, and push it.
2. Open `https://droo-bin.github.io/loupe/?data=/data/runs.csv` and find or build the chart you want.
3. In the chart's menu (or under the chart builder), choose **Embed in a web page**, then **Copy code**.
4. Paste the code into the post on a line of its own.

The chart is drawn from the file each time the post is read, so updating `data/runs.csv` updates the chart.
Its filters, colours and title travel in the code, so you can change the chart in Loupe and paste it again.

Unfinished posts can live in `_drafts/` (no date in the name): they aren't published. `_drafts/how-to-write-a-post.md`
shows everything a post can do. Put images in `assets/img/`.

## Changing the home page

- **Projects** are listed from `_data/projects.yml`: edit, reorder or add entries there.
- **The words** are in `index.html`; the header and footer are in `_includes/`.
- **The signal** (the waveform of "droo-bin" as Bell 202 tones) is generated into `_includes/signal.html`.

## Preview locally (optional)

```
bundle install
bundle exec jekyll serve
```

Then open <http://localhost:4000>. This needs Ruby; GitHub builds the real site without it.

### With Loupe charts

Charts in posts read `/data/` files through Loupe at `/loupe/`, which only works when both are on one
address, as they are on GitHub Pages. Locally, with the blog running (port 4000) and Loupe running
(`npm run serve` in the Loupe folder, port 8000), start:

```sh
python3 tools/serve-with-loupe.py
```

Then open <http://localhost:8080/>: the blog, with Loupe at <http://localhost:8080/loupe/>. To make a chart,
open `http://localhost:8080/loupe/?data=/data/runs.csv`. Embed code made for a file in `data/` starts with
`/loupe/`, so it works both here and on the live site. Other ports: `--site`, `--loupe` and `--port`.

## Publishing for the first time

1. Create a public repository on GitHub named exactly `droo-bin.github.io`.
2. Push this folder to its `main` branch.
3. In the repository's **Settings → Pages**, set **Source** to **Deploy from a branch**, branch `main`, folder `/ (root)`.

## Credits

Typeface: Atkinson Hyperlegible Next and Mono by the Braille Institute, SIL Open Font License (see
`assets/fonts/`).
