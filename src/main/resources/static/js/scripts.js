const unitOptions = [
  { key: "GRAM", abbreviation: "g", plural: "g" },
  { key: "KILOGRAM", abbreviation: "kg", plural: "kg" },
  { key: "MILLILITER", abbreviation: "ml", plural: "ml" },
  { key: "LITER", abbreviation: "l", plural: "l" },
  { key: "CUP", abbreviation: "cup", plural: "cups" },
  { key: "TABLESPOON", abbreviation: "tbsp", plural: "tbsp" },
  { key: "TEASPOON", abbreviation: "tsp", plural: "tsp" },
  { key: "PIECE", abbreviation: "pcs", plural: "pcs" },
  { key: "OUNCE", abbreviation: "oz", plural: "oz" },
  { key: "POUND", abbreviation: "lb", plural: "lbs" },
  { key: "PINCH", abbreviation: "pinch", plural: "pinches" },
  { key: "DASH", abbreviation: "dash", plural: "dashes" },
  { key: "SLICE", abbreviation: "slice", plural: "slices" },
  { key: "CLOVE", abbreviation: "clove", plural: "cloves" },
  { key: "STALK", abbreviation: "stalk", plural: "stalks" }
];

/***********************
 * ADD RECIPE LOGIC
 ***********************/
function addIngredientField() {
  const container = document.getElementById("ingredientsContainer");

  const div = document.createElement("div");
  div.classList.add("ingredient-row");

  // Generăm opțiunile pentru <select> dinamic
  let unitOptionsHtml = `<option value="" disabled selected hidden>Pick a unit ⚖️</option>`;
  unitOptions.forEach(unit => {
    unitOptionsHtml += `<option value="${unit.key}">${unit.abbreviation}</option>`;
  });

  div.innerHTML = `
    <input type="text" placeholder="What's going in?" class="form-control ingredient-name" style="flex:2">
    <input type="number" placeholder="How much?" class="form-control ingredient-quantity" style="flex:1">
    <select class="form-control ingredient-unit" style="flex:1">
      ${unitOptionsHtml}
    </select>
    <button type="button" class="btn btn-danger btn-sm" onclick="removeIngredientField(this)">×</button>
  `;

  container.appendChild(div);
}

function removeIngredientField(btn) {
  btn.parentElement.remove();
}

function saveRecipe() {
  // 1. Colectăm datele text din formular
  const name = document.getElementById("name").value;
  const instructions = document.getElementById("instructions").value;
  const notes = document.getElementById("notes").value;
//  const externalLink = document.getElementById("externalLink").value;

  // 2. Colectăm ingredientele
  let ingredients = [];
  const ingredientNames = document.getElementsByClassName("ingredient-name");
  const ingredientQuantities = document.getElementsByClassName("ingredient-quantity");
  const ingredientUnits = document.getElementsByClassName("ingredient-unit");

  for (let i = 0; i < ingredientNames.length; i++) {
    ingredients.push({
      name: ingredientNames[i].value,
      quantity: parseFloat(ingredientQuantities[i].value),
      unit: ingredientUnits[i].value
    });
  }

  // Resetăm mesajele de eroare
  document.getElementById("errorMessage").style.display = "none";

  // Validare nume
  if (!name.trim()) {
        showToast("⚠️ Don't leave your masterpiece nameless!", false);
        return;
    }

  // 3. Construim obiectul JSON pentru DTO
  const recipeDTO = {
    name: name,
    instructions: instructions,
    notes: notes,
//    externalLink: externalLink,
    ingredients: ingredients
  };

  // 4. Creăm un obiect FormData
  const formData = new FormData();

  // 5. Adăugăm JSON-ul (DTO) sub formă de string
  formData.append("recipeDTO",  new Blob([JSON.stringify(recipeDTO)], { type: "application/json" }));

  // 6. Luăm fișierul imagine din <input type="file" id="imageFile">
  const imageFile = document.getElementById("imageFile").files[0];
  if (imageFile) {
    formData.append("imageFile", imageFile);
  }

  // 7. Trimitem la backend FĂRĂ să setăm manual Content-Type
  fetch("/api/recipes", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
        if (!data || !data.id) {
            throw new Error("Rețeta nu a fost salvată corect. ID-ul este lipsă.");
        }
        showToast("🎉 Woohoo! Your recipe is safe in the vault!", true);

        // redirect după 2 secunde
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
    })
    .catch(error => {
        console.error("Eroare la salvare:", error);
        alert("Eroare: " + error.message);
    });
}

function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toastMessage");
  toast.className = `toast-message ${isSuccess ? "toast-success" : "toast-error"}`;
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}


/***********************
 * SEARCH BY INGREDIENTS
 ***********************/
function searchByIngredients() {
  const input = document.getElementById("searchIngredients").value;
  // Ex: "faina,apa,drojdie" -> ["faina","apa","drojdie"]
  let ingredientsArray = input.split(",").map(item => item.trim());

  fetch("/api/recipes/search-by-ingredients?ingredients=" + ingredientsArray.join(","))
    .then(response => response.json())
    .then(data => {
      let resultsDiv = document.getElementById("searchResults");
      resultsDiv.innerHTML = "<h3>Rezultate</h3>";
      if (data.length === 0) {
        resultsDiv.innerHTML += "<p>Nicio rețetă găsită.</p>";
      } else {
        data.forEach(recipe => {
          resultsDiv.innerHTML += `<p onclick="goToRecipe(${recipe.id})" style="cursor:pointer; color:blue;">${recipe.name}</p>`;
        });
      }
    })
    .catch(error => console.error("Eroare:", error));
}


