const recipeId = window.location.pathname.split("/").pop();
    document.addEventListener("DOMContentLoaded", () => {
        fetch(`/api/recipes/${recipeId}`)
            .then(res => {
                if (!res.ok) {
                    // Recipe does not exist – we display toast and redirect
                    const toast = new bootstrap.Toast(document.getElementById("errorToast"));
                    toast.show();
                    setTimeout(() => {
                        window.location.href = "/home";
                    }, 2500);
                    throw new Error("Recipe not found");
                }
                return res.json();
            })
            .then(recipe => {
                console.log("📷 imagePath:", recipe.imagePath);
                document.getElementById("name").value = recipe.name || "";
                document.getElementById("instructions").value = recipe.instructions || "";
                document.getElementById("notes").value = recipe.notes || "";
                document.getElementById("externalLink").value = recipe.externalLink || "";
                const container = document.getElementById("imagePreview");
                const imageSrc = recipe.imagePath || "/img/core-img/placeholder.jpg";

                container.innerHTML = `
                  <div class="position-relative d-inline-block" style="max-width: 100%;">
                    <img src="${imageSrc}" alt="Preview"
                         class="img-fluid rounded shadow"
                         style="max-height: 250px; display: block;">
                    <button type="button"
                        id="removeImageBtn"
                        class="btn btn-sm btn-dark rounded-circle position-absolute"
                        title="Remove image"
                        style="
                            top: 8px;
                            right: 8px;
                            width: 28px;
                            height: 28px;
                            padding: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">
                        <i class="bi bi-x-lg text-white"></i>
                    </button>
                  </div>
                `;

                // ⚠️ Flag: doar dacă avem imagine reală, permitem ștergerea
                window.imageMarkedForDeletion = !!recipe.imagePath;

                document.getElementById("removeImageBtn").addEventListener("click", () => {
                    document.getElementById("imagePreview").innerHTML = "";
                    document.getElementById("imageFile").value = "";
                    window.imageMarkedForDeletion = true;
                });


                document.getElementById("cancelButton").href = `/recipe/${recipeId}`;

                recipe.ingredients.forEach(ingredient => {
                    addIngredientField(ingredient.name, ingredient.quantity, ingredient.unit);
                });
                // 🔽 AICI ADAUGĂM 🔽
                document.getElementById("imageFile").addEventListener("change", function(event) {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const container = document.getElementById("imagePreview");
                            container.innerHTML = `
                                <div class="position-relative d-inline-block" style="max-width: 100%;">
                                    <img src="${e.target.result}" alt="Preview"
                                         class="img-fluid rounded shadow"
                                         style="max-height: 250px; display: block;">
                                    <button type="button"
                                        id="removeImageBtn"
                                        class="btn btn-sm btn-dark rounded-circle position-absolute"
                                        title="Remove image"
                                        style="
                                            top: 8px;
                                            right: 8px;
                                            width: 28px;
                                            height: 28px;
                                            padding: 0;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                        ">
                                        <i class="bi bi-x-lg text-white"></i>
                                    </button>
                                </div>
                            `;

                            window.imageMarkedForDeletion = false;

                            document.getElementById("removeImageBtn").addEventListener("click", () => {
                                document.getElementById("imagePreview").innerHTML = "";
                                document.getElementById("imageFile").value = "";
                                window.imageMarkedForDeletion = true;
                            });
                        };


                        reader.readAsDataURL(file);
                    }
                });
            });
    });

    function addIngredientField(name = "", quantity = "", unit = "") {
    	const container = document.getElementById("ingredientsContainer");

    	const div = document.createElement("div");
    	div.className = "ingredient-entry rounded p-3 mb-3 bg-light-subtle";

    	let unitOptionsHtml = `<option value="" disabled ${!unit ? "selected hidden" : ""}>Select unit</option>`;
        UNIT_OPTIONS.forEach(u => {
        	const selected = u.key === unit ? "selected" : "";
        	unitOptionsHtml += `<option value="${u.key}" title="${u.label}" ${selected}>${u.abbreviation}</option>`;
        });

    	div.innerHTML = `
    		<div class="form-row">
    			<div class="form-group col-md-5">
    				<input type="text" name="ingredientName" class="form-control ingredient-name" placeholder="Ingredient name" value="${name}">
    			</div>
    			<div class="form-group col-md-3">
                    <input type="number" name="ingredientQuantity" min="0" step="1" class="form-control ingredient-quantity" placeholder="Quantity" value="${quantity}">
    			</div>
    			<div class="form-group col-md-3">
    				<select name="ingredientUnit" class="form-control ingredient-unit">
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


    document.getElementById("editRecipeForm").addEventListener("submit", function(event) {
        event.preventDefault();

        console.log("🔵 Submit handler triggered");
        const formData = new FormData();
        const name = document.getElementById("name").value.trim();
        if (!name) {
            showToast("Please enter a recipe name.", false);
            return;
        }
        const recipeDTO = {
            name: document.getElementById("name").value,
            instructions: document.getElementById("instructions").value,
            notes: document.getElementById("notes").value,
            externalLink: document.getElementById("externalLink").value,
            ingredients: []
        };

        const names = document.getElementsByName("ingredientName");
        const quantities = document.getElementsByName("ingredientQuantity");
        const units = document.getElementsByName("ingredientUnit");

        for (let i = 0; i < names.length; i++) {
            const ingName = names[i].value.trim();
            const quantity = quantities[i].value;
            const unit = units[i].value;

            // 🔹 Validare nume gol
            if (!ingName) {
                showToast("Ingredient name is required.", false);
                return;
            }

            // 🔹 Limită de caractere
            if (ingName.length > 50) {
                showToast("Ingredient name must be 50 characters or fewer.", false);
                return;
            }

            // 🔹 Validare cantitate
            if (!quantity.trim()) {
                showToast("Quantity is required.", false);
                return;
            }

            const parsedQty = parseFloat(quantity);
            if (isNaN(parsedQty)) {
                showToast("Quantity must be a valid number.", false);
                return;
            }

            if (parsedQty <= 0) {
                showToast("Quantity must be greater than 0.", false);
                return;
            }

            if (parsedQty > 100000) {
                showToast("Quantity must be less than 100,000.", false);
                return;
            }

            if (!unit) {
                showToast("Please select a unit of measure.", false);
                return;
            }

            recipeDTO.ingredients.push({
                name: ingName,
                quantity: parseFloat(quantity),
                unit: unit
            });
        }

        console.log("📦 DTO:", recipeDTO);
        formData.append("recipeDTO", new Blob([JSON.stringify(recipeDTO)], { type: "application/json" }));
        // ✅ Trimite flag-ul pentru ștergere imagine (dacă e marcat)
        if (window.imageMarkedForDeletion) {
            console.log("❌ Image marked for deletion");
            formData.append("deleteImage", "true");
        }

        const imageFile = document.getElementById("imageFile").files[0];

        if (imageFile) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (imageFile.size > maxSize) {
                showToast("Image too large. Maximum allowed size is 5MB.", false);
                return; // oprește submitul
            }

            formData.append("imageFile", imageFile);
            console.log("🖼️ New image selected:", imageFile.name);
        }

        console.log("🟣 Pregătesc fetch...");

        const csrfToken = getCsrfToken(); // 🔐 Adăugăm token-ul

        fetch(`/api/recipes/${recipeId}`, {
        	method: "PUT",
        	credentials: "include", // 🧩 Ne asigurăm că cookie-ul e trimis
        	headers: {
        		"X-XSRF-TOKEN": csrfToken
        	},
        	body: formData
        })
        .then(response => {
        	console.log("✅ fetch done, status:", response.status);
        	if (!response.ok) throw new Error("Eroare la salvarea modificărilor.");
        	showToast("Recipe updated successfully.", true);
        	setTimeout(() => {
        	  window.location.href = `/recipe/${recipeId}`;
        	}, 2000);
        })
        .catch(error => {
        	console.error("❌ Fetch failed:", error.message);
        	showToast("Something went wrong while saving the recipe.", false);
        });
    });