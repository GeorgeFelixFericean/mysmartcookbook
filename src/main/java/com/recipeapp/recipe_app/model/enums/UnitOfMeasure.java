package com.recipeapp.recipe_app.model.enums;

public enum UnitOfMeasure {
    GRAM("g"),
    KILOGRAM("kg"),
    MILLILITER("ml"),
    LITRU("l"),
    CUP("cup"),
    TABLESPOON("tbsp"),
    TEASPOON("tsp"),
    PIECE("buc");

    private final String abbreviation;

    UnitOfMeasure(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getAbbreviation() {
        return abbreviation;
    }
}