/***********************
 * GO TO RECIPE DETAILS
 ***********************/
function goToRecipe(recipeId) {
  window.location.href = "/recipe/" + recipeId;
}

/***********************
 * ALL RECIPES
 ***********************/
function fetchAllRecipes(page = 0, size = 6) {
  const name = document.getElementById('filter-name')?.value || "";
  const ingredientInputs = document.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs)
    .map(input => input.value.trim())
    .filter(val => val !== "");

  const params = new URLSearchParams({ page, size });
  if (name) params.append("name", name);
  ingredients.forEach(ing => params.append("ingredients", ing));

  fetch(`/api/recipes?${params.toString()}`)
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById("allRecipesContainer");

      if (!data.content || data.content.length === 0) {
        container.innerHTML = "<p class='text-center'>No tasty treasures found...</p>";
        document.getElementById("paginationContainer").innerHTML = "";
        return;
      }

      container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${data.content.map(recipe => `
            <div class="col">
              <div class="card shadow-sm">
                <img
                  src="${recipe.imagePath ? recipe.imagePath : '/img/placeholder.jpg'}"
                  class="card-img-top"
                  alt="${recipe.name}"
                  style="max-height: 200px; object-fit: cover;"
                >
                <div class="card-body">
                  <h5 class="card-title">${recipe.name}</h5>
                  <button class="btn btn-sm btn-outline-primary" onclick="goToRecipe(${recipe.id})">
                    🍴 Show me the dish!
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // pagination buttons
      const paginationContainer = document.getElementById("paginationContainer");
      paginationContainer.innerHTML = "";

      if (data.totalPages > 1) {
        const prevDisabled = page === 0 ? "disabled" : "";
        const nextDisabled = page === data.totalPages - 1 ? "disabled" : "";

        paginationContainer.innerHTML = `
          <div class="d-flex justify-content-center mt-4 gap-3">
            <button class="btn btn-warning btn-sm" ${prevDisabled} onclick="fetchAllRecipes(${page - 1})">
                ⬅️ Back to more bites
            </button>

            <button class="btn btn-warning btn-sm" ${nextDisabled} onclick="fetchAllRecipes(${page + 1})">
                Next yummy batch 🍽️
            </button>

          </div>
        `;
      }
    })
    .catch(error => {
      console.error("Error loading recipes:", error);
      document.getElementById("allRecipesContainer").innerHTML = "<p class='text-center text-danger'>Oops! Something went wrong...</p>";
    });
}

function filterRecipes(page = 0, size = 6) {
  const name = document.getElementById('filter-name').value;
  const ingredientInputs = document.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs)
    .map(input => input.value.trim())
    .filter(val => val !== "");

  const query = new URLSearchParams();
  if (name) query.append("name", name);
  ingredients.forEach(ing => query.append("ingredients", ing));
  query.append("page", page);
  query.append("size", size);

  fetch(`/api/recipes/filter?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      let container = document.getElementById("allRecipesContainer");
      if (!data.content || data.content.length === 0) {
        container.innerHTML = "<p class='text-center'>No tasty treasures found...</p>";
        document.getElementById("paginationContainer").innerHTML = "";
        return;
      }

      container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${data.content.map(recipe => `
            <div class="col">
              <div class="card shadow-sm">
                <img
                  src="${recipe.imagePath ? recipe.imagePath : '/img/placeholder.jpg'}"
                  class="card-img-top"
                  alt="${recipe.name}"
                  style="max-height: 200px; object-fit: cover;"
                >
                <div class="card-body">
                  <h5 class="card-title">${recipe.name}</h5>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    onclick="goToRecipe(${recipe.id})"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // pagination buttons
      const paginationContainer = document.getElementById("paginationContainer");
      paginationContainer.innerHTML = "";

      if (data.totalPages > 1) {
        const prevDisabled = page === 0 ? "disabled" : "";
        const nextDisabled = page === data.totalPages - 1 ? "disabled" : "";

        paginationContainer.innerHTML = `
          <div class="d-flex justify-content-center mt-4 gap-3">
            <button class="btn btn-outline-secondary" ${prevDisabled} onclick="filterRecipes(${page - 1})">← Previous</button>
            <button class="btn btn-outline-secondary" ${nextDisabled} onclick="filterRecipes(${page + 1})">Next →</button>
          </div>
        `;
      }
    })
    .catch(error => console.error("Error filtering recipes:", error));
}


document.addEventListener("DOMContentLoaded", () => {
  fetchAllRecipes();
});

function resetFilters() {
  document.getElementById("filter-name").value = "";
  const ingredientContainer = document.getElementById("ingredient-container");
  ingredientContainer.innerHTML = `
    <input type="text" class="form-control mb-2 ingredient-input" placeholder="Ingredient 1">
  `;
  fetchAllRecipes(0); // reîncarcă toate rețetele
}