// ===============================
// CONSTANTS
// ===============================
const UNIT_OPTIONS = [{
	key: "GRAM",
	abbreviation: "g",
	plural: "g",
	label: "gram"
}, {
	key: "KILOGRAM",
	abbreviation: "kg",
	plural: "kg",
	label: "kilogram"
}, {
	key: "MILLILITER",
	abbreviation: "ml",
	plural: "ml",
	label: "milliliter"
}, {
	key: "LITER",
	abbreviation: "liter",
	plural: "liters",
	label: "liter"
}, {
	key: "CUP",
	abbreviation: "cup",
	plural: "cups",
	label: "cup"
}, {
	key: "TABLESPOON",
	abbreviation: "tbsp",
	plural: "tbsp",
	label: "tablespoon"
}, {
	key: "TEASPOON",
	abbreviation: "tsp",
	plural: "tsp",
	label: "teaspoon"
}, {
	key: "PIECE",
	abbreviation: "pcs",
	plural: "pcs",
	label: "piece"
}, {
	key: "OUNCE",
	abbreviation: "oz",
	plural: "oz",
	label: "ounce"
}, {
	key: "POUND",
	abbreviation: "lb",
	plural: "lbs",
	label: "pound"
}, {
	key: "PINCH",
	abbreviation: "pinch",
	plural: "pinches",
	label: "pinch"
}, {
	key: "DASH",
	abbreviation: "dash",
	plural: "dashes",
	label: "dash"
}, {
	key: "SLICE",
	abbreviation: "slice",
	plural: "slices",
	label: "slice"
}, {
	key: "CLOVE",
	abbreviation: "clove",
	plural: "cloves",
	label: "clove"
}, {
	key: "STALK",
	abbreviation: "stalk",
	plural: "stalks",
	label: "stalk"
}];
const PUBLIC_PATHS = ["/", "/login", "/register", "/public-recipes", "/demo-tour", "/forgot-password", "/reset-password", "/public-recipe-free"];
const PROTECTED_PATHS = ['/home', '/add-recipe', '/all-recipes'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
let toastTimeoutId = null; // stores the current toast timeout
// ===============================
// SESSION MANAGEMENT
// ===============================
function checkSession(path, isProtected) {
	return fetch('/api/recipes/session-test', {
		headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": getCsrfToken()
        },
        credentials: "include"
	}).then(response => response.text()).then(text => {
		const isLoggedIn = !text.includes("Login") && !text.toLowerCase().includes("welcome back");
		if (isProtected && !isLoggedIn) {
			console.warn("Session expired or not authenticated, redirecting to login...");
			window.location.href = '/login';
			return false;
		}
		if (!isProtected && isLoggedIn) {
			console.log("Session is active on server, redirecting...");
			if (path === "/public-recipes") {
				window.location.href = "/public-recipes-user";
			} else if (path.startsWith("/public-recipe-free/")) {
				const id = path.split("/").pop();
				window.location.href = `/public-recipe-user/${id}`;
			} else {
				window.location.href = "/home";
			}
			return false;
		}
		return true;
	}).catch(error => {
		console.error("Session check failed:", error);
		if (isProtected) window.location.href = '/login';
		return !isProtected;
	});
}
// ===============================
// TOAST NOTIFICATIONS
// ===============================
function showToast(message, isSuccess = true) {
	const toast = document.getElementById("toastMessage");
	// Clear any previous timeout so it doesn't auto-hide too early
	clearTimeout(toastTimeoutId);
	// Remove previous classes and hide status
	toast.classList.remove("toast-success", "toast-error", "hide");
	// Add appropriate class
	toast.classList.add(isSuccess ? "toast-success" : "toast-error");
	// Set content and show
	toast.innerHTML = `
		<span>${message}</span>
		<div class="close-btn" onclick="hideToast()">×</div>
	`;
	toast.style.display = "flex";
	// Set new timeout to hide after 5 seconds
	toastTimeoutId = setTimeout(() => {
		hideToast();
	}, 5000);
}

function hideToast() {
	const toast = document.getElementById("toastMessage");
	toast.classList.add("hide");
	setTimeout(() => {
		toast.style.display = "none";
		toast.classList.remove("hide");
	}, 300);
}
// ===============================
// RECIPE MANAGEMENT
// ===============================
function addIngredientField() {
	const container = document.getElementById("ingredientsContainer");
	const div = document.createElement("div");
	div.className = "ingredient-entry rounded p-3 mb-3 bg-light-subtle";
	let unitOptionsHtml = `<option value="" disabled selected hidden>Select unit</option>`;
	UNIT_OPTIONS.forEach(unit => {
		unitOptionsHtml += `<option value="${unit.key}" title="${unit.label}">${unit.abbreviation}</option>`;
	});
	div.innerHTML = `
		<div class="form-row">
			<div class="form-group col-md-5">
				<input type="text" class="form-control ingredient-name" placeholder="Ingredient name" />
			</div>
			<div class="form-group col-md-3">
				<input type="number" min="0" step="1" class="form-control ingredient-quantity" placeholder="Quantity" />
			</div>
			<div class="form-group col-md-3">
				<select class="form-control ingredient-unit">
					${unitOptionsHtml}
				</select>
			</div>
			<div class="form-group col-md-1 d-flex align-items-start">
				<button type="button"
                        class="btn btn-danger btn-sm"
                        onclick="removeIngredientField(this)"
                        title="Remove ingredient"
                        style="height: 100%; display: flex; align-items: center; justify-content: center; padding-top: 0.375rem; padding-bottom: 0.375rem;">
                    <i class="bi bi-trash"></i>
                </button>
			</div>
		</div>
	`;
	container.appendChild(div);
}

