package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByNameContainingIgnoreCase(String name);

    @Query("SELECT r FROM Recipe r JOIN r.ingredients i WHERE i.name IN :ingredients GROUP BY r HAVING COUNT(DISTINCT i.name) = :size")
    List<Recipe> findByIngredients(@Param("ingredients") List<String> ingredients, @Param("size") long size);
}
