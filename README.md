# Gmail Clone (Vanilla JS SPA)

A high-fidelity, front-end clone of the Gmail web application, built entirely
with vanilla HTML, CSS, and JavaScript — no frameworks, no libraries, no build
tools. A demonstration of building a modern, responsive, accessible
single-page application (SPA) with plain web technology.

**Live demo:** https://girishlade111.github.io/Gmail-Clone-UI-Structure/

## ✨ Features

- **Responsive design** — seamless experience on desktop (two-column) and
  mobile (single-column) devices
- **Mailbox navigation** — Inbox, Sent, Archive, Trash, plus custom labels
- **Threaded conversation view** — click any message to see the full
  conversation history in a clean, chronological layout
- **Compose modal** — To / Cc / Bcc fields, basic rich-text editor, mock
  attachment support
- **Real-time search** — instantly filter messages by sender, subject, or body
- **Bulk actions** — select multiple messages to archive, delete, or
  mark as read/unread
- **Core email actions** — star messages, mark read/unread, checkbox selection
- **Keyboard shortcuts** — `c` opens compose, `Escape` closes the modal,
  and more
- **Accessibility** — semantic HTML and ARIA attributes for screen reader
  compatibility and keyboard navigation

## 🛠 Tech Stack

| Layer  | Technology |
|--------|-----------|
| Structure | HTML5 (semantic, accessible markup) |
| Styling | CSS3 — custom properties, Flexbox, Grid |
| Logic | Vanilla JavaScript (ES6+) — centralized state, render functions, event delegation |
| Build | None — static files, served as-is |
| Deploy | GitHub Pages |

## 🚀 Quick Start

No build step required. Serve the static files:

```bash
# Option 1: open directly in a browser
open index.html

# Option 2: serve locally (avoids file:// quirks)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 📁 Project Structure

```text
Gmail-Clone-UI-Structure/
├── index.html          # App shell (also shipped as "Gmail Clone UI Structure")
├── styles.css          # Full UI styling (also shipped as "Gmail Clone Styles")
├── app.js              # Application logic & state (also shipped as
│                       # "Gmail Clone Application Logic")
└── README.md
```

The original three deliverables (`Gmail Clone UI Structure`, `Gmail Clone
Styles`, `Gmail Clone Application Logic`) are kept as-is for reference; the
deployment-ready copies are `index.html`, `styles.css`, and `app.js`.

## 🏛 Architecture

- **Centralized state** — a single state object in `app.js` holds the entire
  application status (active folder, selected message, etc.)
- **Render functions** — the UI is a direct function of the state
  (`UI = f(state)`); renderers like `renderMessageList()` sync the DOM
- **Event delegation** — single listeners on parent containers handle dynamic
  child elements efficiently
- **Separation of concerns** — HTML for structure, CSS for styling, JS for
  logic

## 🌐 Deploy

Static hosting only — drop the three files on any static host:

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / `/ (root)`
- **Netlify / Cloudflare Pages:** drag-and-drop the folder, no build command

## 📄 License

Free to use and learn from.

---

**Built by Girish Lade** — [ladestack.in](https://ladestack.in)