function removeIngredientField(btn) {
	const entry = btn.closest(".ingredient-entry");
	if (entry) entry.remove();
}
async function saveRecipe() {
	const name = document.getElementById("name").value;
	const instructions = document.getElementById("instructions").value;
	const notes = document.getElementById("notes").value;
	const externalLink = document.getElementById("externalLink").value;
	let ingredients = [];
	const ingredientNames = document.getElementsByClassName("ingredient-name");
	const ingredientQuantities = document.getElementsByClassName("ingredient-quantity");
	const ingredientUnits = document.getElementsByClassName("ingredient-unit");
	for (let i = 0; i < ingredientNames.length; i++) {
		const name = ingredientNames[i].value.trim();
		const quantityValue = ingredientQuantities[i].value.trim();
		const unit = ingredientUnits[i].value;
		if (!name) {
			showToast("Please enter a name for each ingredient.", false);
			return;
		}
		if (name.length > 50) {
			showToast("Ingredient name is too long. Maximum 50 characters allowed.", false);
			return;
		}
		const parsedQuantity = parseFloat(quantityValue);
		if (!quantityValue || isNaN(parsedQuantity)) {
			showToast("Please enter a valid quantity for \"" + name + "\".", false);
			return;
		}
		if (parsedQuantity <= 0) {
			showToast("Quantity must be greater than zero for \"" + name + "\".", false);
			return;
		}
		if (parsedQuantity > 100000) {
			showToast("Quantity too large for \"" + name + "\". Maximum allowed is 100,000.", false);
			return;
		}
		if (!unit) {
			showToast("Please select a unit of measure for \"" + name + "\".", false);
			return;
		}
		ingredients.push({
			name: name,
			quantity: parseFloat(quantityValue),
			unit: unit
		});
	}
	if (!name.trim()) {
		showToast("Please give your recipe a title before saving.", false);
		return;
	}
	const recipeDTO = {
		name: name,
		instructions: instructions,
		notes: notes,
		externalLink: externalLink,
		ingredients: ingredients
	};
	const formData = new FormData();
	formData.append("recipeDTO", new Blob([JSON.stringify(recipeDTO)], {
		type: "application/json"
	}));
	const imageFile = document.getElementById("imageFile").files[0];
	if (imageFile) {
		if (imageFile.size > MAX_IMAGE_SIZE) {
			showToast("Image too large. Please upload a file smaller than 5MB.", false);
			return;
		}
		formData.append("imageFile", imageFile);
	}
	try {
		const response = await fetch("/api/recipes", {
			method: "POST",
			body: formData
		});
		const data = await response.json();
		if (!data?.id) {
			throw new Error("Recipe was not saved correctly. Please try again.");
		}
		showToast("Recipe saved successfully.", true);
		setTimeout(() => {
			window.location.href = "/home";
		}, 2000);
	} catch (error) {
		console.error("Save error:", error);
		showToast("Failed to save recipe. " + error.message, false);
	}
}
// ===============================
// IMAGE HANDLING – Remove selected image
// ===============================
function removeSelectedImage() {
	const previewContainer = document.getElementById("imagePreviewContainer");
	previewContainer.innerHTML = "";
	const statusText = document.getElementById("fileStatusText");
	if (statusText) statusText.textContent = "No image selected yet.";
	const fileInput = document.getElementById("imageFile");
	if (fileInput) fileInput.value = "";
	const errorDiv = document.getElementById("errorMessage");
	if (errorDiv) {
		errorDiv.classList.add("d-none");
		errorDiv.textContent = "";
	}
}
// ===============================
// RECIPE DISPLAY & PAGINATION
// ===============================
function renderRecipeCards(recipes) {
	const currentPath = window.location.pathname;
	const isPublicPage = currentPath.includes("public-recipes");
	const isLoggedIn = !!localStorage.getItem("loggedUser");
	return recipes.map(recipe => {
		let baseUrl;
		if (isPublicPage) {
			baseUrl = isLoggedIn ? "/public-recipe-user" : "/public-recipe-free";
		} else {
			baseUrl = "/recipe";
		}
		return `
      <div class="col-sm-6 col-md-4 col-lg-4 mb-4">
        <div class="card shadow-sm h-100">
          <img src="${recipe.imagePath || '/img/core-img/placeholder.jpg'}"
               class="card-img-top"
               alt="${recipe.name}"
               style="max-height: 200px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${recipe.name}</h5>
            <a class="btn btn-sm btn-outline-primary mt-auto" href="${baseUrl}/${recipe.id}">
              Show me the dish
            </a>
          </div>
        </div>
      </div>
    `;
	}).join('');
}

