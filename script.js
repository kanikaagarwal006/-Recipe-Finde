const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

let activeRequestId = 0;
const recipeCache = new Map();

const INGREDIENT_ALIASES = {
    chicken: ["chicken"],
    paneer: ["paneer", "cottage cheese"],
    dal: ["dal", "lentil", "lentils"],
    fish: ["fish"],
    mutton: ["mutton", "lamb", "goat"],
    rice: ["rice"],
    cauliflower: ["cauliflower"],
    eggplant: ["eggplant", "aubergine", "brinjal"],
    coconut: ["coconut"],
    spinach: ["spinach"],
    potato: ["potato", "potatoes"],
    egg: ["egg", "eggs"]
};

const QUICK_SEARCHES = {
    chicken: { type: "ingredient", term: "chicken" },
    paneer: { type: "ingredient", term: "paneer" },
    dal: { type: "ingredient", term: "dal" },
    fish: { type: "ingredient", term: "fish" },
    mutton: { type: "dish", term: "Rogan Josh", fallback: "mutton" },
    rice: { type: "dish", term: "biryani", fallback: "rice" },
    cauliflower: { type: "ingredient", term: "cauliflower" },
    eggplant: { type: "ingredient", term: "eggplant" },
    coconut: { type: "ingredient", term: "coconut" },
    spinach: { type: "ingredient", term: "spinach" }
};

// MealDB filter.php?a= (area filter) is broken on the free tier — returns null.
// We work around this by searching curated dish/ingredient keywords per cuisine.
const CUISINE_KEYWORDS = {
    Indian:   { dishes: ["chicken", "paneer", "dal", "biryani", "curry", "tandoori", "masala", "korma"], area: "india" },
    Italian:  { dishes: ["pasta", "pizza", "risotto", "lasagne", "tiramisu"], area: "italian" },
    Chinese:  { dishes: ["kung pao", "fried rice", "dim sum", "wonton", "noodle", "congee"], area: "chinese" },
    Mexican:  { dishes: ["taco", "burrito", "enchilada", "quesadilla", "guacamole"], area: "mexican" },
    Japanese: { dishes: ["sushi", "ramen", "tempura", "teriyaki", "katsu", "miso"], area: "japanese" },
    Thai:     { dishes: ["pad thai", "green curry", "tom yum", "satay", "basil"], area: "thai" },
    Turkish:  { dishes: ["kebab", "baklava", "kofte", "pide", "doner", "mansaf"], area: "turkish" },
    French:   { dishes: ["ratatouille", "coq au vin", "quiche", "boeuf", "crepe"], area: "french" }
};

let indianRecipesPromise = null;

function setActivePill(cuisine) {
    document.querySelectorAll(".category-pill").forEach(pill => {
        pill.classList.toggle(
            "active-pill",
            cuisine !== null && pill.dataset.cuisine === cuisine
        );
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                performIngredientSearch();
            }
        });
    }

    loadGlobalMix();
});

