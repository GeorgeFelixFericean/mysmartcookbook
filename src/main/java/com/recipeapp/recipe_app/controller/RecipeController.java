package com.recipeapp.recipe_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.service.RecipeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @GetMapping
    public Page<Recipe> getFilteredRecipes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> ingredients,
            Principal principal) {

        Pageable pageable = PageRequest.of(page, size);
        return recipeService.getFilteredRecipes(name, ingredients, pageable, principal.getName());
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
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            Principal principal  // Adaugăm Principal aici
    ) {
        // Log pentru verificare Principal
        System.out.println("Logged in as: " + (principal != null ? principal.getName() : "No principal"));

        ObjectMapper objectMapper = new ObjectMapper();
        RecipeDTO recipeDTO;
        try {
            recipeDTO = objectMapper.readValue(recipeDTOString, RecipeDTO.class);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        Recipe savedRecipe = recipeService.saveRecipe(recipeDTO, imageFile, principal.getName());
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
    public ResponseEntity<Recipe> getRecipeById(@PathVariable Long id, Principal principal) {
        Optional<Recipe> recipeOpt = recipeService.getRecipeById(id);
        if (recipeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Recipe recipe = recipeOpt.get();
        String currentUsername = principal.getName();
        String recipeOwner = recipe.getUser().getUsername();

        // 🔒 Permitem accesul doar dacă:
        // (1) rețeta e publică
        // sau (2) userul logat este creatorul rețetei
        if (!recipeOwner.equals(currentUsername)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(recipe);
    }

    @GetMapping("/filter")
    public Page<Recipe> filterRecipes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            Principal principal
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return recipeService.getFilteredRecipes(name, ingredients, pageable, principal.getName()); // <-- AICI
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Recipe> updateRecipe(
            @PathVariable Long id,
            @RequestPart("recipeDTO") String recipeDTOString,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @RequestPart(value = "deleteImage", required = false) String deleteImageFlag
    ) {
        ObjectMapper objectMapper = new ObjectMapper();
        RecipeDTO recipeDTO;
        try {
            recipeDTO = objectMapper.readValue(recipeDTOString, RecipeDTO.class);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        boolean deleteImage = "true".equalsIgnoreCase(deleteImageFlag); // 🔹 transformăm flagul în boolean
        Optional<Recipe> updatedRecipe = recipeService.updateRecipe(id, recipeDTO, imageFile, deleteImage); // 🔹 pasăm și flagul
        return updatedRecipe.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/session-test")
    public ResponseEntity<String> testSession(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        return ResponseEntity.ok("Authenticated as: " + principal.getName());
    }

    @GetMapping("/public")
    public Page<Recipe> getPublicRecipes(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return recipeService.getFilteredPublicRecipes(name, ingredients, pageable);
    }

    @GetMapping("/public-authenticated")
    public Page<Recipe> getPublicRecipesForLoggedInUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> ingredients,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return recipeService.getFilteredPublicRecipesForSystemUser(name, ingredients, pageable);
    }

    @PostMapping("/copy/{id}")
    public ResponseEntity<Recipe> copyRecipeToUser(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Recipe copied = recipeService.copyRecipeToUser(id, principal.getName());
        if (copied == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(copied);
    }

    @GetMapping("/public/by-id/{id}")
    public ResponseEntity<Map<String, Object>> getPublicRecipeById(@PathVariable Long id) {
        Optional<Recipe> opt = recipeService.getRecipeById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Recipe recipe = opt.get();
        if (recipe.getUser() == null || !"system".equalsIgnoreCase(recipe.getUser().getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", recipe.getId());
        response.put("name", recipe.getName());
        response.put("instructions", recipe.getInstructions());
        response.put("notes", recipe.getNotes());
        response.put("imagePath", recipe.getImagePath());
        response.put("externalLink", recipe.getExternalLink());
        response.put("user", Map.of("username", recipe.getUser().getUsername()));
        response.put("ingredients", recipe.getIngredients());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocompleteRecipeNames(@RequestParam String prefix) {
        List<String> suggestions = recipeService.autocompleteRecipeNames(prefix);
        return ResponseEntity.ok(suggestions);
    }
}