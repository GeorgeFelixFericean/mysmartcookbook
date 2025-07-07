package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    @Query("SELECT DISTINCT LOWER(i.name) FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT(:prefix, '%'))")
    List<String> findDistinctNamesStartingWith(@Param("prefix") String prefix);
}
