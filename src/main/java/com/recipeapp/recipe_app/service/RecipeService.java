package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.IngredientRepository;
import com.recipeapp.recipe_app.repository.RecipeRepository;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final UserRepository userRepository;

    public RecipeService(RecipeRepository recipeRepository, UserRepository userRepository) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    public List<Recipe> searchRecipesByName(String name) {
        return recipeRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Recipe> searchRecipesByIngredients(List<String> ingredients) {
        return recipeRepository.findByIngredients(ingredients, ingredients.size());
    }

    /**
     * Metodă care salvează o rețetă împreună cu fișierul imagine (dacă există).
     *
     * @param recipeDTO datele rețetei (nume, instrucțiuni, ingrediente etc.)
     * @param imageFile fișierul imagine, poate fi null sau gol
     * @return rețeta salvată în baza de date
     */
    public Recipe saveRecipe(RecipeDTO recipeDTO, MultipartFile imageFile, String username) {
        // 1. Construim entitatea Recipe din DTO
        Recipe recipe = new Recipe();
        recipe.setName(recipeDTO.getName());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setNotes(recipeDTO.getNotes());

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
        // Obținem User din UserRepository
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        recipe.setUser(user);
        // 4. Salvăm rețeta în DB (include și ingredientele)
        return recipeRepository.save(recipe);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    @Transactional
    public Optional<Recipe> updateRecipe(Long id, RecipeDTO recipeDTO, MultipartFile imageFile) {
        Optional<Recipe> optionalRecipe = recipeRepository.findById(id);
        if (optionalRecipe.isEmpty()) {
            return Optional.empty();
        }

        Recipe recipe = optionalRecipe.get();

        // Actualizăm doar câmpurile transmise
        if (recipeDTO.getName() != null) {
            recipe.setName(recipeDTO.getName());
        }

        if (recipeDTO.getInstructions() != null) {
            recipe.setInstructions(recipeDTO.getInstructions());
        }

        if (recipeDTO.getNotes() != null) {
            recipe.setNotes(recipeDTO.getNotes());
        }

        // Dacă a fost trimis un fișier imagine nou
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String originalFilename = imageFile.getOriginalFilename();
                String uniqueFilename = "recipe-" + System.currentTimeMillis() + "_" + originalFilename;
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                recipe.setImagePath("/" + uniqueFilename);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Eroare la actualizarea imaginii", e);
            }
        }

        // curățăm lista de ingrediente și adăugăm noile ingrediente
        recipe.getIngredients().clear();

        if (recipeDTO.getIngredients() != null) {
            for (var dto : recipeDTO.getIngredients()) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(dto.getName());
                ingredient.setQuantity(dto.getQuantity());
                ingredient.setUnit(dto.getUnit());
                ingredient.setRecipe(recipe);
                recipe.getIngredients().add(ingredient);
            }
        }

        Recipe updated = recipeRepository.save(recipe);
        return Optional.of(updated);
    }

    public Page<Recipe> getFilteredRecipes(String name, List<String> ingredients, Pageable pageable, String username) {
        System.out.println("Ajuns în filtrare cu ingrediente: " + ingredients + " pentru user: " + username);
        boolean hasName = name != null && !name.isBlank();
        boolean hasIngredients = ingredients != null && !ingredients.isEmpty();

        if (!hasName && !hasIngredients) {
            return recipeRepository.findByUserUsername(username, pageable);
        }

        if (!hasName) {
            return recipeRepository.findByPartialIngredientNames(ingredients, username, pageable);
        }

        if (!hasIngredients) {
            return recipeRepository.findByUserUsernameAndNameContainingIgnoreCase(username, name, pageable);
        }

        // filtrare dublă – întâi după ingrediente, apoi după nume
        Page<Recipe> filteredByIngredients = recipeRepository.findByPartialIngredientNames(ingredients, username, pageable);

        String lowerName = name.toLowerCase();
        List<Recipe> filteredRecipes = filteredByIngredients
                .stream()
                .filter(r -> r.getName().toLowerCase().contains(lowerName))
                .toList();

        return new PageImpl<>(filteredRecipes, pageable, filteredRecipes.size());
    }
}