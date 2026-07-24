# StudentRestaurants

A frontend web app for discovering **student restaurants across Finland** — browse locations on a map, check daily and weekly menus, and manage a personal favorite through a simple authenticated dashboard.

Built with vanilla **JavaScript** (ES modules), **HTML/CSS**, and **Leaflet**, talking to Metropolia’s restaurant API.

---

## Features

- **Interactive map** — restaurant markers with nearest and favorite highlighting (Leaflet)
- **Restaurant discovery** — list + filter-friendly UI for cities and providers
- **Daily & weekly menus** — fetched per restaurant from the API
- **Auth** — register, login, logout with JWT stored in `localStorage`
- **Dashboard** — profile summary and favorite restaurant details
- **Modular structure** — clear split between API clients, UI components, and utils

---

## Tech stack

| Area | Tools |
|------|--------|
| Language | JavaScript (ES modules) |
| UI | HTML5, CSS3 |
| Maps | Leaflet |
| API | Metropolia Restaurant API (`media2.edu.metropolia.fi`) |
| Auth | Bearer JWT via `localStorage` |

---

## Project structure

```text
StudentRestaurants/
├── package.json
└── project-root/
    ├── api/           # auth, restaurants, menus, users
    ├── components/    # map, login, register, dashboard, UI
    ├── css/           # home + auth styles
    ├── html/          # home, login, register, dashboard pages
    ├── utils/         # fetch helper, map/menu models, validators
    └── main.js
```

---

## Getting started

### Requirements

- A modern browser (Chrome, Firefox, Safari, Edge)
- Optional: a simple static file server (recommended — ES modules may be blocked from `file://`)

### Run locally

```bash
git clone https://github.com/satvikvelpula/StudentRestaurants.git
cd StudentRestaurants
```

Serve the `project-root` folder, for example:

```bash
# Python
cd project-root
python3 -m http.server 5500

# or Node (if you have npx)
npx serve project-root
```

Then open:

```text
http://localhost:5500/html/home.html
```

Other pages:

- `html/login.html` — sign in
- `html/register.html` — create an account
- `html/dashboard.html` — profile + favorite restaurant (requires login)

---

## API

All requests go through `project-root/utils/fetchData.js`:

```text
https://media2.edu.metropolia.fi/restaurant/api/v1
```

Key endpoints used:

- `POST /auth/login` — login
- `POST /users` — register
- `GET /restaurants` — restaurant list
- `GET /restaurants/daily/:id/:lang` — daily menu
- `GET /restaurants/weekly/:id/:lang` — weekly menu

Authenticated calls send `Authorization: Bearer <token>` when a token is present in `localStorage`.

---

## Notes

- Geolocation is used to place the user and compute the nearest restaurant; allow location access in the browser for the full map experience.
- Default branch is `dev`.
- This is a student frontend project focused on API integration, modular JS, and map UX.

---

## Author

**Satvik Velpula** — [github.com/satvikvelpula](https://github.com/satvikvelpula)