function renderPagination(data, page, callback) {
	const paginationContainer = document.getElementById("paginationContainer");
	if (data.totalPages <= 1) {
		paginationContainer.innerHTML = "";
		return;
	}
	const maxVisiblePages = 5;
	let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
	let endPage = Math.min(data.totalPages - 1, startPage + maxVisiblePages - 1);
	startPage = Math.max(0, endPage - maxVisiblePages + 1);
	let paginationHtml = `
	<div class="pagination-wrapper text-center mx-auto">
	  <ul class="pagination justify-content-center flex-wrap mb-0">
	    <li class="page-item ${page === 0 ? "disabled" : ""}">
	      <button class="page-link" ${page === 0 ? "disabled" : ""}
	              onclick="${callback}(${page - 1})">
	        &laquo; Previous
	      </button>
	    </li>
	`;
	for (let i = startPage; i <= endPage; i++) {
		paginationHtml += `
	    <li class="page-item ${i === page ? "active" : ""}">
	      <button class="page-link" onclick="${callback}(${i})">${i + 1}</button>
	    </li>
	  `;
	}
	paginationHtml += `
	    <li class="page-item ${page === data.totalPages - 1 ? "disabled" : ""}">
	      <button class="page-link" ${page === data.totalPages - 1 ? "disabled" : ""}
	              onclick="${callback}(${page + 1})">
	        Next &raquo;
	      </button>
	    </li>
	  </ul>
	</div>
	`;
	paginationContainer.innerHTML = paginationHtml;
}
async function fetchAllRecipes(page = 0, size = 6) {
	try {
		const name = document.getElementById('filter-name')?.value || "";
		const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
		const params = new URLSearchParams({
			page,
			size
		});
		if (name) params.append("name", name);
		ingredients.forEach(ing => params.append("ingredients", ing));
		const response = await fetch(`/api/recipes?${params.toString()}`);
		const data = await response.json();
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
              <div class="col-12 d-flex justify-content-center mt-4">
                <div class="no-results-message text-center">
                  <p>Your cookbook is empty for now. Add your favorite recipes and let the collection grow.</p>
                </div>
              </div>
            `;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
          <div class="container">
            <div class="row justify-content-center g-4">
              ${renderRecipeCards(data.content)}
            </div>
          </div>
        `;
		renderPagination(data, page, 'fetchAllRecipes');
	} catch (error) {
		console.error("Error loading recipes:", error);
		document.getElementById("allRecipesContainer").innerHTML = "<p class='text-center text-danger'>Oops! Something went wrong...</p>";
	}
}
// ===============================
// PUBLIC RECIPE MANAGEMENT
// ===============================
async function fetchPublicRecipes(page = 0, size = 6) {
	try {
		const name = document.getElementById('filter-name')?.value || "";
		const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
		const params = new URLSearchParams({
			page,
			size
		});
		if (name) params.append("name", name);
		ingredients.forEach(ing => params.append("ingredients", ing));
		const response = await fetch(`/api/recipes/public?${params.toString()}`);
		const data = await response.json();
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
				<div class="col-12 d-flex justify-content-center mt-4">
					<div class="no-results-message text-center">
						<p>No recipes found. Try changing the filters!</p>
					</div>
				</div>`;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
			<div class="container">
				<div class="row justify-content-center g-4">
					${renderRecipeCards(data.content)}
				</div>
			</div>
		`;
		renderPagination(data, page, 'fetchPublicRecipes');
	} catch (error) {
		console.error("Error loading public recipes:", error);
		document.getElementById("allRecipesContainer").innerHTML = `
			<p class='text-center text-danger'>Oops! Something went wrong...</p>`;
	}
}

function filterPublicRecipes(page = 0, size = 6) {
	const name = document.getElementById('filter-name').value;
	const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
	const params = new URLSearchParams({
		page,
		size
	});
	if (name) params.append("name", name);
	ingredients.forEach(ing => params.append("ingredients", ing));
	fetch(`/api/recipes/public?${params.toString()}`).then(res => res.json()).then(data => {
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
					<div class="col-12 d-flex justify-content-center mt-4">
						<div class="no-results-message text-center">
							<p>No featured recipes match your filters. Try adjusting them and search again.</p>
						</div>
					</div>`;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
				<div class="row row-cols-1 row-cols-md-3 g-4">
					${renderRecipeCards(data.content)}
				</div>`;
		renderPagination(data, page, 'filterPublicRecipes');
	}).catch(error => {
		console.error("Error filtering public recipes:", error);
		showToast("🚨 Failed to filter public recipes", false);
	});
}

function resetPublicFilters() {
	document.getElementById("filter-name").value = "";
	const ingredientContainer = document.getElementById("ingredient-container");
	ingredientContainer.innerHTML = `
		<input type="text" class="form-control mb-2 ingredient-input" placeholder="Search by ingredient" list="ingredient-suggestions" autocomplete="off">`;
	fetchPublicRecipes(0);
}
async function fetchPublicRecipesUser(page = 0, size = 6) {
	try {
		const name = document.getElementById('filter-name')?.value || "";
		const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
		const params = new URLSearchParams({
			page,
			size
		});
		if (name) params.append("name", name);
		ingredients.forEach(ing => params.append("ingredients", ing));
		const response = await fetch(`/api/recipes/public-authenticated?${params.toString()}`, {
			credentials: 'same-origin'
		});
		const data = await response.json();
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
				<div class="col-12 d-flex justify-content-center mt-4">
					<div class="no-results-message text-center">
						<p>No featured recipes match your filters. Try adjusting them and search again.</p>
					</div>
				</div>`;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
			<div class="container">
				<div class="row justify-content-center g-4">
					${renderRecipeCards(data.content)}
				</div>
			</div>
		`;
		renderPagination(data, page, 'fetchPublicRecipesUser');
	} catch (error) {
		console.error("Error loading public user recipes:", error);
		document.getElementById("allRecipesContainer").innerHTML = `
			<p class='text-center text-danger'>Oops! Something went wrong...</p>`;
	}
}

