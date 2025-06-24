// ===============================
// Redirect if session is active (checked on server)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  const publicPaths = ["/", "/login", "/register"];
  if (publicPaths.includes(currentPath)) {
    // Verificăm sesiunea pe server
    fetch('/api/recipes/session-test', {
      credentials: 'same-origin'
    }).then(response => response.text()).then(text => {
      if (!text.includes("Login") && !text.toLowerCase().includes("welcome back")) {
        console.log("Session is active on server, redirecting to /home...");
        window.location.href = "/home";
      }
    }).catch(error => {
      console.error("Session check failed:", error);
      // Nu face nimic, utilizatorul rămâne pe pagina publică
    });
  }
});
// ===============================
// Session validation for protected pages
// ===============================
// Definim rutele protejate exacte
const protectedPaths = ['/home', '/add-recipe', '/all-recipes'];
// Verificăm dacă pagina curentă începe cu /edit-recipe sau /recipe
const path = window.location.pathname;
const isProtectedDynamicPath = path.startsWith('/edit-recipe') || path.startsWith('/recipe');
// Dacă pagina este protejată, verificăm sesiunea
if (protectedPaths.includes(path) || isProtectedDynamicPath) {
  fetch('/api/recipes/session-test', {
    credentials: 'same-origin'
  }).then(response => response.text()).then(text => {
    if (text.includes("Login") || text.toLowerCase().includes("welcome back")) {
      console.warn("Session expired or not authenticated, redirecting to login...");
      window.location.href = '/login';
    }
  }).catch(error => {
    console.error('Session check failed:', error);
    window.location.href = '/login';
  });
}
const unitOptions = [{
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
  abbreviation: "l",
  plural: "l",
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
    unitOptionsHtml += `<option value="${unit.key}" title="${unit.label}">${unit.abbreviation}</option>`;
  });
  div.innerHTML = `
    <input type="text" placeholder="What's going in?" class="form-control ingredient-name" style="flex:2">
        <input type="number"
               placeholder="How much?"
               class="form-control ingredient-quantity"
               step="0.01"
               style="flex:1">
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
  const externalLink = document.getElementById("externalLink").value;
  // 2. Colectăm ingredientele
  let ingredients = [];
  const ingredientNames = document.getElementsByClassName("ingredient-name");
  const ingredientQuantities = document.getElementsByClassName("ingredient-quantity");
  const ingredientUnits = document.getElementsByClassName("ingredient-unit");
  // ✅ Validare ingredient complet
  for (let i = 0; i < ingredientNames.length; i++) {
    const name = ingredientNames[i].value.trim();
    const quantityValue = ingredientQuantities[i].value.trim();
    const unit = ingredientUnits[i].value;
    if (!name) {
      showToast("⚠️ Please add a name for each ingredient. What goes in the pot? 🥄", false);
      return;
    }
    const parsedQuantity = parseFloat(quantityValue);
    if (!quantityValue || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showToast("⚠️ Please add a valid quantity for " + name + ". How much goes in? 🧂", false);
      return;
    }
    // ✅ Validăm limita superioară
    if (parsedQuantity > 100000) {
      showToast("⚠️ Whoa! " + parsedQuantity + " is too much for " + name + ". Let’s keep it under 100,000. 🍽️", false);
      return;
    }
    if (!unit) {
      showToast("⚠️ Please pick a unit for " + name + ". ⚖️", false);
      return;
    }
    ingredients.push({
      name: name,
      quantity: parseFloat(quantityValue),
      unit: unit
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
    externalLink: externalLink, // 🆕 adăugat
    ingredients: ingredients
  };
  // 4. Creăm un obiect FormData
  const formData = new FormData();
  // 5. Adăugăm JSON-ul (DTO) sub formă de string
  formData.append("recipeDTO", new Blob([JSON.stringify(recipeDTO)], {
    type: "application/json"
  }));
  // 6. Luăm fișierul imagine din <input type="file" id="imageFile">
  const imageFile = document.getElementById("imageFile").files[0];
  if (imageFile) {
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      showToast("📸 Easy there, Gordon! This photo’s over the limit. We only accept files under 5MB 😅", false);
      return;
    }
    formData.append("imageFile", imageFile);
  }
  // 7. Trimitem la backend FĂRĂ să setăm manual Content-Type
  fetch("/api/recipes", {
    method: "POST",
    body: formData
  }).then(response => response.json()).then(data => {
    if (!data || !data.id) {
      throw new Error("Rețeta nu a fost salvată corect. ID-ul este lipsă.");
    }
    showToast("🎉 Woohoo! Your recipe is safe in the vault!", true);
    // redirect după 2 secunde
    setTimeout(() => {
      window.location.href = "/home";
    }, 2000);
  }).catch(error => {
    console.error("Eroare la salvare:", error);
    alert("Eroare: " + error.message);
  });
}

function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toastMessage");

  // Eliminăm clasele anterioare (dacă există)
  toast.classList.remove("toast-success", "toast-error");

  // Adăugăm clasa corespunzătoare
  toast.classList.add(isSuccess ? "toast-success" : "toast-error");

  // Inserăm mesajul și butonul X
  toast.innerHTML = `
    <span>${message}</span>
    <div class="close-btn" onclick="hideToast()">×</div>
  `;

  toast.classList.remove("hide");
  toast.style.display = "flex";

  // Auto-hide după 5 secunde
  setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  const toast = document.getElementById("toastMessage");
  toast.classList.add("hide");

  // Șterge din DOM după animație (pentru siguranță)
  setTimeout(() => {
    toast.style.display = "none";
    toast.classList.remove("hide");
  }, 300);
}

/***********************
 * SEARCH BY INGREDIENTS
 ***********************/
function searchByIngredients() {
  const input = document.getElementById("searchIngredients").value;
  // Ex: "faina,apa,drojdie" -> ["faina","apa","drojdie"]
  let ingredientsArray = input.split(",").map(item => item.trim());
  fetch("/api/recipes/search-by-ingredients?ingredients=" + ingredientsArray.join(",")).then(response => response.json()).then(data => {
    let resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "<h3>Rezultate</h3>";
    if (data.length === 0) {
      resultsDiv.innerHTML += "<p>Nicio rețetă găsită.</p>";
    } else {
      data.forEach(recipe => {
        resultsDiv.innerHTML += `<p onclick="goToRecipe(${recipe.id})" style="cursor:pointer; color:blue;">${recipe.name}</p>`;
      });
    }
  }).catch(error => console.error("Eroare:", error));
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
  const ingredients = Array.from(ingredientInputs).map(input => input.value.trim()).filter(val => val !== "");
  const params = new URLSearchParams({
    page,
    size
  });
  if (name) params.append("name", name);
  ingredients.forEach(ing => params.append("ingredients", ing));
  fetch(`/api/recipes?${params.toString()}`).then(response => response.json()).then(data => {
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
    // 🔁 Înlocuire sistem vechi de paginare cu versiune numerică
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";
    // ✅ Verificăm dacă există mai multe pagini
    if (data.totalPages > 1) {
      const nav = document.createElement("nav");
      const ul = document.createElement("ul");
      ul.className = "pagination justify-content-center flex-wrap";
      // 🔹 Buton "Previous"
      const prevLi = document.createElement("li");
      prevLi.className = `page-item ${page === 0 ? "disabled" : ""}`;
      prevLi.innerHTML = `
        <button class="page-link" ${page === 0 ? "disabled" : ""} onclick="fetchAllRecipes(${page - 1})">⬅️ Back to more bites</button>
      `;
      ul.appendChild(prevLi);
      // 🔹 Calculăm intervalul de pagini de afișat (maxim 5)
      const maxVisiblePages = 5;
      let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      // ⚠️ Corectăm capătul dacă depășește limita
      if (endPage >= data.totalPages) {
        endPage = data.totalPages - 1;
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }
      // 🔹 Butoane numerice
      for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === page ? "active" : ""}`;
        li.innerHTML = `
          <button class="page-link" onclick="fetchAllRecipes(${i})">${i + 1}</button>
        `;
        ul.appendChild(li);
      }
      // 🔹 Buton "Next"
      const nextLi = document.createElement("li");
      nextLi.className = `page-item ${page === data.totalPages - 1 ? "disabled" : ""}`;
      nextLi.innerHTML = `
        <button class="page-link" ${page === data.totalPages - 1 ? "disabled" : ""} onclick="fetchAllRecipes(${page + 1})">Next yummy batch 🍽️</button>
      `;
      ul.appendChild(nextLi);
      // 🔚 Adăugăm totul în container
      nav.appendChild(ul);
      paginationContainer.appendChild(nav);
    }
  }).catch(error => {
    console.error("Error loading recipes:", error);
    document.getElementById("allRecipesContainer").innerHTML = "<p class='text-center text-danger'>Oops! Something went wrong...</p>";
  });
}

