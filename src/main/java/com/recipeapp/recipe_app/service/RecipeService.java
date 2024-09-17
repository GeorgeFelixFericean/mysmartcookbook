package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.repository.RecipeRepository;
import com.recipeapp.recipe_app.repository.RecipeRecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeRecipeRepository recipeRecipeRepository;

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public Recipe createRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public Recipe getRecipeById(Long id) {
        return recipeRepository.findById(id).orElse(null);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    // Poți adăuga și metode pentru a adăuga rețete subordonate
    public Recipe save(Recipe recipe) {
        return recipeRepository.save(recipe);
    }
}