function resetPublicUserFilters() {
	document.getElementById("filter-name").value = "";
	const ingredientContainer = document.getElementById("ingredient-container");
	ingredientContainer.innerHTML = `
		<input type="text"
		class="form-control mb-2 ingredient-input"
		placeholder="Search by ingredient"
		list="ingredient-suggestions"
		autocomplete="off">`;
	fetchPublicRecipesUser(0);
}

function filterPublicRecipesUser(page = 0, size = 6) {
	const name = document.getElementById('filter-name').value;
	const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
	const params = new URLSearchParams({
		page,
		size
	});
	if (name) params.append("name", name);
	ingredients.forEach(ing => params.append("ingredients", ing));
	fetch(`/api/recipes/public/user?${params.toString()}`).then(res => res.json()).then(data => {
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
					<div class="col-12 d-flex justify-content-center mt-4">
						<div class="no-results-message text-center">
							<p>No results found. Try adjusting your filters!</p>
						</div>
					</div>`;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
				<div class="row row-cols-1 row-cols-md-3 g-4">
					${renderRecipeCards(data.content)}
				</div>`;
		renderPagination(data, page, 'filterPublicRecipesUser');
	}).catch(error => {
		console.error("Error filtering public user recipes:", error);
		showToast("🚨 Failed to filter recipes", false);
	});
}
// ===============================
// INGREDIENT INPUT – add extra field for filtering
// ===============================
function addIngredientInput() {
	const container = document.getElementById('ingredient-container');
	if (!container) return;
	const currentInputs = container.querySelectorAll('.ingredient-entry');
	if (currentInputs.length >= 10) {
		showToast("You can add up to 10 ingredients.", false);
		return;
	}
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group mb-2 ingredient-entry';
	const input = document.createElement('input');
	input.type = 'text';
	input.className = 'form-control ingredient-input';
	input.placeholder = 'Add another ingredient';
	input.setAttribute("list", "ingredient-suggestions");
	input.setAttribute("autocomplete", "off");
	// ✅ Buton X vizibil și stilizat
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'btn btn-outline-danger';
	btn.innerHTML = '<i class="bi bi-trash text-white"></i>';
	btn.title = 'Remove';
	btn.style.display = 'flex';
	btn.style.alignItems = 'center';
	btn.style.justifyContent = 'center';
	btn.style.minWidth = '38px';
	btn.style.backgroundColor = 'rgba(220,53,69)'; // ✅ vizibil fără să fie agresiv
	btn.style.border = '1px solid #dc3545';
	btn.onclick = () => wrapper.remove();
	wrapper.appendChild(input);
	wrapper.appendChild(btn);
	container.appendChild(wrapper);
}

