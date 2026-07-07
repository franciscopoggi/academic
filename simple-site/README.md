# Simple static site — Francisco Poggi

A plain HTML/CSS version of the site, with no Hugo/Wowchemy build step.
Edit the `.html` files directly and open them in a browser to preview.

## Files

- `index.html` — the whole site: masthead + tabs (Home, Research, CV, Contact).
  Tabs switch panels in place via a small script — no page reload, no scroll jump.
  URLs are `/#research` and `/#contact`.
- `research.html`, `contact.html` — redirect stubs so old links land on the right tab
- `style.css` — all styling (colors live at the top under `:root`)
- `files/` — PDFs, `avatar.jpg`, slides, and teaching materials
  (`microiii/`, `LawEcon/` are kept so old `/files/...` links keep working)

## Editing

- **Add a paper:** copy one `<div class="paper">…</div>` block in the research
  panel of `index.html` and change the title, link, coauthors, status, abstract.
- **Add a tab:** add a `<section class="panel" id="panel-NAME">`, then a
  `<a href="#NAME" data-panel="NAME">` in the nav — the script handles the rest.
- **Change the accent color:** edit `--accent` at the top of `style.css`.
- **Update the footer date:** `<footer>Last updated …</footer>` in `index.html`.

## Publishing

It's just static files. The repo's `netlify.toml` publishes this folder with no
build command and 301-redirects old Wowchemy URLs (`/publication/*`, `/talk/*`,
`/courses/*`, `/post/*`) to the new pages. On any other static host, upload this
folder and replicate those redirects if needed.
