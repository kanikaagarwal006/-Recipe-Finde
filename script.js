// Base API URL
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

// State to track current filter
let currentFilter = 'all'; // 'all', 'indian', or ingredient

// Load recipes on page load
window.onload = function() {
    loadAllRecipes();
};

// Load all recipes (mix of Indian and international)
async function loadAllRecipes() {
    showLoading();
    currentFilter = 'all';
    
    try {
        // Get popular categories
        const categories = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'Thai', 'American', 'French'];
        let allRecipes = [];
        
        // Fetch recipes from different cuisines
        for (let category of categories) {
            try {
                const response = await fetch(`${BASE_URL}filter.php?a=${category}`);
                const data = await response.json();
                
                if (data.meals) {
                    // Take 3 recipes from each cuisine
                    const recipes = data.meals.slice(0, 3);
                    
                    // Get detailed info
                    for (let meal of recipes) {
                        const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                        const detailData = await detailResponse.json();
                        allRecipes.push(detailData.meals[0]);
                    }
                }
            } catch (e) {
                console.log(`Error fetching ${category} recipes`);
            }
        }
        
        // Also add some random recipes
        for (let i = 0; i < 5; i++) {
            try {
                const response = await fetch(`${BASE_URL}random.php`);
                const data = await response.json();
                if (!allRecipes.some(r => r.idMeal === data.meals[0].idMeal)) {
                    allRecipes.push(data.meals[0]);
                }
            } catch (e) {}
        }
        
        // Shuffle array to mix cuisines
        allRecipes = shuffleArray(allRecipes);
        
        if (allRecipes.length > 0) {
            displayRecipes(allRecipes.slice(0, 24));
        } else {
            searchFallback();
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        searchFallback();
    }
}

// Load only Indian recipes
async function loadIndianDishes() {
    showLoading();
    currentFilter = 'indian';
    
    try {
        // Get all Indian dishes
        const response = await fetch(`${BASE_URL}filter.php?a=Indian`);
        const data = await response.json();
        
        if (data.meals) {
            const indianDishes = data.meals.slice(0, 24);
            
            // Get detailed info for each dish
            const detailedDishes = await Promise.all(
                indianDishes.map(async (meal) => {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals[0];
                })
            );
            
            displayRecipes(detailedDishes);
        } else {
            searchIndianByIngredients();
        }
    } catch (error) {
        console.error('Error loading Indian dishes:', error);
        searchIndianByIngredients();
    }
}

// Search by ingredient (includes all cuisines)
async function searchRecipes() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('Please enter an ingredient');
        return;
    }
    
    showLoading();
    currentFilter = searchTerm;
    
    try {
        const response = await fetch(`${BASE_URL}filter.php?i=${searchTerm}`);
        const data = await response.json();
        
        if (data.meals) {
            const recipes = data.meals.slice(0, 24);
            
            // Get detailed info
            const detailedRecipes = await Promise.all(
                recipes.map(async (meal) => {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals[0];
                })
            );
            
            displayRecipes(detailedRecipes);
        } else {
            showNoResults(`No recipes found with "${searchTerm}"`);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search recipes');
    }
}

