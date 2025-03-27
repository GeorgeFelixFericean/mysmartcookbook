package com.recipeapp.recipe_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.service.RecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public List<Recipe> getAllRecipes() {
        return recipeService.getAllRecipes();
    }

    @GetMapping("/search-by-name")
    public List<Recipe> searchRecipes(@RequestParam String name) {
        return recipeService.searchRecipesByName(name);
    }

    @GetMapping("/search-by-ingredients")
    public List<Recipe> searchRecipesByIngredients(@RequestParam List<String> ingredients) {
        return recipeService.searchRecipesByIngredients(ingredients);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Recipe> addRecipe(
            @RequestPart("recipeDTO") String recipeDTOString,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        ObjectMapper objectMapper = new ObjectMapper();
        RecipeDTO recipeDTO;
        try {
            recipeDTO = objectMapper.readValue(recipeDTOString, RecipeDTO.class);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        Recipe savedRecipe = recipeService.saveRecipe(recipeDTO, imageFile);
        if (savedRecipe.getId() == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRecipe);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id) {
        Optional<Recipe> recipeOpt = recipeService.getRecipeById(id);
        return recipeOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/filter")
    public List<Recipe> filterRecipes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> ingredients
    ) {
        return recipeService.filterRecipes(name, ingredients);
    }
}