function filterRecipes(page = 0, size = 6) {
	const name = document.getElementById('filter-name').value;
	const ingredients = Array.from(document.querySelectorAll('.ingredient-input')).map(input => input.value.trim()).filter(val => val !== "");
	if (!name && ingredients.length === 0) {
		fetchAllRecipes();
		return;
	}
	const params = new URLSearchParams({
		page,
		size
	});
	if (name) params.append("name", name);
	ingredients.forEach(ing => params.append("ingredients", ing));
	fetch(`/api/recipes/filter?${params.toString()}`).then(res => res.json()).then(data => {
		const container = document.getElementById("allRecipesContainer");
		if (!data.content?.length) {
			container.innerHTML = `
              <div class="col-12 d-flex justify-content-center mt-4">
                <div class="no-results-message text-center">
                  <p>Nothing found. Please refine your search.</p>
                </div>
              </div>
            `;
			document.getElementById("paginationContainer").innerHTML = "";
			return;
		}
		container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${renderRecipeCards(data.content)}
        </div>
      `;
		renderPagination(data, page, 'filterRecipes');
	}).catch(error => {
		console.error("Error filtering recipes:", error);
		showToast("🚨 Failed to filter recipes", false);
	});
}

function resetFilters() {
	document.getElementById("filter-name").value = "";
	const ingredientContainer = document.getElementById("ingredient-container");
	ingredientContainer.innerHTML = `
    <input type="text"
    class="form-control mb-2 ingredient-input"
    placeholder="Search by ingredient"
    list="ingredient-suggestions"
    autocomplete="off">
  `;
	fetchAllRecipes(0);
}
// ===============================
// RECIPE NAVIGATION
// ===============================
function goToRecipe(recipeId) {
	window.location.href = "/recipe/" + recipeId;
}
async function searchByIngredients() {
	const input = document.getElementById("searchIngredients").value;
	const ingredientsArray = input.split(",").map(item => item.trim());
	if (ingredientsArray.length === 0 || ingredientsArray.every(i => i === "")) {
		showToast("⚠️ Please enter at least one ingredient", false);
		return;
	}
	try {
		const response = await fetch("/api/recipes/search-by-ingredients?ingredients=" + ingredientsArray.join(","));
		const data = await response.json();
		const resultsDiv = document.getElementById("searchResults");
		resultsDiv.innerHTML = "<h3>Results</h3>";
		if (data.length === 0) {
			resultsDiv.innerHTML += "<p>No recipes found.</p>";
		} else {
			resultsDiv.innerHTML += data.map(recipe => `
        <p onclick="goToRecipe(${recipe.id})" style="cursor:pointer; color:blue;">${recipe.name}</p>
      `).join('');
		}
	} catch (error) {
		console.error("Search error:", error);
		showToast("🚨 Failed to search recipes", false);
	}
}
// ===============================
// SINGLE RECIPE PAGE DISPLAY
// ===============================
function formatUnit(unitKey, quantity) {
	const unit = UNIT_OPTIONS.find(u => u.key === unitKey);
	if (!unit) return unitKey; // fallback la text brut
	// Folosește plural dacă e cantitate diferită de 1
	return quantity !== 1 ? unit.plural : unit.abbreviation;
}

function loadRecipeDetails() {
	const path = window.location.pathname;
	const recipeId = path.substring(path.lastIndexOf("/") + 1);
	let currentRecipeId = null;
	fetch(`/api/recipes/${recipeId}`).then(response => {
		if (response.redirected) {
			window.location.href = response.url;
			return;
		}
		if (response.status === 403) {
			throw new Error("ACCESS_DENIED");
		}
		if (!response.ok) {
			throw new Error("NOT_FOUND");
		}
		return response.json();
	}).then(recipe => {
		currentRecipeId = recipe.id;
		// ✅ 1. Titlu
		const titleEl = document.getElementById("recipeTitle");
		if (titleEl) titleEl.textContent = recipe.name;
		// ✅ 2. Instrucțiuni
		const instructionsEl = document.getElementById("recipeInstructions");
		if (instructionsEl && recipe.instructions) {
			const isLink = recipe.instructions.startsWith("http://") || recipe.instructions.startsWith("https://");
			const formatted = isLink ? `<a href="${recipe.instructions}" target="_blank" class="link-primary text-decoration-none">${recipe.instructions} 🔗</a>` : recipe.instructions.replace(/\n/g, "<br>");
			instructionsEl.innerHTML = `
                	<div class="mb-4">
                		<p class="text-dark">${formatted}</p>
                	</div>
                `;
		}
		// ✅ 2b. Notes (dacă există)
		const notesEl = document.getElementById("recipeNotes");
		if (notesEl && recipe.notes) {
			const notesText = notesEl.querySelector("p");
			if (notesText) notesText.innerHTML = recipe.notes.replace(/\n/g, "<br>");
			notesEl.style.display = "block";
		}
		// ✅ 2c. External link (dacă există)
		const externalLinkWrapper = document.getElementById("recipeExternalLink");
		const externalAnchor = document.getElementById("externalLinkAnchor");
		if (externalLinkWrapper && externalAnchor && recipe.externalLink) {
			externalAnchor.href = recipe.externalLink;
			externalAnchor.textContent = recipe.externalLink;
			externalLinkWrapper.style.display = "block";
		}
		// ✅ 3. Imagine slider
		const slider = document.querySelector(".receipe-slider");
		if (slider) {
			slider.innerHTML = `
					<img src="${recipe.imagePath || '/img/core-img/placeholder.jpg'}"
					     alt="Recipe Image"
					     class="img-fluid rounded"
					     style="max-height: 500px; object-fit: cover; width: 100%;">
				`;
		}
		// ✅ 4. Ingrediente
		const ingredientsEl = document.getElementById("recipeIngredients");
		if (ingredientsEl && recipe.ingredients?.length) {
			const list = recipe.ingredients.map(ing => {
				const unitText = formatUnit(ing.unit, ing.quantity);
				const quantity = parseFloat(ing.quantity).toLocaleString("en-US", {
					maximumFractionDigits: 2
				});
				const safeId = "chk-" + ing.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
				return `
                		<div class="custom-control custom-checkbox mb-2">
                			<input type="checkbox" class="custom-control-input" id="${safeId}">
                			<label class="custom-control-label" for="${safeId}">
                				${quantity} ${unitText} ${ing.name}
                			</label>
                		</div>`;
			}).join('');
			ingredientsEl.innerHTML = list;
		}
		// ✅ 5. Butoane edit/delete
		const actionsEl = document.getElementById("recipeActions");
		if (actionsEl) {
			actionsEl.innerHTML = `
            		<a href="/edit-recipe/${recipe.id}" class="btn delicious-btn" style="margin-right: 12px;">Edit Recipe</a>
            		<button id="deleteBtn" class="btn delicious-btn text-white" style="background-color: #a40000; border-color: #6b0000;" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal">
            			Delete Recipe
            		</button>
            	`;
		}
	}).catch(error => {
		console.error("Error loading recipe:", error);
		let message = "Recipe not found or error loading.";
		if (error.message === "ACCESS_DENIED") {
			message = "You are not allowed to view this recipe.";
		}
		showToast(message, false);
		setTimeout(() => window.location.href = "/home", 2500);
	});
	// ✅ 6. Setup buton ștergere
	const deleteBtn = document.getElementById("confirmDeleteBtn");
	if (deleteBtn) {
		deleteBtn.addEventListener("click", () => {
			if (!currentRecipeId) return;
			fetch(`/api/recipes/${currentRecipeId}`, {
				method: "DELETE"
			}).then(res => {
				if (!res.ok) throw new Error("Deletion failed.");
				window.location.href = "/all-recipes?deleted=true";
			}).catch(err => alert("Error deleting: " + err.message));
		});
	}
}

function loadPublicRecipeDetails() {
	// 1️⃣ Extragem ID-ul din URL
	const recipeId = window.location.pathname.split("/").pop();
	const addBtn = document.getElementById("addToMyRecipesBtn");
	let currentId = null;
	fetch(`/api/recipes/public/by-id/${recipeId}`).then(r => {
		if (!r.ok) throw new Error("Recipe not found.");
		return r.json();
	}).then(recipe => {
		// ✅ Dacă nu e rețetă de la userul „system”, redirecționează
		if (recipe.user.username !== "system") {
			showToast("This recipe is not public.", false);
			window.location.href = "/public-recipes-user";
			return;
		}
		currentId = recipe.id;
		/* ---- Populăm pagina (aceleași fragmente ca în loadRecipeDetails) ---- */
		const titleEl = document.getElementById("recipeTitle");
		if (titleEl) titleEl.textContent = recipe.name;
		/* Instrucțiuni */
		const instructionsEl = document.getElementById("recipeInstructions");
		if (instructionsEl && recipe.instructions) {
			const isLink = /^https?:\/\//i.test(recipe.instructions);
			const formatted = isLink ? `<a href="${recipe.instructions}" target="_blank" class="link-primary text-decoration-none">
                           ${recipe.instructions} 🔗
                       </a>` : recipe.instructions.replace(/\n/g, "<br>");
			instructionsEl.innerHTML = `<div class="mb-4"><p class="text-dark">${formatted}</p></div>`;
		}
		/* Notes (dacă există) */
		const notesWrap = document.getElementById("recipeNotes");
		if (notesWrap && recipe.notes) {
			notesWrap.querySelector("p").innerHTML = recipe.notes.replace(/\n/g, "<br>");
			notesWrap.style.display = "block";
		}
		/* External link */
		const extWrap = document.getElementById("recipeExternalLink");
		const extA = document.getElementById("externalLinkAnchor");
		if (extWrap && extA && recipe.externalLink) {
			extA.href = recipe.externalLink;
			extA.textContent = recipe.externalLink;
			extWrap.style.display = "block";
		}
		/* Imagine */
		const slider = document.querySelector(".receipe-slider");
		if (slider) {
			slider.innerHTML = `
                    <img src="${recipe.imagePath || '/img/core-img/placeholder.jpg'}"
                         class="img-fluid rounded"
                         style="max-height:500px; object-fit:cover; width:100%;"
                         alt="${recipe.name}">
                `;
		}
		/* Ingrediente */
		const ingWrap = document.getElementById("recipeIngredients");
		if (ingWrap && recipe.ingredients?.length) {
			ingWrap.innerHTML = recipe.ingredients.map(ing => {
				const unitTxt = formatUnit(ing.unit, ing.quantity);
				const quantity = parseFloat(ing.quantity).toLocaleString("en-US", {
					maximumFractionDigits: 2
				});
				return `<p class="mb-1">${quantity} ${unitTxt} ${ing.name}</p>`;
			}).join("");
		}
		/* ---- Buton Add to My Recipes ---- */
		if (addBtn) {
			const loggedUser = localStorage.getItem("loggedUser");
			if (!loggedUser) {
				addBtn.remove(); // 🔹 elimină complet butonul dacă userul nu e logat
			} else {
				addBtn.style.display = "inline-block";
				addBtn.addEventListener("click", () => addPublicRecipeToUser(currentId));
			}
		}
	}).catch(err => {
		console.error(err);
		showToast("Could not load recipe.", false);
		setTimeout(() => window.location.href = "/public-recipes-user", 2500);
	});
}
/* Helper optional pentru clonare */
function addPublicRecipeToUser(publicRecipeId) {
	fetch(`/api/recipes/copy/${publicRecipeId}`, {
		method: "POST"
	}).then(r => {
		if (!r.ok) throw new Error("Copy failed");
		return r.json();
	}).then(newRecipe => {
		showToast("Recipe added to your collection!", true);
		// Trimite userul direct la rețeta copiată
		setTimeout(() => window.location.href = `/recipe/${newRecipe.id}`, 1500);
	}).catch(err => {
		console.error(err);
		showToast("Could not add recipe.", false);
	});
}
// ===============================
// USER MANAGEMENT
// ===============================
function setupForms() {
	setupRegisterForm();
	setupLoginForm();
}

function setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Get form values
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Validate inputs (keep your existing validation)
        if (!validateInputs(username, email, password, confirmPassword)) return;

        try {
            // 1. First ensure we have a CSRF token
            await fetch("/api/csrf-token", {
                method: "GET",
                credentials: "include"
            });

            // 2. Get the CSRF token from cookies
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];

            if (!csrfToken) {
                showToast("Security error. Please refresh the page and try again.", false);
                return;
            }

            // 3. Send registration request with CSRF token
            const response = await fetch("/api/users/register", {
                method: "POST",
                credentials: "include", // Required for cookies
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            if (response.ok) {
                showToast("Registration successful. Please check your email to activate your account.", true);
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            } else {
                const errorData = await response.json();
                showToast(errorData.error || "Registration failed. Please try again.", false);
            }
        } catch (error) {
            console.error("Registration error:", error);
            showToast("Network error. Please check your connection.", false);
        }
    });

    // Extracted validation function
    function validateInputs(username, email, password, confirmPassword) {
        const usernameRegex = /^[a-zA-Z0-9_.]{4,20}$/;
        const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;

        if (!username || !usernameRegex.test(username)) {
            showToast("Invalid username format", false);
            return false;
        }
        if (!email || !emailPattern.test(email)) {
            showToast("Invalid email format", false);
            return false;
        }
        if (!password || password.length < 8 || password.length > 64) {
            showToast("Password must be 8-64 characters", false);
            return false;
        }
        if (password !== confirmPassword) {
            showToast("Passwords don't match", false);
            return false;
        }
        return true;
    }
}

function setupLoginForm() {
	const form = document.getElementById("loginForm");
	if (!form) return;

	form.addEventListener("submit", async function(event) {
		event.preventDefault();
		const username = document.getElementById("username").value.trim();
		const password = document.getElementById("password").value.trim();

		if (!username) {
			showToast("Please enter your username.", false);
			return;
		}
		if (!password) {
			showToast("Please enter your password.", false);
			return;
		}

		try {
		    // 1. Get CSRF token (forces Spring to set cookie)
            await fetch("/api/csrf-token", {
                method: "GET",
                credentials: "include"
            });

            // 2. Extract token from cookie
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showToast("Security error. Please refresh the page and try again.", false);
                return;
            }

            // 3. Send login request with token in header
            const response = await fetch("/api/users/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

			if (response.ok) {
				localStorage.setItem("loggedUser", username);
				showToast("Welcome back. You have logged in successfully.", true);
				setTimeout(() => {
					window.location.href = "/home";
				}, 2000);
			} else {
				const errorData = await response.json();
				showToast((errorData.error || "Login failed. Please try again!"), false);
			}
		} catch (error) {
			console.error("Login error:", error);
			showToast("Unexpected error. Our oven might be on fire! 🔥", false);
		}
	});
}

function checkLoggedInUser() {
	const username = localStorage.getItem("loggedUser");
	const nameSpan = document.getElementById("navbarUsername");
	if (username && nameSpan) {
		nameSpan.textContent = username;
	}
	const heroSpans = document.querySelectorAll(".usernameHeroPlaceholder");
	heroSpans.forEach(span => {
		span.textContent = username;
	});
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("logout") === "success") {
		showToast("You have been logged out successfully.", true);
		window.history.replaceState({}, document.title, "/");
	}
}

function setupLogout() {
	const logoutButton = document.getElementById("logoutButton");
	if (!logoutButton) return;
	logoutButton.addEventListener("click", logoutUser);
}
async function logoutUser() {
	try {
		localStorage.removeItem("loggedUser");
		await fetch('/api/users/logout', {
			method: 'POST',
			credentials: 'same-origin'
		});
		window.location.href = "/?logout=success";
	} catch (error) {
		console.error("Logout request failed:", error);
		window.location.href = "/?logout=success";
	}
}
// ===============================
// CSRF Token – Read from cookie
// ===============================
function getCsrfToken() {
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}
// ========== Ingredient Autocomplete Setup ==========
function setupIngredientAutocomplete() {
	document.addEventListener("input", function(e) {
		if (e.target.classList.contains("ingredient-input")) {
			const input = e.target;
			const datalistId = input.getAttribute("list") || "ingredient-suggestions";
			const query = input.value.trim();
			if (query.length === 0) return;
			fetch(`/api/ingredients/autocomplete?prefix=${encodeURIComponent(query)}`).then(res => res.json()).then(data => {
				let datalist = document.getElementById(datalistId);
				if (!datalist) {
					datalist = document.createElement("datalist");
					datalist.id = datalistId;
					document.body.appendChild(datalist);
					input.setAttribute("list", datalistId);
				}
				datalist.innerHTML = "";
				data.forEach(name => {
					const option = document.createElement("option");
					option.value = name;
					datalist.appendChild(option);
				});
			}).catch(err => {
				console.error("Autocomplete error:", err);
			});
		}
	});
}

function setupRecipeAutocomplete() {
	const input = document.getElementById("filter-name");
	if (!input) return;
	input.addEventListener("input", function() {
		const query = input.value.trim();
		if (query.length === 0) return;
		fetch(`/api/recipes/autocomplete?prefix=${encodeURIComponent(query)}`).then(res => res.json()).then(data => {
			let datalist = document.getElementById("recipe-suggestions");
			if (!datalist) {
				datalist = document.createElement("datalist");
				datalist.id = "recipe-suggestions";
				document.body.appendChild(datalist);
			}
			datalist.innerHTML = "";
			data.forEach(name => {
				const option = document.createElement("option");
				option.value = name;
				datalist.appendChild(option);
			});
		}).catch(err => {
			console.error("Recipe name autocomplete error:", err);
		});
	});
}
// ===============================
// INITIALIZATION
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/csrf", { credentials: "same-origin" })
        .then(() => console.log("✅ CSRF token loaded from /csrf"))
        .catch(() => console.warn("⚠️ CSRF token fetch failed"));
	const currentPath = window.location.pathname;
	console.log("Current path is:", currentPath);
	// ✅ Afișăm toast dacă s-a activat contul din linkul de activare
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get("deleted") === "true") {
		showToast("Recipe deleted successfully.", true);
	}
	if (urlParams.get("activated") === "true") {
		showToast("Account activated! You can now log in.", true);
	} else if (urlParams.get("activationError") === "true") {
		showToast("Invalid or expired activation link.", false);
	} else if (urlParams.get("redirected") === "true") {
		showToast("Please log in to access that page.", false);
	}
	const isPublicPath = PUBLIC_PATHS.some(path => currentPath === path || currentPath.startsWith(path + "/"));
	const isProtectedPath = PROTECTED_PATHS.includes(currentPath) || currentPath.startsWith("/edit-recipe") || currentPath.startsWith("/recipe");
	// ✅ Verificare separată
	if (isProtectedPath) {
		checkSession(currentPath, true); // redirect dacă nu e logat
	} else if (isPublicPath) {
		checkSession(currentPath, false); // NU redirectează dacă nu e logat
	}
	if (currentPath === "/public-recipes") {
		fetchPublicRecipes();
	} else if (currentPath === "/public-recipes-user") {
		fetchPublicRecipesUser(0);
	} else if (currentPath.startsWith("/public-recipe-user/") || currentPath.startsWith("/public-recipe-free/")) {
		loadPublicRecipeDetails();
	} else if (document.getElementById("allRecipesContainer")) {
		fetchAllRecipes();
	}
	setupForms();
	setupLogout();
	checkLoggedInUser();
	if (currentPath.startsWith("/recipe/")) {
		loadRecipeDetails();
	}
	// ✅ Autocomplete (numai dacă e nevoie)
	if (document.getElementById("filter-name")) {
		setupRecipeAutocomplete();
	}
	if (document.querySelector(".ingredient-input")) {
		setupIngredientAutocomplete();
	}
	// ✅ 1. Setup formular adăugare rețetă
	const addRecipeForm = document.getElementById("addRecipeForm");
	if (addRecipeForm) {
		addRecipeForm.addEventListener("submit", function(event) {
			event.preventDefault();
			saveRecipe();
		});
	}
	// ✅ 2. Tooltipuri Bootstrap
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
	// ✅ 3. Text sub buton upload
	const imageInput = document.getElementById("imageFile");
	if (imageInput) {
		imageInput.addEventListener("change", function() {
			const fileName = this.files[0]?.name || "No file yet... Let’s spice things up!";
			const statusText = document.getElementById("fileStatusText");
			if (statusText) {
				statusText.textContent = fileName;
			}
		});
	}
	// ✅ 4. Preview imagine și buton „×”
	if (imageInput) {
		imageInput.addEventListener("change", function() {
			const file = this.files[0];
			const preview = document.getElementById("imagePreviewContainer");
			const statusText = document.getElementById("fileStatusText");
			if (file) {
				const reader = new FileReader();
				reader.onload = function(e) {
					preview.innerHTML = `
						<div style="position: relative; display: inline-block;">
							<img src="${e.target.result}" alt="Preview"
								class="image-preview-animate"
								style="max-width: 150px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); margin-bottom: 8px;">
							<button type="button" onclick="removeSelectedImage()"
									title="Remove image"
									style="position: absolute; top: 6px; right: 6px;
											background: rgba(255, 255, 255, 0.8);
											border: none;
											border-radius: 50%;
											width: 28px; height: 28px;
											display: flex; align-items: center; justify-content: center;
											font-size: 1.1rem;
											box-shadow: 0 0 4px rgba(0,0,0,0.3);
											cursor: pointer;">
								<i class="bi bi-trash text-danger"></i>
							</button>
						</div>
						<div class="text-muted small fst-italic">${file.name}</div>
					`;
				};
				const errorDiv = document.getElementById("errorMessage");
				if (errorDiv) {
					errorDiv.classList.add("d-none");
					errorDiv.textContent = "";
				}
				reader.readAsDataURL(file);
				if (statusText) statusText.textContent = "";
			} else {
				preview.innerHTML = "";
				if (statusText) statusText.textContent = "No file yet... Let’s spice things up!";
			}
		});
	}
	// ✅ Formular contact (dacă există pe pagină)
	const form = document.getElementById("contact-form");
	if (form) {
		form.addEventListener("submit", function(e) {
			e.preventDefault();
			const name = document.getElementById("contactName").value.trim();
			const message = document.getElementById("contactMessage").value.trim();
			if (!message) {
				showToast("Please enter a message.", false);
				return;
			}
			fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					name,
					message
				})
			}).then(response => response.text()).then(data => {
				showToast(data, true);
				form.reset();
			}).catch(error => {
				console.error("Error:", error);
				showToast("Something went wrong.", false);
			});
		});
	}
});
