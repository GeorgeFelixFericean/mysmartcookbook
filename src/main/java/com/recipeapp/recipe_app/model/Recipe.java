package com.recipeapp.recipe_app.model;


import jakarta.persistence.*;

import java.util.List;

@Entity
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "recipe_id")
    private List<RecipeIngredient> ingredients;  // Relația cu ingredientele

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "parentRecipe")
    private List<RecipeRecipe> subRecipes;  // Relația cu alte rețete (subordonate)

    // Getters și Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<RecipeIngredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<RecipeIngredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<RecipeRecipe> getSubRecipes() {
        return subRecipes;
    }

    public void setSubRecipes(List<RecipeRecipe> subRecipes) {
        this.subRecipes = subRecipes;
    }
}

