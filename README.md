🍛 Spice Route
Discover Authentic Indian Flavors & Global Gems

<p align="center"> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" /> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" /> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /> <img src="https://img.shields.io/badge/TheMealDB-API-orange?style=for-the-badge" alt="TheMealDB API" /> <img src="https://img.shields.io/badge/GitHub_Pages-Deployed-brightgreen?style=for-the-badge&logo=github" alt="GitHub Pages" /> </p>

<p align="center"> <strong>A fully responsive, zero-dependency recipe discovery web application powered by TheMealDB REST API.</strong> <br /> Search by ingredient, explore cuisines from around the world, discover authentic Indian recipes, and follow step-by-step cooking instructions with embedded video tutorials. </p>

<p align="center"> 🌐 <a href="https://kanikaagarwal006.github.io/REPO-NAME">Live Demo</a> &nbsp;•&nbsp; 🐛 <a href="https://github.com/kanikaagarwal006/REPO-NAME/issues">Report a Bug</a> &nbsp;•&nbsp; ✨ <a href="https://github.com/kanikaagarwal006/REPO-NAME/issues">Request a Feature</a> </p>

📑 Table of Contents

📸 Screenshots
✨ Features
🛠️ Tech Stack
🏗️ How It Works
📡 API Reference
📂 Project Structure
🚀 Getting Started
🌐 Deployment
🎨 Design Highlights
♿ Accessibility
🔮 Future Enhancements
👩‍💻 Author
📄 License
📸 Screenshots

🏠 Homepage — Search & Discover

Explore delicious recipes with ingredient search, cuisine filters, and quick ingredient shortcuts.

!Spice Route Homepage

📋 Recipe Details — Ingredients & Instructions

View complete ingredient lists, cooking measurements, step-by-step instructions, and video tutorials.

!Recipe Detail Modal

📱 Fully Responsive Mobile View

Enjoy a seamless recipe discovery experience across desktops, tablets, and smartphones.

!Mobile Responsive View

✨ Features

Spice Route brings together everything you need to discover your next favorite meal.


Feature	Description
🔍 Ingredient Search	Find recipes using ingredients like chicken, paneer, rice, coconut, and more.
🇮🇳 Indian Treasury	Explore authentic Indian recipes with cuisine-area filtering.
🌍 Global Feast	Discover recipes from 8 different world cuisines.
🎲 Surprise Me	Get a random recipe whenever you're feeling adventurous.
🏷️ Cuisine Filters	Filter recipes by Indian, Italian, Chinese, Mexican, Japanese, Thai, and Turkish cuisines.
🫘 Quick Ingredient Chips	Instantly search 10 popular Indian ingredients.
📋 Recipe Details Modal	Explore ingredients, measurements, cooking instructions, and recipe details.
🎬 Video Tutorials	Watch embedded YouTube cooking tutorials using privacy-enhanced embeds.
🗃️ Smart Caching	Cache recipe data to reduce unnecessary API requests.
⚡ Race Condition Protection	Ensure only the latest search response updates the interface.
🛡️ XSS-Safe Rendering	Escape user-generated and API-provided text before HTML insertion.
♿ Accessibility Support	ARIA labels, keyboard navigation, and screen-reader announcements.
📱 Responsive Design	Optimized layouts for mobile, tablet, and desktop screens.
🔄 Loading & Error States	Animated loading indicators and helpful empty/error messages.
🫘 Quick Ingredient Shortcuts

Chicken • Paneer • Dal • Lentil • Mutton • Rice • Gobi • Baingan • Coconut • Palak

🛠️ Tech Stack

Built entirely with vanilla technologies — no frameworks, no dependencies, and no build tools!


Technology	Purpose
HTML5	Semantic structure and accessible markup
CSS3	Responsive layouts, animations, Grid, Flexbox, and custom styling
JavaScript (ES2020)	API integration, asynchronous operations, caching, and application logic
TheMealDB API	Free REST API for recipe discovery and details
Google Fonts	Inter typography for a clean, modern interface
GitHub Pages	Free static website hosting
Core Technologies


text
📁 Spice Route
│
├── HTML5
│   └── Semantic markup and accessibility
│
├── CSS3
│   └── Grid, Flexbox, animations and responsive design
│
├── Vanilla JavaScript (ES2020)
│   └── Fetch API, async/await, Promise.all and Map
│
└── TheMealDB REST API
    └── Recipe search, filtering and details
🏗️ How It Works

Spice Route follows a smart search pipeline to provide relevant recipes while minimizing unnecessary API requests.

🔄 Search Workflow


text
          👤 User Action
                |
                ▼
       Search / Filter / Click
                |
                ▼
        Smart Search Pipeline
                |
       ┌────────┼─────────┐
       ▼        ▼         ▼
   Dish Name  Ingredient  Cuisine
    Search     Search     Filter
       |        |          |
       └────────┼──────────┘
                ▼
        Indian Recipe Check
                |
       ┌────────┴────────┐
       ▼                 ▼
   Match Found       No Match
       |                 |
       ▼                 ▼
  Display Recipes   Cached Recipe
                         Fallback
                            |
                    ┌───────┴───────┐
                    ▼               ▼
                 Results       No Results
🧠 Key Architecture Decisions

1. Request-ID Guard

Each search increments a global activeRequestId. Before rendering, the application verifies that the response belongs to the latest request, preventing outdated results from appearing.

