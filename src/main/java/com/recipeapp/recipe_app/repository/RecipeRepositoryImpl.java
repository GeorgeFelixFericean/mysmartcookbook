package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class RecipeRepositoryImpl implements RecipeRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Recipe> findByPartialIngredientNames(List<String> ingredientFragments, Pageable pageable) {
        System.out.println("Caut dupa ingrediente: " + ingredientFragments);
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Recipe> query = cb.createQuery(Recipe.class);
        Root<Recipe> recipe = query.from(Recipe.class);

        List<Predicate> mustHaveAll = new ArrayList<>();

        for (String fragment : ingredientFragments) {
            Subquery<Ingredient> subquery = query.subquery(Ingredient.class);
            Root<Ingredient> subRoot = subquery.from(Ingredient.class);
            subquery.select(subRoot);

            Predicate sameRecipe = cb.equal(subRoot.get("recipe"), recipe);
            Predicate likeName = cb.like(cb.lower(subRoot.get("name")), "%" + fragment.toLowerCase() + "%");

            subquery.where(cb.and(sameRecipe, likeName));

            // EXISTS subquery
            mustHaveAll.add(cb.exists(subquery));
        }

        query.select(recipe).distinct(true)
                .where(cb.and(mustHaveAll.toArray(new Predicate[0])));

        // Count query (simplificată — poate fi rafinată)
        List<Recipe> resultList = entityManager.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        long total = resultList.size(); // sau poți construi un countQuery similar

        return new PageImpl<>(resultList, pageable, total);
    }

}

