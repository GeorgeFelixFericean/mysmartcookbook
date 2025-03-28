/***********************
 * ADD RECIPE LOGIC
 ***********************/
function addIngredientField() {
  const container = document.getElementById("ingredientsContainer");

  const div = document.createElement("div");
  div.classList.add("ingredient-row");

  div.innerHTML = `
    <input type="text" placeholder="Nume ingredient" class="form-control ingredient-name" style="flex:2">
    <input type="number" placeholder="Cantitate" class="form-control ingredient-quantity" style="flex:1">
    <select class="form-control ingredient-unit" style="flex:1">
      <option value="GRAM">g</option>
      <option value="KILOGRAM">kg</option>
      <option value="MILLILITER">ml</option>
      <option value="LITER">l</option>
      <option value="CUP">cup</option>
      <option value="TABLESPOON">tbsp</option>
      <option value="TEASPOON">tsp</option>
      <option value="PIECE">buc</option>
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
        alert("Rețeta a fost salvată cu ID-ul: " + data.id);
        window.location.href = "/";
    })
    .catch(error => {
        console.error("Eroare la salvare:", error);
        alert("Eroare: " + error.message);
    });
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
  // Într-un proiect mai complex, ai avea o pagină dedicată /recipe/{id}
  // Pentru exemplu, doar alertăm ID-ul:
  //  alert("Ar trebui să mergi la detaliile rețetei cu ID: " + recipeId);
  window.location.href = "/recipe/" + recipeId;
}


/***********************
 * ALL RECIPES
 ***********************/
// [MODIFICAT PENTRU CARDURI]
function fetchAllRecipes() {
  fetch("/api/recipes")
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById("allRecipesContainer");

      // Cream un grid de carduri (Bootstrap) cu 1 col pe ecrane mici, 3 col pe ecrane medii
      container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${data.map(recipe => `
            <div class="col">
              <div class="card shadow-sm">
                <!-- Imaginea. Dacă nu există recipe.imageUrl, folosim un placeholder. -->
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
                    Detalii
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    })
    .catch(error => console.error("Eroare la încărcarea rețetelor:", error));
}

function filterRecipes() {
  const name = document.getElementById('filter-name').value;
  const ingredientInputs = document.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs)
    .map(input => input.value.trim())
    .filter(val => val !== "");

  const query = new URLSearchParams();
  if (name) query.append("name", name);
  ingredients.forEach(ing => query.append("ingredients", ing));

  console.log("Trimitem request cu:", query.toString());

  fetch(`/api/recipes/filter?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      let container = document.getElementById("allRecipesContainer");

      if (data.length === 0) {
        container.innerHTML = "<p class='text-center'>Nu s-au găsit rețete.</p>";
        return;
      }

      container.innerHTML = `
        <div class="row row-cols-1 row-cols-md-3 g-4">
          ${data.map(recipe => `
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
                    Detalii
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    })
    .catch(error => console.error("Eroare la filtrare:", error));
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
  fetchAllRecipes(); // reîncarcă toate rețetele
}