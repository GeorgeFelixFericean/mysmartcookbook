# MySmartCookbook

**Add. Search. Cook. Repeat.** — The smartest way to manage your recipes and cook with what you’ve got.

A full‑stack personal cookbook that lets you save recipes, search by ingredients you already have, and share a curated set of public recipes with visitors. Built with Java Spring Boot and a lightweight HTML/CSS/JS front end.

---

## Table of contents
- [Overview](#overview)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Security](#security)
- [Screenshots](#screenshots)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [API docs](#api-docs)
- [Troubleshooting](#troubleshooting)
- [Roadmap (next)](#roadmap-next)
- [License](#license)

---

## Overview
MySmartCookbook is a personal cookbook where users can add, edit, and organize their favorite recipes. Its key feature is **ingredient‑based search**: find recipes you can cook with what’s already in your kitchen. Visitors can try a **free public recipes** section; logged‑in users get full recipe management.

Live demo: **[TBD – add when ready]**
  
Repository: **(this repo)**

---

## Key features

### Public (no account required)
- Landing page with app overview and **demo tour**
- **Public recipes** (curated) with search by name and ingredient
- **Recipe details (public)** with image, ingredients, instructions, notes, and optional external link
- Contact section/form (simple)

### Authenticated (requires login)
- Register, login, logout; **account activation by email** (optional)
- **Add / Edit / Delete** personal recipes
- **Image upload & preview**, optional external link
- **Ingredient validation** (no incomplete items, sane quantities)
- **Search & filter** by name and multiple ingredients (case‑insensitive, partial match)
- Toast notifications for success/errors
- Protected pages: `/home`, `/add-recipe`, `/edit-recipe/{id}`, `/recipe/{id}`, `/public-recipes-user`

### Admin / System
- Special `system` user to own **free public recipes**
- Optional data initializer to create `system` user on first run

---

## Tech stack
**Backend:** Java 17, Spring Boot, Spring Web, Spring Security, JPA/Hibernate, Bean Validation  
**Database:** MySQL 8+ (dev alt: H2)  
**Frontend:** HTML, CSS, Bootstrap, Vanilla JS (single shared `scripts.js`)  
**Build/Tools:** Maven, JUnit, Swagger/OpenAPI (optional), Git  
**Optional media:** Local `/uploads` or external (e.g., Cloudinary)

---

## Architecture
```
client (HTML/CSS/JS)  <—>  Spring Boot (Controllers/Services/Repositories)  <—>  MySQL
           ▲                             ▲
           │                             └— Security: Spring Security (session + CSRF)
           └— Toasts, validation, fetch() calls with CSRF header
```

- Routes served by Spring; static assets in `/static`.
- Centralized front‑end logic in `scripts.js` handles page init, toasts, form validation, image preview, autocomplete, and protected‑page redirects.

---

## Security
- **CSRF**: `CookieCsrfTokenRepository` with cookie `XSRF-TOKEN`; send header **`X-XSRF-TOKEN`** on `fetch()` writes.
- **Auth**: session‑based (JSESSIONID). Protected routes redirect to `/login` with a toast “Please log in to access that page.”
- **Passwords**: `BCryptPasswordEncoder`.
- **XSS**: render untrusted data via `textContent`/server‑side escaping; avoid `innerHTML` for user content.
- **Headers**: sensible defaults via Spring Security (HSTS, frame‑options for H2 when enabled, etc.).

---

## Screenshots
Place images in `docs/screenshots/` and reference a subset below. See the separate **Screenshots Checklist** for a complete list.

- `landing-hero.png` — Landing page hero with slogan
- `public-recipes-list.png` — Public recipes with ingredient filter
- `public-recipe-details.png` — Public recipe detail (with external link box)
- `login.png` / `register.png`
- `home.png` — “My Kitchen” overview (logged in)
- `add-recipe.png` — Add form (with image preview)
- `edit-recipe.png` — Edit form (ingredients list + validation)
- `search-by-ingredients.png` — Multi‑ingredient filter chips
- `toast-success.png` / `toast-error.png`
- `demo-tour.png` — Onboarding carousel/steps
- `mobile-landing.png` / `mobile-recipe.png` — mobile views

---

## Quick start

### Prerequisites
- **Java 17+**
- **Maven 3.8+**
- **MySQL 8+** (or H2 for quick start)

### 1) Clone
```bash
git clone https://github.com/<your-username>/mysmartcookbook.git
cd mysmartcookbook
```

### 2) Configure database
Create a database `mysmartcookbook` and a user with privileges.

### 3) Configure app
Update `src/main/resources/application.properties` (see [Configuration](#configuration)).

### 4) Run
```bash
mvn spring-boot:run
# open http://localhost:8080
```

Optional: run with H2 memory DB for a quick try‑out.

---

## Configuration
`src/main/resources/application.properties` (sample)
```properties
# --- Datasource ---
spring.datasource.url=jdbc:mysql://localhost:3306/mysmartcookbook?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS

# --- JPA ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# --- Static uploads (local) ---
app.upload-dir=uploads

# --- Mail (optional for activation/reset) ---
spring.mail.host=YOUR_SMTP
spring.mail.username=YOUR_SMTP_USER
spring.mail.password=YOUR_SMTP_PASS

# --- Misc ---
server.port=8080
```

**CSRF in front‑end fetch:** read cookie `XSRF-TOKEN` and set header `X-XSRF-TOKEN` on POST/PUT/PATCH/DELETE.

---

## Project structure
```
src/
 └─ main/
    ├─ java/com/recipeapp/recipe_app/
    │   ├─ config/           # Security, DataInitializer, etc.
    │   ├─ controller/       # REST/MVC controllers
    │   ├─ model/            # Entities (Recipe, Ingredient, User, etc.)
    │   ├─ repository/       # JPA repositories
    │   └─ service/          # Business logic
    └─ resources/
        ├─ static/
        │   ├─ css/
        │   ├─ img/
        │   └─ js/scripts.js  # centralized front-end logic
        └─ templates/         # HTML (if using server-side templates)
```

Key pages (routes):
- Public: `/`, `/public-recipes`, `/public-recipe-free/{id}`
- Authenticated: `/home`, `/add-recipe`, `/edit-recipe/{id}`, `/recipe/{id}`, `/public-recipes-user`
- Auth: `/login`, `/register` (+ activation/reset flows if enabled)

---

## API docs
If Swagger is enabled, docs are typically available at:
- `http://localhost:8080/swagger-ui/`  
- `http://localhost:8080/v3/api-docs`

Otherwise, list core endpoints in a `docs/api.md` file (optional).

---

## Troubleshooting
- **403 on POST/PUT/DELETE:** Ensure `X-XSRF-TOKEN` header is sent (value from `XSRF-TOKEN` cookie).
- **Uploads disappear after redeploy (cloud hosts):** Use persistent storage or external media (e.g., Cloudinary). Ephemeral filesystems are wiped on deploy.
- **H2 resets data:** Use MySQL for persistent storage in dev/prod.
- **Redirected to login unexpectedly:** Check session cookie (JSESSIONID) and route protection rules in `SecurityConfig`.

---

## Roadmap (next)
- Public demo deployment + health check endpoint
- Image storage via external provider (optional)
- SEO polish (meta + Open Graph) and performance pass
- Basic rate limiting for write operations

---

## License
MIT (or your preferred license).

---

### Credits
Built by **George Fericean**.