function filterRecipes(page = 0, size = 6) {
  const name = document.getElementById('filter-name').value;
  const ingredientInputs = document.querySelectorAll('.ingredient-input');
  const ingredients = Array.from(ingredientInputs).map(input => input.value.trim()).filter(val => val !== "");
  if (!name && ingredients.length === 0) {
    console.log("No filters provided, fetching all recipes.");
    fetchAllRecipes();
    return;
  }
  const query = new URLSearchParams();
  if (name) query.append("name", name);
  ingredients.forEach(ing => query.append("ingredients", ing));
  query.append("page", page);
  query.append("size", size);
  // ✅ ADAUGĂ AICI
  console.log("Filter values - Name:", name, "Ingredients:", ingredients);
  console.log("Filtering recipes with query:", query.toString());
  fetch(`/api/recipes/filter?${query.toString()}`).then(res => res.json()).then(data => {
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
                    🍴 Show me the dish!
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    // 🔁 Înlocuire sistem vechi de paginare cu versiune numerică
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";
    // ✅ Verificăm dacă există mai multe pagini
    if (data.totalPages > 1) {
      const nav = document.createElement("nav");
      const ul = document.createElement("ul");
      ul.className = "pagination justify-content-center flex-wrap";
      // 🔹 Buton "Previous"
      const prevLi = document.createElement("li");
      prevLi.className = `page-item ${page === 0 ? "disabled" : ""}`;
      prevLi.innerHTML = `
    <button class="page-link" ${page === 0 ? "disabled" : ""} onclick="filterRecipes(${page - 1})">⬅️ Back to more bites</button>
  `;
      ul.appendChild(prevLi);
      // 🔹 Calculăm intervalul de pagini de afișat (maxim 5)
      const maxVisiblePages = 5;
      let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      // ⚠️ Corectăm capătul dacă depășește limita
      if (endPage >= data.totalPages) {
        endPage = data.totalPages - 1;
        startPage = Math.max(0, endPage - maxVisiblePages + 1);
      }
      // 🔹 Butoane numerice
      for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.className = `page-item ${i === page ? "active" : ""}`;
        li.innerHTML = `
      <button class="page-link" onclick="filterRecipes(${i})">${i + 1}</button>
    `;
        ul.appendChild(li);
      }
      // 🔹 Buton "Next"
      const nextLi = document.createElement("li");
      nextLi.className = `page-item ${page === data.totalPages - 1 ? "disabled" : ""}`;
      nextLi.innerHTML = `
    <button class="page-link" ${page === data.totalPages - 1 ? "disabled" : ""} onclick="filterRecipes(${page + 1})">Next yummy batch 🍽️</button>
  `;
      ul.appendChild(nextLi);
      // 🔚 Adăugăm totul în container
      nav.appendChild(ul);
      paginationContainer.appendChild(nav);
    }
  }).catch(error => console.error("Error filtering recipes:", error));
}
document.addEventListener("DOMContentLoaded", () => {
  // Cod pentru încărcare rețete
  if (document.getElementById("allRecipesContainer")) {
    fetchAllRecipes();
  }
  // Cod pentru register - protejat corect
  const form = document.getElementById("registerForm");
  if (form) { // VERIFICARE înainte să punem event listener
    form.addEventListener("submit", async function(event) {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      // Validări de câmpuri goale
      if (!username) {
        showToast("Please enter a username.", false);
        return;
      }
      if (!email) {
        showToast("Email address is required.", false);
        return;
      }
      const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;
      if (!emailPattern.test(email)) {
        showToast("Please enter a valid email address (e.g., yourname@domain.com).", false);
        return;
      }
      if (!password) {
        showToast("Password is required.", false);
        return;
      }
      // Verificare lungime minimă a parolei
      if (password.length < 6) {
        showToast("Password must be at least 6 characters long.", false);
        return;
      }
      // Definim messageDiv aici, ca să fie vizibil peste tot în handler
      const messageDiv = document.getElementById("registerMessage");
      try {
        const response = await fetch("/api/users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password
          })
        });
        if (response.ok) {
          // Dacă înregistrarea a avut succes
          showToast("Registration complete. You can now log in.", true);
          // Redirect către login după 2 secunde
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          // Dacă serverul a întors o eroare
          const errorData = await response.json();
          showToast("🚨 " + (errorData.error || "Something went wrong... Our kitchen elves are on it! 🧙‍♂️"), false);
        }
      } catch (error) {
        console.error("Error during registration:", error);
        showToast("🚨 Something went wrong... Our kitchen elves are on it! 🧙‍♂️", false);
      }
    });
  } else {
    console.log("No register form found on this page.");
  }
  // Cod pentru login - protejat corect
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      if (!username) {
        showToast("⚠️ Please enter your username!", false);
        return;
      }
      if (!password) {
        showToast("⚠️ Don't forget the password. Even chefs lock the fridge! 🔐", false);
        return;
      }
      try {
        const response = await fetch("/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        });
        if (response.ok) {
          localStorage.setItem("loggedUser", username);
          showToast("✅ Welcome back, chef! 🍳 Redirecting you to your kitchen...", true);
          setTimeout(() => {
            window.location.href = "/home";
          }, 2000);
        } else {
          const errorData = await response.json();
          showToast("❌ " + (errorData.error || "Login failed. Please try again!"), false);
        }
      } catch (error) {
        console.error("Login error:", error);
        showToast("🚨 Unexpected error. Our oven might be on fire! 🔥", false);
      }
    });
  }
});