// Search Indian dishes by ingredient
async function searchIndianDish(ingredient = null) {
    let searchTerm = ingredient;
    
    if (!searchTerm) {
        searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    }
    
    if (!searchTerm) {
        alert('Please enter an ingredient');
        return;
    }
    
    showLoading();
    currentFilter = `indian-${searchTerm}`;
    
    try {
        const response = await fetch(`${BASE_URL}filter.php?i=${searchTerm}`);
        const data = await response.json();
        
        if (data.meals) {
            const indianMeals = [];
            
            for (let meal of data.meals.slice(0, 20)) {
                const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                const detailData = await detailResponse.json();
                const mealDetail = detailData.meals[0];
                
                if (mealDetail.strArea === 'Indian') {
                    indianMeals.push(mealDetail);
                }
            }
            
            if (indianMeals.length > 0) {
                displayRecipes(indianMeals);
            } else {
                // Show international recipes as fallback
                const internationalMeals = [];
                for (let meal of data.meals.slice(0, 12)) {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    internationalMeals.push(detailData.meals[0]);
                }
                
                if (internationalMeals.length > 0) {
                    document.getElementById('results').innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; margin-bottom: 20px;">
                            <div style="background: #FFE5B4; padding: 15px; border-radius: 10px; display: inline-block;">
                                ⚠️ No pure Indian dishes found. Showing international recipes with "${searchTerm}"
                            </div>
                        </div>
                    ` + internationalMeals.map(meal => createRecipeCard(meal)).join('');
                } else {
                    showNoResults(`No dishes found with "${searchTerm}"`);
                }
            }
        } else {
            showNoResults(`No dishes found with "${searchTerm}"`);
        }
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search recipes');
    }
}

// Load recipes by cuisine
async function loadCuisine(cuisine) {
    showLoading();
    currentFilter = cuisine;
    
    try {
        const response = await fetch(`${BASE_URL}filter.php?a=${cuisine}`);
        const data = await response.json();
        
        if (data.meals) {
            const recipes = data.meals.slice(0, 18);
            
            const detailedRecipes = await Promise.all(
                recipes.map(async (meal) => {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals[0];
                })
            );
            
            displayRecipes(detailedRecipes);
        } else {
            showNoResults(`No recipes found for ${cuisine} cuisine`);
        }
    } catch (error) {
        console.error('Cuisine error:', error);
        showError('Failed to fetch cuisine recipes');
    }
}

// Load recipes by category
async function loadCategory(category) {
    showLoading();
    currentFilter = category;
    
    try {
        const response = await fetch(`${BASE_URL}filter.php?c=${category}`);
        const data = await response.json();
        
        if (data.meals) {
            const recipes = data.meals.slice(0, 18);
            
            const detailedRecipes = await Promise.all(
                recipes.map(async (meal) => {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    return detailData.meals[0];
                })
            );
            
            displayRecipes(detailedRecipes);
        } else {
            showNoResults(`No recipes found in ${category} category`);
        }
    } catch (error) {
        console.error('Category error:', error);
        showError('Failed to fetch category recipes');
    }
}

// Load random recipe
async function loadRandomRecipe() {
    showLoading();
    currentFilter = 'random';
    
    try {
        const response = await fetch(`${BASE_URL}random.php`);
        const data = await response.json();
        displayRecipes([data.meals[0]]);
    } catch (error) {
        console.error('Random recipe error:', error);
        showError('Failed to fetch random recipe');
    }
}

// Search fallback using common ingredients
async function searchFallback() {
    const ingredients = ['chicken', 'rice', 'pasta', 'potato', 'fish', 'egg'];
    let allRecipes = [];
    
    showLoading();
    
    for (let ingredient of ingredients) {
        try {
            const response = await fetch(`${BASE_URL}filter.php?i=${ingredient}`);
            const data = await response.json();
            
            if (data.meals) {
                for (let meal of data.meals.slice(0, 3)) {
                    const detailResponse = await fetch(`${BASE_URL}lookup.php?i=${meal.idMeal}`);
                    const detailData = await detailResponse.json();
                    if (!allRecipes.some(r => r.idMeal === detailData.meals[0].idMeal)) {
                        allRecipes.push(detailData.meals[0]);
                    }
                }
            }
        } catch (error) {
            console.log(`Error fetching ${ingredient}`);
        }
    }
    
    if (allRecipes.length > 0) {
        displayRecipes(shuffleArray(allRecipes).slice(0, 24));
    } else {
        showNoResults('No recipes found. Please try again.');
    }
}

// Create recipe card HTML
function createRecipeCard(meal) {
    const isIndian = meal.strArea === 'Indian';
    return `
        <div class="recipe-card" onclick="showRecipeDetails('${meal.idMeal}')" style="${isIndian ? 'border: 3px solid #FF9933;' : ''}">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
            <div class="card-content">
                <span class="category-tag" style="background: ${isIndian ? 'linear-gradient(135deg, #FF9933, #138808)' : 'linear-gradient(135deg, #667eea, #764ba2)'};">
                    ${isIndian ? '🇮🇳 ' + (meal.strCategory || 'Indian') : (meal.strCategory || 'Recipe')}
                </span>
                <h3>${meal.strMeal} ${isIndian ? '🇮🇳' : ''}</h3>
                <p>${meal.strArea || 'International'} Cuisine</p>
            </div>
        </div>
    `;
}

// Display recipes in grid
function displayRecipes(meals) {
    const resultsDiv = document.getElementById('results');
    
    if (!meals || meals.length === 0) {
        showNoResults('No recipes found');
        return;
    }
    
    // Count Indian dishes
    const indianCount = meals.filter(m => m.strArea === 'Indian').length;
    
    // Add filter info
    let filterInfo = '';
    if (currentFilter === 'all') {
        filterInfo = `<div style="grid-column: 1/-1; text-align: center; margin-bottom: 20px; color: white;">
            <p>Showing <strong>${meals.length}</strong> recipes from around the world (🇮🇳 ${indianCount} Indian dishes)</p>
        </div>`;
    }
    
    resultsDiv.innerHTML = filterInfo + meals.map(meal => createRecipeCard(meal)).join('');
}

// Show recipe details in modal
async function showRecipeDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        const isIndian = meal.strArea === 'Indian';
        
        // Generate ingredients list
        let ingredients = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            
            if (ingredient && ingredient.trim()) {
                ingredients += `
                    <li>
                        <strong>${measure}</strong> ${ingredient}
                    </li>
                `;
            }
        }
        
        // Modal content
        document.getElementById('modalContent').innerHTML = `
            <span class="close-btn" onclick="closeModal()">&times;</span>
            
            <div class="modal-header">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h2>${meal.strMeal} ${isIndian ? '🇮🇳' : ''}</h2>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="background: ${isIndian ? '#FF9933' : '#667eea'}; color: white; padding: 5px 20px; border-radius: 25px; font-weight: 600;">
                    ${meal.strArea} Cuisine
                </span>
            </div>
            
            <div class="ingredients-section">
                <h3>📝 Ingredients</h3>
                <ul class="ingredients-list">
                    ${ingredients}
                </ul>
            </div>
            
            <div class="instructions-section">
                <h3>👩‍🍳 Instructions</h3>
                <p>${meal.strInstructions.replace(/\n/g, '<br>')}</p>
            </div>
            
            ${meal.strYoutube ? `
                <a href="${meal.strYoutube}" target="_blank" class="video-btn">
                    ▶ Watch Video Tutorial
                </a>
            ` : ''}
            
            <div style="margin-top: 20px; color: #999; font-size: 14px;">
                <p>Category: ${meal.strCategory} | Tags: ${meal.strTags || 'Not available'}</p>
            </div>
        `;
        
        // Show modal
        document.getElementById('recipeModal').style.display = 'block';
        
    } catch (error) {
        console.error('Details error:', error);
        alert('Failed to load recipe details');
    }
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Show loading state
function showLoading() {
    document.getElementById('results').innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <div class="loading-spinner"></div>
            <p style="color: white; margin-top: 20px;">Finding delicious recipes from around the world...</p>
        </div>
    `;
}

// Show no results message
function showNoResults(message) {
    document.getElementById('results').innerHTML = `
        <div class="no-results" style="grid-column: 1/-1;">
            <p style="font-size: 24px; margin-bottom: 20px;">😕 No recipes found</p>
            <p>${message || 'Try searching with a different ingredient'}</p>
            <button onclick="loadAllRecipes()" style="margin-top: 20px; padding: 10px 30px; background: white; border: none; border-radius: 25px; cursor: pointer;">
                Show All Recipes
            </button>
        </div>
    `;
}

// Show error message
function showError(message) {
    document.getElementById('results').innerHTML = `
        <div class="error" style="grid-column: 1/-1;">
            <p style="font-size: 18px;">❌ ${message}</p>
            <button onclick="loadAllRecipes()" style="margin-top: 20px; padding: 10px 30px; background: white; border: none; border-radius: 25px; cursor: pointer;">
                Try Again
            </button>
        </div>
    `;
}

// Close modal
function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('recipeModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchIndianDish();
            }
        });
    }
});