2. Smart Caching with Map

Recipe details are stored in a JavaScript Map using recipe IDs as keys. Cached promises are reused to avoid repeated API requests.

3. Indian Recipe Prefetching

The getIndianRecipes() function fetches up to 30 Indian recipes on first use and caches them for subsequent searches.

4. Ingredient Alias System

The INGREDIENT_ALIASES object maps alternative ingredient names to improve search flexibility.

For example:


javascript
{
  dal: ["dal", "lentil", "lentils"]
}
5. Whole-Word Matching

The wordMatch() function uses word-boundary regular expressions to avoid incorrect matches.

For example, searching for egg does not accidentally match eggplant.

📡 API Reference

Spice Route uses the free TheMealDB REST API.

No API key is required for the endpoints used in this project.


Endpoint	Purpose
search.php?s=	Search recipes by dish name
filter.php?i=	Filter recipes by ingredient
filter.php?a=Indian	Retrieve Indian recipe summaries
lookup.php?i=	Retrieve complete recipe details
random.php	Fetch a random recipe
🔗 API Documentation: https://www.themealdb.com/api.php

📂 Project Structure


text
recipe-finder-app/
│
├── index.html       # Application structure and modal skeleton
├── style.css        # Styling, layouts, animations and responsive design
├── script.js        # API integration, caching and application logic
├── README.md        # Project documentation
│
├── spiceroute_home.png
├── spiceroute_modal.png
└── spiceroute_mobile.png
🚀 Getting Started

Want to run Spice Route locally? Follow these simple steps.

Prerequisites

A modern web browser.
Python 3 (recommended for running a local server), or VS Code with Live Server.
1. Clone the Repository


bash
git clone https://github.com/kanikaagarwal006/REPO-NAME.git
2. Navigate to the Project Directory


bash
cd REPO-NAME
3. Run the Application

Option 1: Open Directly

Open index.html in your browser.

Note: Some browsers restrict API requests from file:// URLs. If recipes don't load, use a local HTTP server instead.
Option 2: Python HTTP Server (Recommended)


bash
python3 -m http.server 8080
Open your browser and visit:


text
http://localhost:8080
Option 3: VS Code Live Server

Install the Live Server extension.
Open the project folder in VS Code.
Right-click index.html.
Select Open with Live Server.
🌐 Deployment

Spice Route can be deployed for free using GitHub Pages.

Step 1: Initialize Git


bash
git init
Step 2: Add Project Files


bash
git add .
Step 3: Commit Changes


bash
git commit -m "🍛 Initial commit - Spice Route"
Step 4: Set Main Branch


bash
git branch -M main
Step 5: Connect GitHub Repository


bash
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
Step 6: Push Your Code


bash
git push -u origin main
Step 7: Enable GitHub Pages

Open your GitHub repository.
Navigate to Settings → Pages.
Under Build and deployment, select Deploy from a branch.
Choose the main branch.
Select / (root) as the folder.
Click Save.
🎉 Your application will be available at:


text
https://YOUR-USERNAME.github.io/REPO-NAME/
🎨 Design Highlights

Spice Route combines a warm, Indian-inspired color palette with a modern and responsive interface.


Element	Design
🎨 Background	Warm cream #FFF9F0
🧡 Primary Accent	Vibrant orange #E67E22
🤎 Typography	Deep brown
🌈 Logo	Crimson-to-saffron gradient
🪟 Navbar	Glassmorphism with backdrop-filter: blur(12px)
🍽️ Recipe Cards	Smooth hover transitions and elevated shadows
🇮🇳 Indian Badge	Tricolour-inspired gradient
⏳ Loading Spinner	Animated CSS keyframes
UI & Animation Features

Clean and modern navigation bar.
Smooth hover effects on recipe cards.
Animated loading spinner.
Fade-up hero section animation.
Responsive CSS Grid and Flexbox layouts.
Consistent spacing, typography, and colors.
♿ Accessibility

Accessibility is an important part of Spice Route.

The application includes:

Semantic HTML elements.
ARIA labels for interactive components.
Keyboard navigation using Tab and Enter.
aria-live="polite" for dynamic search results.
Proper modal accessibility attributes.
Visible :focus-visible outlines.
Lazy-loaded recipe images.
🔮 Future Enhancements

Here are some features planned for future versions:

❤️ Save and favorite recipes using LocalStorage.
🌙 Dark mode toggle.
🥗 Vegetarian and vegan dietary filters.
📤 Share recipes using the Web Share API.
🖨️ Print-friendly recipe pages.
🔎 Search history and autocomplete suggestions.
🥑 Nutritional information display.
👩‍💻 Author

Kanika Agarwal

Passionate about building interactive, user-friendly web applications using modern web technologies.

<p> <a href="https://github.com/kanikaagarwal006"> <img src="https://img.shields.io/badge/GitHub-kanikaagarwal006-181717?style=for-the-badge&logo=github" alt="GitHub Profile" /> </a> </p>

📄 License

This project is open source and available under the MIT License.

See the LICENSE file for more details.

Recipe data is provided by TheMealDB. Please respect their terms of use.

<p align="center"> Made with ❤️ and a lot of 🌶️ <br /> <strong>Spice Route — Where Every Search Leads to Something Delicious!</strong> </p>
