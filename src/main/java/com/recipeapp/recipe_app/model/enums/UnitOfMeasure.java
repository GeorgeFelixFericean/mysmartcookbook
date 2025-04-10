package com.recipeapp.recipe_app.model.enums;

public enum UnitOfMeasure {
    GRAM("g", "g"),
    KILOGRAM("kg", "kg"),
    MILLILITER("ml", "ml"),
    LITER("l", "l"),
    CUP("cup", "cups"),
    TABLESPOON("tbsp", "tbsp"),
    TEASPOON("tsp", "tsp"),
    PIECE("pcs", "pcs"),
    OUNCE("oz", "oz"),
    POUND("lb", "lbs"),
    PINCH("pinch", "pinches"),
    DASH("dash", "dashes"),
    SLICE("slice", "slices"),
    CLOVE("clove", "cloves"),
    STALK("stalk", "stalks");

    private final String abbreviation;
    private final String plural;

    UnitOfMeasure(String abbreviation, String plural) {
        this.abbreviation = abbreviation;
        this.plural = plural;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public String getPlural() {
        return plural;
    }
}