async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
    }

    return response.json();
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function startLoading(message) {
    const requestId = ++activeRequestId;
    const results = document.getElementById("results");

    results.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>${escapeHTML(message)}</p>
        </div>
    `;

    return requestId;
}

function isCurrentRequest(requestId) {
    return requestId === activeRequestId;
}

async function getRecipeDetails(id) {
    if (recipeCache.has(id)) {
        return recipeCache.get(id);
    }

    const promise = fetchJSON(
        `${BASE_URL}lookup.php?i=${encodeURIComponent(id)}`
    )
        .then(data => {
            if (!data.meals || !data.meals[0]) {
                throw new Error("Recipe details not found");
            }

            return data.meals[0];
        })
        .catch(error => {
            recipeCache.delete(id);
            throw error;
        });

    recipeCache.set(id, promise);

    return promise;
}

function showNoResults(message) {
    document.getElementById("results").innerHTML = `
        <div class="empty-state">
            <h2>😕 No recipes found</h2>
            <p>${escapeHTML(message)}</p>
            <button class="search-btn retry-btn" onclick="loadGlobalMix()">
                Show all recipes
            </button>
        </div>
    `;
}

function showError(message) {
    document.getElementById("results").innerHTML = `
        <div class="error-message">
            <p>⚠️ ${escapeHTML(message)}</p>
            <p>Please check your internet connection and try again.</p>
        </div>
    `;
}

function loadGlobalMix() {
    return loadAllRecipes();
}

async function searchByKeywords(keywords) {
    // Search MealDB by dish name for each keyword and collect unique results.
    const responses = await Promise.allSettled(
        keywords.map(kw =>
            fetchJSON(`${BASE_URL}search.php?s=${encodeURIComponent(kw)}`)
                .then(d => d.meals || [])
                .catch(() => [])
        )
    );

    const all = responses
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value);

    // Deduplicate by meal ID
    return [...new Map(all.map(m => [m.idMeal, m])).values()];
}

async function loadAllRecipes() {
    setActivePill("Global");

    const requestId = startLoading(
        "Loading recipes from different cuisines..."
    );

    // Pick 2 representative keywords per cuisine for a quick global mix
    const globalKeywords = [
        "chicken", "biryani", "pasta", "pizza",
        "kung pao", "taco", "sushi", "pad thai",
        "kebab", "curry", "ramen", "masala"
    ];

    try {
        const meals = await searchByKeywords(globalKeywords);

        if (!isCurrentRequest(requestId)) return;

        shuffleArray(meals);

        if (meals.length) {
            displayRecipes(meals.slice(0, 24));
        } else {
            showNoResults(
                "The recipe service did not return any recipes."
            );
        }

    } catch (error) {
        console.error("Global recipes error:", error);

        if (isCurrentRequest(requestId)) {
            showError("Unable to load recipes.");
        }
    }
}

async function loadIndianDishes() {
    return loadCuisine("Indian");
}

async function loadCuisine(cuisine) {
    setActivePill(cuisine);

    const requestId = startLoading(
        `Loading ${cuisine} recipes...`
    );

    const config = CUISINE_KEYWORDS[cuisine];
    const keywords = config ? config.dishes : [cuisine.toLowerCase()];
    const areaMatch = config ? config.area : cuisine.toLowerCase();

    try {
        const allMeals = await searchByKeywords(keywords);

        if (!isCurrentRequest(requestId)) return;

        // Prefer meals that match the cuisine area, but show all if none match
        const cuisineMeals = allMeals.filter(
            m => (m.strArea || m.strCountry || "").toLowerCase().includes(areaMatch)
        );

        const toShow = cuisineMeals.length ? cuisineMeals : allMeals;

        if (toShow.length) {
            displayRecipes(toShow.slice(0, 24));
        } else {
            showNoResults(
                `No recipes are currently listed for ${cuisine} cuisine.`
            );
        }

    } catch (error) {
        console.error(`${cuisine} recipes error:`, error);

        if (isCurrentRequest(requestId)) {
            showError(`Unable to load ${cuisine} recipes.`);
        }
    }
}

function performIngredientSearch() {
    return searchIndianDish();
}

function quickSearchByIngredient(ingredient) {
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.value = ingredient;
    }

    const selected = QUICK_SEARCHES[ingredient];

    if (!selected) {
        return searchIndianDish(ingredient);
    }

    if (selected.type === "dish") {
        return searchDish(
            selected.term,
            selected.fallback
        );
    }

    return searchIndianDish(ingredient);
}

async function searchDish(dishName, fallbackIngredient) {
    setActivePill(null);

    const requestId = startLoading(
        `Searching for ${dishName}...`
    );

    try {
        const data = await fetchJSON(
            `${BASE_URL}search.php?s=${encodeURIComponent(dishName)}`
        );

        if (!isCurrentRequest(requestId)) return;

        const meals = data.meals || [];

        if (meals.length) {
            displayRecipes(meals.slice(0, 24));
            return;
        }

        if (fallbackIngredient) {
            await searchIndianDish(fallbackIngredient);
        } else {
            showNoResults(
                `No recipes matching ${dishName} were found.`
            );
        }

    } catch (error) {
        console.error("Dish search error:", error);

        if (isCurrentRequest(requestId)) {
            showError("Unable to search for this dish.");
        }
    }
}

function getSearchTerms(searchTerm) {
    const normalized = searchTerm.toLowerCase().trim();

    return INGREDIENT_ALIASES[normalized] || [normalized];
}

function recipeHasIngredient(meal, terms) {
    const ingredients = [];

    for (let index = 1; index <= 20; index++) {
        const ingredient = meal[`strIngredient${index}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push(ingredient.trim().toLowerCase());
        }
    }

    return ingredients.some(item =>
        terms.some(term => wordMatch(item, term))
    );
}

