# Simple static site — Francisco Poggi

A plain HTML/CSS version of the site, with no Hugo/Wowchemy build step.
Edit the `.html` files directly and open them in a browser to preview.

## Files

- `index.html` — home page (bio, news)
- `research.html` — research page (paper list; abstracts commented out)
- `contact.html` — contact page
- `style.css` — all styling (colors live at the top under `:root`)
- `files/` — PDFs, `avatar.jpg`, slides, and teaching materials
  (`microiii/`, `LawEcon/` are kept so old `/files/...` links keep working)

## Editing

- **Add a paper:** copy one `<div class="paper">…</div>` block in `research.html`
  and change the title, link, coauthors, status, and abstract.
- **Change the accent color:** edit `--accent` at the top of `style.css`.
- **Update the footer date:** each page has a `<footer>Last updated …</footer>`.
- **Masthead + tabs:** the header and `<nav class="tabs">` blocks are identical on
  every page — if you edit one, copy it to the others, and keep `class="active"`
  on the tab for the current page.

## Publishing

It's just static files. The repo's `netlify.toml` publishes this folder with no
build command and 301-redirects old Wowchemy URLs (`/publication/*`, `/talk/*`,
`/courses/*`, `/post/*`) to the new pages. On any other static host, upload this
folder and replicate those redirects if needed.
