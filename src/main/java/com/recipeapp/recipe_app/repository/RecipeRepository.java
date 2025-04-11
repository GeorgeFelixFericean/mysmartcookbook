package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT r FROM Recipe r JOIN r.ingredients i " +
            "WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
            "AND i.name IN :ingredients GROUP BY r " +
            "HAVING COUNT(DISTINCT i.name) = :size")
    List<Recipe> findByNameAndIngredients(@Param("name") String name,
                                          @Param("ingredients") List<String> ingredients,
                                          @Param("size") long size);

    Page<Recipe> findAll(Pageable pageable);

    Page<Recipe> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Recipe> findByIngredientsNameIn(List<String> ingredients, Pageable pageable);

    Page<Recipe> findByNameContainingIgnoreCaseAndIngredientsNameIn(String name, List<String> ingredients, Pageable pageable);

}