function wordMatch(text, term) {
    // Whole-word match so "egg" does not match "eggplant".
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp("\\b" + safe + "s?\\b", "i").test(text);
}

function recipeMatches(meal, terms) {
    const name = (meal.strMeal || "").toLowerCase();

    return (
        recipeHasIngredient(meal, terms) ||
        terms.some(term => wordMatch(name, term))
    );
}

async function loadIndianRecipeDetails() {
    const data = await fetchJSON(
        `${BASE_URL}filter.php?a=Indian`
    );

    return data.meals || [];
}

async function getDetailsInBatches(
    meals,
    requestId,
    batchSize = 8
) {
    const allDetails = [];

    for (
        let index = 0;
        index < meals.length;
        index += batchSize
    ) {
        if (requestId !== null && !isCurrentRequest(requestId)) {
            return [];
        }

        const batch = meals.slice(
            index,
            index + batchSize
        );

        const details = await Promise.all(
            batch.map(meal =>
                getRecipeDetails(meal.idMeal).catch(error => {
                    console.warn(
                        `Could not load recipe ${meal.idMeal}:`,
                        error
                    );

                    return null;
                })
            )
        );

        allDetails.push(
            ...details.filter(Boolean)
        );
    }

    return allDetails;
}

function getIndianRecipes() {
    // Download Indian recipes once, then reuse for all searches.
    // Reduced to 30 recipes and larger batch size (15) to avoid slow serial round-trips.
    if (!indianRecipesPromise) {
        indianRecipesPromise = (async () => {
            const summaries = await loadIndianRecipeDetails();
            const details = await getDetailsInBatches(
                summaries.slice(0, 30),
                null,
                15
            );

            if (!details.length) {
                throw new Error("No Indian recipes could be loaded");
            }

            return details;
        })().catch(error => {
            indianRecipesPromise = null;
            throw error;
        });
    }

    return indianRecipesPromise;
}

async function searchIndianDish(ingredient = null) {
    const input = document.getElementById("searchInput");

    const searchTerm = String(
        ingredient || input?.value || ""
    ).trim();

    setActivePill(null);

    if (!searchTerm) {
        showNoResults(
            "Please type an ingredient such as chicken, paneer or rice."
        );
        return;
    }

    if (input && ingredient) {
        input.value = ingredient;
    }

    const requestId = startLoading(
        `Searching Indian recipes with ${searchTerm}...`
    );

    const terms = getSearchTerms(searchTerm.toLowerCase());

    try {
        // Fast path 1: search MealDB by dish name (instant, no prefetch needed)
        const nameData = await fetchJSON(
            `${BASE_URL}search.php?s=${encodeURIComponent(searchTerm)}`
        );

        if (!isCurrentRequest(requestId)) return;

        const nameMatches = (nameData.meals || []).filter(
            meal => (meal.strArea || meal.strCountry || "").toLowerCase().includes("india")
        );

        if (nameMatches.length) {
            displayRecipes(nameMatches.slice(0, 24));
            return;
        }

        // Fast path 2: search MealDB by ingredient directly
        const primaryTerm = terms[0];
        const ingredientData = await fetchJSON(
            `${BASE_URL}filter.php?i=${encodeURIComponent(primaryTerm)}`
        );

        if (!isCurrentRequest(requestId)) return;

        const ingredientMeals = ingredientData.meals || [];

        if (ingredientMeals.length) {
            // We have summaries; get details to check area & filter Indian ones
            const details = await getDetailsInBatches(
                ingredientMeals.slice(0, 20),
                requestId,
                10
            );

            if (!isCurrentRequest(requestId)) return;

            const indianMatches = details.filter(
                meal => (meal.strArea || meal.strCountry || "").toLowerCase().includes("india")
            );

            if (indianMatches.length) {
                displayRecipes(indianMatches.slice(0, 24));
                return;
            }

            // No Indian-specific results — show all matching recipes
            if (details.length) {
                displayRecipes(details.slice(0, 24));
                return;
            }
        }

        // Fallback: search the prefetched Indian recipe list
        const indianRecipes = await getIndianRecipes();

        if (!isCurrentRequest(requestId)) return;

        const matches = indianRecipes.filter(meal =>
            recipeMatches(meal, terms)
        );

        if (matches.length) {
            displayRecipes(matches.slice(0, 24));
        } else {
            showNoResults(
                `No recipes found for "${searchTerm}". Try chicken, paneer, rice or another ingredient.`
            );
        }

    } catch (error) {
        console.error("Ingredient search error:", error);

        if (isCurrentRequest(requestId)) {
            showError(
                "Unable to search recipes. Please try again."
            );
        }
    }
}

