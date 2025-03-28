package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.repository.IngredientRepository;
import com.recipeapp.recipe_app.repository.RecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;

    public RecipeService(RecipeRepository recipeRepository, IngredientRepository ingredientRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
    }

    public List<Recipe> searchRecipesByName(String name) {
        return recipeRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Recipe> searchRecipesByIngredients(List<String> ingredients) {
        return recipeRepository.findByIngredients(ingredients, ingredients.size());
    }

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    /**
     * Metodă care salvează o rețetă împreună cu fișierul imagine (dacă există).
     *
     * @param recipeDTO datele rețetei (nume, instrucțiuni, ingrediente etc.)
     * @param imageFile fișierul imagine, poate fi null sau gol
     * @return rețeta salvată în baza de date
     */
    public Recipe saveRecipe(RecipeDTO recipeDTO, MultipartFile imageFile) {
        // 1. Construim entitatea Recipe din DTO
        Recipe recipe = new Recipe();
        recipe.setName(recipeDTO.getName());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setNotes(recipeDTO.getNotes());

        // Dacă DTO-ul are un câmp imagePath (ex: link extern),
        // îl putem salva doar dacă nu încărcăm un fișier nou.
        // (opțional) recipe.setImagePath(recipeDTO.getImagePath());

        // 2. Transformăm IngredientDTO -> Ingredient și le legăm de rețetă
        List<Ingredient> ingredients = new ArrayList<>();
        if (recipeDTO.getIngredients() != null) {
            ingredients = recipeDTO.getIngredients().stream().map(dto -> {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(dto.getName());
                ingredient.setQuantity(dto.getQuantity());
                ingredient.setUnit(dto.getUnit());
                ingredient.setRecipe(recipe);
                return ingredient;
            }).collect(Collectors.toList());
        }
        recipe.setIngredients(ingredients);

        // 3. Dacă user-ul a încărcat un fișier imagine, îl salvăm în "uploads/"
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String originalFilename = imageFile.getOriginalFilename();
                // generăm un nume unic pentru fișier
                String uniqueFilename = "recipe-" + System.currentTimeMillis() + "_" + originalFilename;

                // folderul "uploads/" - îl creăm dacă nu există
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // copiem fișierul în "uploads/"
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // stocăm în DB doar calea accesibilă via HTTP
                // ex: "/recipe-1679068342123_img.jpg"
                recipe.setImagePath("/" + uniqueFilename);

            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Eroare la salvarea fișierului imagine", e);
            }
        }

        // 4. Salvăm rețeta în DB (include și ingredientele)
        return recipeRepository.save(recipe);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    public List<Recipe> filterRecipes(String name, List<String> ingredients) {
        boolean hasName = name != null && !name.isBlank();
        boolean hasIngredients = ingredients != null && !ingredients.isEmpty();

        if (!hasName && !hasIngredients) {
            return recipeRepository.findAll();
        }

        if (hasName && !hasIngredients) {
            return recipeRepository.findByNameContainingIgnoreCase(name);
        }

        if (!hasName) {
            return recipeRepository.findByIngredients(ingredients, ingredients.size());
        }

        return recipeRepository.findByNameAndIngredients(name, ingredients, ingredients.size());
    }

}
