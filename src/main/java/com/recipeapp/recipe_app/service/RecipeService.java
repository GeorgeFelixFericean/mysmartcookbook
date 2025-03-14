package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.repository.IngredientRepository;
import com.recipeapp.recipe_app.repository.RecipeRepository;
import org.springframework.stereotype.Service;

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

    public Recipe saveRecipe(RecipeDTO recipeDTO) {
        Recipe recipe = new Recipe();
        recipe.setName(recipeDTO.getName());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setImagePath(recipeDTO.getImagePath());
        recipe.setExternalLink(recipeDTO.getExternalLink());
        recipe.setNotes(recipeDTO.getNotes());

        List<Ingredient> ingredients = recipeDTO.getIngredients().stream().map(dto -> {
            Ingredient ingredient = new Ingredient();
            ingredient.setName(dto.getName());
            ingredient.setQuantity(dto.getQuantity());
            ingredient.setUnit(dto.getUnit());
            ingredient.setRecipe(recipe);
            return ingredient;
        }).collect(Collectors.toList());

        recipe.setIngredients(ingredients);
        return recipeRepository.save(recipe);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }
}