async function searchRecipes() {
    return searchIndianDish();
}

async function loadCategory(category) {
    const requestId = startLoading(
        `Loading ${category} recipes...`
    );

    try {
        const data = await fetchJSON(
            `${BASE_URL}filter.php?c=${encodeURIComponent(category)}`
        );

        if (!isCurrentRequest(requestId)) return;

        const summaries = data.meals || [];

        const details = await getDetailsInBatches(
            summaries.slice(0, 24),
            requestId
        );

        if (!isCurrentRequest(requestId)) return;

        if (details.length) {
            displayRecipes(details);
        } else {
            showNoResults(
                `No recipes found in ${category}.`
            );
        }

    } catch (error) {
        console.error("Category error:", error);

        if (isCurrentRequest(requestId)) {
            showError("Unable to load this category.");
        }
    }
}

async function loadRandomRecipe() {
    setActivePill(null);

    const requestId = startLoading(
        "Finding a surprise recipe..."
    );

    try {
        const data = await fetchJSON(
            `${BASE_URL}random.php`
        );

        if (!isCurrentRequest(requestId)) return;

        if (data.meals && data.meals[0]) {
            displayRecipes(data.meals);
        } else {
            showNoResults(
                "A random recipe could not be found."
            );
        }

    } catch (error) {
        console.error("Random recipe error:", error);

        if (isCurrentRequest(requestId)) {
            showError("Unable to load a random recipe.");
        }
    }
}

function shuffleArray(array) {
    for (
        let index = array.length - 1;
        index > 0;
        index--
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        );

        [array[index], array[randomIndex]] = [
            array[randomIndex],
            array[index]
        ];
    }

    return array;
}

function displayRecipes(meals) {
    const results = document.getElementById("results");

    if (!meals || !meals.length) {
        showNoResults("Try another ingredient or cuisine.");
        return;
    }

    results.innerHTML = meals
        .map(createRecipeCard)
        .join("");
}

function createRecipeCard(meal) {
    const id = escapeHTML(meal.idMeal);
    const name = escapeHTML(
        meal.strMeal || "Untitled recipe"
    );
    const image = escapeHTML(meal.strMealThumb || "");
    const area = escapeHTML(meal.strArea || "Cuisine");
    const category = escapeHTML(
        meal.strCategory || "Recipe"
    );

    const indian = (meal.strArea || meal.strCountry || "").toLowerCase().includes("india");

    return `
        <article
            class="recipe-card"
            tabindex="0"
            role="button"
            aria-label="View recipe: ${name}"
            onclick="showRecipeDetails('${id}')"
            onkeydown="if (event.key === 'Enter') showRecipeDetails('${id}')"
        >
            <img
                src="${image}"
                alt="${name}"
                loading="lazy"
            >

            <div class="card-content">
                <span
                    class="category-tag"
                    style="background:${
                        indian
                            ? "linear-gradient(135deg,#FF9933,#138808)"
                            : "linear-gradient(135deg,#667eea,#764ba2)"
                    }"
                >
                    ${indian ? "🇮🇳 " : ""}${category}
                </span>

                <h3>${name}</h3>
                <p>${area} Cuisine</p>
            </div>
        </article>
    `;
}

