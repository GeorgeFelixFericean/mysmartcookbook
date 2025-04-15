package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecipeRepositoryCustom {
    Page<Recipe> findByPartialIngredientNames(List<String> ingredientFragments, Pageable pageable);
}

