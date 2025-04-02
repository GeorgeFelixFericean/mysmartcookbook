package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    void deleteByRecipeId(Long recipeId);

}