async function showRecipeDetails(id) {
    const modal = document.getElementById("recipeModal");
    const content = document.getElementById("modalContent");

    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    content.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading recipe details...</p>
        </div>
    `;

    try {
        const meal = await getRecipeDetails(id);
        const ingredients = [];

        for (let index = 1; index <= 20; index++) {
            const ingredient =
                meal[`strIngredient${index}`]?.trim();

            const measure =
                meal[`strMeasure${index}`]?.trim();

            if (ingredient) {
                ingredients.push(`
                    <li>
                        <strong>${escapeHTML(measure)}</strong>
                        ${escapeHTML(ingredient)}
                    </li>
                `);
            }
        }

        const instructions = escapeHTML(
            meal.strInstructions ||
            "Instructions are not available."
        ).replace(/\r?\n/g, "<br>");

        const youtubeUrl = meal.strYoutube || "";

        const safeYoutubeUrl =
            /^https:\/\/(www\.)?youtube\.com\/|^https:\/\/youtu\.be\//i.test(youtubeUrl)
                ? escapeHTML(youtubeUrl)
                : "";

        const videoId = getYouTubeId(youtubeUrl);

        content.innerHTML = `
            <button
                class="close-btn"
                onclick="closeModal()"
                aria-label="Close"
            >
                &times;
            </button>

            <div class="modal-header">
                <img
                    src="${escapeHTML(meal.strMealThumb)}"
                    alt="${escapeHTML(meal.strMeal)}"
                >

                <h2>${escapeHTML(meal.strMeal)}</h2>
            </div>

            <div style="text-align:center">
                <span class="cuisine-label">
                    ${escapeHTML(meal.strArea || "Unknown")} Cuisine
                </span>
            </div>

            <section class="ingredients-section">
                <h3>📝 Ingredients</h3>

                <ul class="ingredients-list">
                    ${
                        ingredients.length
                            ? ingredients.join("")
                            : "<li>Ingredients unavailable.</li>"
                    }
                </ul>
            </section>

            <section class="instructions-section">
                <h3>👩‍🍳 Instructions</h3>
                <p>${instructions}</p>
            </section>

            ${
                safeYoutubeUrl
                    ? `
                        <section class="video-section">
                            <h3>🎬 Video Tutorial</h3>
                            ${
                                videoId
                                    ? `<div class="video-wrapper">
                                        <iframe
                                            src="https://www.youtube-nocookie.com/embed/${videoId}"
                                            title="${escapeHTML(meal.strMeal)} video tutorial"
                                            loading="lazy"
                                            allowfullscreen
                                        ></iframe>
                                    </div>`
                                    : ""
                            }
                            <a
                                class="video-btn"
                                href="${safeYoutubeUrl}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ▶ Watch on YouTube
                            </a>
                        </section>
                    `
                    : ""
            }

            <p class="recipe-extra">
                Category: ${escapeHTML(meal.strCategory || "Not available")}
                |
                Tags: ${escapeHTML(meal.strTags || "Not available")}
            </p>
        `;

    } catch (error) {
        console.error("Recipe details error:", error);

        content.innerHTML = `
            <button
                class="close-btn"
                onclick="closeModal()"
            >
                &times;
            </button>

            <p class="error-message">
                Unable to load recipe details. Please try again.
            </p>
        `;
    }
}

function getYouTubeId(url) {
    try {
        const parsed = new URL(url);
        let id = "";

        if (parsed.hostname === "youtu.be") {
            id = parsed.pathname.slice(1);
        } else if (/(^|\.)youtube\.com$/.test(parsed.hostname)) {
            id = parsed.searchParams.get("v") || "";
        }

        return /^[\w-]{11}$/.test(id) ? id : "";
    } catch (error) {
        return "";
    }
}

function closeModal() {
    const modal = document.getElementById("recipeModal");

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

window.addEventListener("click", event => {
    const modal = document.getElementById("recipeModal");

    if (event.target === modal) {
        closeModal();
    }
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }
});
