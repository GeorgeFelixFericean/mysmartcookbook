package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.RecipeRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRecipeRepository extends JpaRepository<RecipeRecipe, Long> {
}
