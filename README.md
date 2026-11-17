# Spice Route - Recipe Finder Web App

A responsive web app that discovers authentic Indian recipes (and global cuisines) using TheMealDB REST API. Search by ingredient, open any recipe for its full ingredient list, step-by-step instructions and an embedded video tutorial.

**Live demo:** https://kanikaagarwal006.github.io/REPO-NAME/  (replace REPO-NAME)

## Tech stack
HTML5, CSS3, JavaScript (ES6+), REST API (TheMealDB), Async/Await, Git, GitHub Pages. No frameworks or libraries.

## Features
- Ingredient search across Indian recipes (chicken, paneer, dal, fish, rice, and more)
- Cuisine filters: Indian, Italian, Chinese, Mexican, Japanese, Thai, Turkish
- Global Feast mix and Surprise Me (random recipe)
- Recipe modal with ingredients and measures, instructions and embedded YouTube tutorial
- Responsive layout (mobile and desktop), keyboard accessible
- Loading, empty and error states

## How it works
- `fetch` with `async/await` calls TheMealDB endpoints (`filter.php`, `lookup.php`, `random.php`, `search.php`).
- Indian recipes are downloaded once and cached, so repeat searches are instant.
- A request-ID check ignores stale responses when the user clicks quickly.
- User/API text is escaped before rendering (XSS-safe); YouTube links are validated.

## Run locally
Open `index.html` in a browser (needs internet), or run `python3 -m http.server` in this folder.

## Deploy on GitHub Pages
```
git init
git add .
git commit -m "Spice Route recipe finder"
git branch -M main
git remote add origin https://github.com/kanikaagarwal006/REPO-NAME.git
git push -u origin main
```
Then GitHub repo > Settings > Pages > Source: Deploy from branch > `main` / root > Save.
