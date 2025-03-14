/***********************
 * ADD RECIPE LOGIC
 ***********************/
function addIngredientField() {
  const container = document.getElementById("ingredientsContainer");
  const div = document.createElement("div");
  div.innerHTML = `
    <input type="text" placeholder="Nume ingredient" class="ingredient-name">
    <input type="number" placeholder="Cantitate" class="ingredient-quantity">
    <select class="ingredient-unit">
      <option value="GRAM">GRAM</option>
      <option value="KILOGRAM">KILOGRAM</option>
      <option value="LITRU">LITRU</option>
      <option value="BUCATA">BUCATA</option>
    </select>
    <button onclick="removeIngredientField(this)">X</button>
  `;
  container.appendChild(div);
}

function removeIngredientField(btn) {
  btn.parentElement.remove();
}

function saveRecipe() {
  // Colectăm datele din formular
  const name = document.getElementById("name").value;
  const instructions = document.getElementById("instructions").value;
  const notes = document.getElementById("notes").value;
  const externalLink = document.getElementById("externalLink").value;
  const imagePath = document.getElementById("imagePath").value;

  // Colectăm ingredientele
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

  // Creăm obiectul JSON
  const recipeDTO = {
    name: name,
    instructions: instructions,
    notes: notes,
    externalLink: externalLink,
    imagePath: imagePath,
    ingredients: ingredients
  };

  // Trimitem la backend
  fetch("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipeDTO)
  })
    .then(response => response.json())
    .then(data => {
      alert("Rețeta a fost salvată cu ID-ul: " + data.id);
      window.location.href = "/"; // Ne întoarcem la pagina principală
    })
    .catch(error => console.error("Eroare la salvare:", error));
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
function fetchAllRecipes() {
  fetch("/api/recipes")
    .then(response => response.json())
    .then(data => {
      let container = document.getElementById("allRecipesContainer");
      container.innerHTML = "<h3>Toate rețetele</h3>";
      data.forEach(recipe => {
        container.innerHTML += `<p onclick="goToRecipe(${recipe.id})" style="cursor:pointer; color:blue;">${recipe.name}</p>`;
      });
    })
    .catch(error => console.error("Eroare la încărcarea rețetelor:", error));
}
