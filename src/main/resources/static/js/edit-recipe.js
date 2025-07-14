const recipeId = window.location.pathname.split("/").pop();
document.addEventListener("DOMContentLoaded", () => {
	fetch(`/api/recipes/${recipeId}`).then(res => {
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
	}).then(recipe => {
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
		document.getElementById("imageFile").addEventListener("change", function(event) {
			const file = event.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = function(e) {
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
	const formRow = document.createElement("div");
	formRow.className = "form-row";
	// Ingredient Name (text)
	const nameGroup = document.createElement("div");
	nameGroup.className = "form-group col-md-5";
	const nameInput = document.createElement("input");
	nameInput.type = "text";
	nameInput.name = "ingredientName";
	nameInput.className = "form-control ingredient-name";
	nameInput.placeholder = "Ingredient name";
	nameInput.value = name;
	nameGroup.appendChild(nameInput);
	// Quantity (number)
	const qtyGroup = document.createElement("div");
	qtyGroup.className = "form-group col-md-3";
	const qtyInput = document.createElement("input");
	qtyInput.type = "number";
	qtyInput.name = "ingredientQuantity";
	qtyInput.min = "0";
	qtyInput.step = "1";
	qtyInput.className = "form-control ingredient-quantity";
	qtyInput.placeholder = "Quantity";
	qtyInput.value = quantity;
	qtyGroup.appendChild(qtyInput);
	// Unit (select)
	const unitGroup = document.createElement("div");
	unitGroup.className = "form-group col-md-3";
	const select = document.createElement("select");
	select.name = "ingredientUnit";
	select.className = "form-control ingredient-unit";
	const defaultOption = document.createElement("option");
	defaultOption.disabled = true;
	if (!unit) defaultOption.selected = true;
	defaultOption.hidden = true;
	defaultOption.textContent = "Select unit";
	select.appendChild(defaultOption);
	UNIT_OPTIONS.forEach(u => {
		const opt = document.createElement("option");
		opt.value = u.key;
		opt.title = u.label;
		opt.textContent = u.abbreviation;
		if (u.key === unit) opt.selected = true;
		select.appendChild(opt);
	});
	unitGroup.appendChild(select);
	// Delete button
	const deleteGroup = document.createElement("div");
	deleteGroup.className = "form-group col-md-1 d-flex align-items-start";
	const delBtn = document.createElement("button");
	delBtn.type = "button";
	delBtn.className = "btn btn-danger btn-sm";
	delBtn.title = "Remove ingredient";
	delBtn.style.height = "100%";
	delBtn.style.display = "flex";
	delBtn.style.alignItems = "center";
	delBtn.style.justifyContent = "center";
	delBtn.style.paddingTop = "0.375rem";
	delBtn.style.paddingBottom = "0.375rem";
	delBtn.onclick = function() {
		removeIngredientField(delBtn);
	};
	const icon = document.createElement("i");
	icon.className = "bi bi-trash";
	delBtn.appendChild(icon);
	deleteGroup.appendChild(delBtn);
	// Assemble all
	formRow.appendChild(nameGroup);
	formRow.appendChild(qtyGroup);
	formRow.appendChild(unitGroup);
	formRow.appendChild(deleteGroup);
	div.appendChild(formRow);
	container.appendChild(div);
}
document.getElementById("editRecipeForm").addEventListener("submit", function(event) {
	event.preventDefault();
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
		if (!ingName) {
			showToast("Ingredient name is required.", false);
			return;
		}
		if (ingName.length > 50) {
			showToast("Ingredient name must be 50 characters or fewer.", false);
			return;
		}
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
	formData.append("recipeDTO", new Blob([JSON.stringify(recipeDTO)], {
		type: "application/json"
	}));
	if (window.imageMarkedForDeletion) {
		formData.append("deleteImage", "true");
	}
	const imageFile = document.getElementById("imageFile").files[0];
	if (imageFile) {
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (imageFile.size > maxSize) {
			showToast("Image too large. Maximum allowed size is 5MB.", false);
			return;
		}
		formData.append("imageFile", imageFile);
	}
	const csrfToken = getCsrfToken();
	fetch(`/api/recipes/${recipeId}`, {
		method: "PUT",
		credentials: "include",
		headers: {
			"X-XSRF-TOKEN": csrfToken
		},
		body: formData
	}).then(response => {
		if (!response.ok) throw new Error("Eroare la salvarea modificărilor.");
		showToast("Recipe updated successfully.", true);
		setTimeout(() => {
			window.location.href = `/recipe/${recipeId}`;
		}, 2000);
	}).catch(error => {
		console.error("❌ Fetch failed:", error.message);
		showToast("Something went wrong while saving the recipe.", false);
	});
});
