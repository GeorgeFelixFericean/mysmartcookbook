// ========== Load Public Recipes on Landing Page ==========
document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/recipes/public")
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById("public-recipes-container");
            if (!container) return;

            data.forEach(recipe => {
                const imageSrc = recipe.imagePath ? recipe.imagePath : "/img/bg-img/default.jpg";

                const recipeDiv = document.createElement("div");
                recipeDiv.classList.add("col-12", "col-sm-6", "col-lg-4");

                recipeDiv.innerHTML = `
                    <div class="single-best-receipe-area mb-30">
                        <img src="${imageSrc}" alt="${recipe.name}">
                        <div class="receipe-content">
                            <h5>${recipe.name}</h5>
                        </div>
                    </div>
                `;
                container.appendChild(recipeDiv);
            });
        })
        .catch(error => {
            console.error("Error loading public recipes:", error);
        });
});