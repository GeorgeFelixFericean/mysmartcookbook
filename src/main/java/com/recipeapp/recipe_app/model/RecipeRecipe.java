package com.recipeapp.recipe_app.model;

import jakarta.persistence.*;

@Entity
public class RecipeRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parent_recipe_id")
    private Recipe parentRecipe;  // Rețeta principală (ex: Lasagna)

    @ManyToOne
    @JoinColumn(name = "sub_recipe_id")
    private Recipe subRecipe;  // Rețeta subordonată (ex: Sos Bechamel)

    private double quantity;
    private String unit;  // Bucăți, grame, litri etc.


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recipe getParentRecipe() {
        return parentRecipe;
    }

    public void setParentRecipe(Recipe parentRecipe) {
        this.parentRecipe = parentRecipe;
    }

    public Recipe getSubRecipe() {
        return subRecipe;
    }

    public void setSubRecipe(Recipe subRecipe) {
        this.subRecipe = subRecipe;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}

