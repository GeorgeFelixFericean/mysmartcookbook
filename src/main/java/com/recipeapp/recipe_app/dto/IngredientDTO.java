package com.recipeapp.recipe_app.dto;

import com.recipeapp.recipe_app.model.enums.UnitOfMeasure;

public class IngredientDTO {
    private String name;
    private Double quantity;
    private UnitOfMeasure unit;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public UnitOfMeasure getUnit() {
        return unit;
    }

    public void setUnit(UnitOfMeasure unit) {
        this.unit = unit;
    }
}