function resetFilters() {
  document.getElementById("filter-name").value = "";
  const ingredientContainer = document.getElementById("ingredient-container");
  ingredientContainer.innerHTML = `
    <input type="text" class="form-control mb-2 ingredient-input" placeholder="What’s inside? 🧂">
  `;
  fetchAllRecipes(0); // reîncarcă toate rețetele
}
// ✅ Afișează username-ul în navbar după ce pagina s-a încărcat complet
window.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("loggedUser");
  const nameSpan = document.getElementById("navbarUsername");
  if (username && nameSpan) {
    nameSpan.textContent = username;
  }
});
// 🔹 Funcție de logout: șterge userul și redirecționează
function logoutUser() {
  console.log("Logout button clicked");
  localStorage.removeItem("loggedUser");
  fetch('/api/users/logout', {
    method: 'POST',
    credentials: 'same-origin'
  }).then(response => {
    console.log("Logout request completed:", response.status);
    window.location.href = "/?logout=success";
  }).catch(error => {
    console.error("Logout request failed:", error);
    window.location.href = "/?logout=success";
  });
}
// 🟢 Atașare corectă a evenimentului pe butonul cu id="logoutButton"
document.addEventListener("DOMContentLoaded", function() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    console.log("Logout button found, attaching event");
    logoutButton.addEventListener("click", logoutUser);
  } else {
    console.log("Logout button not found");
  }
});

// 🔔 Toast pentru confirmare logout
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("logout") === "success") {
    showToast("👋 You have been logged out successfully.", true);
    // Eliminăm parametrii din URL (ca să nu rămână după refresh)
    window.history.replaceState({}, document.title, "/");
  }
});
