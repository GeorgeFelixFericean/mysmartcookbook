package com.recipeapp.recipe_app.controller;

import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.model.RecipeIngredient;
import com.recipeapp.recipe_app.service.IngredientService;
import com.recipeapp.recipe_app.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private IngredientService ingredientService;


    @GetMapping("/")
    public String showHomePage() {
        return "index";  // presupunând că "index.html" este în directorul "templates"
    }


    // Metodă pentru a reda formularul de adăugare a unei rețete
    @GetMapping("/recipes/add")
    public String showAddRecipeForm(Model model) {
        Recipe recipe = new Recipe();
        recipe.setIngredients(new ArrayList<>());  // Inițializează lista de ingrediente
        model.addAttribute("recipe", recipe);
        return "add-recipe";  // Redirecționează către pagina de adăugare a rețetei
    }

    // Metodă pentru a procesa formularul de adăugare a unei rețete
    @PostMapping("/recipes/add")
    public String addRecipe(@ModelAttribute Recipe recipe) {
        // Salvează fiecare ingredient înainte de a salva rețeta
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            Ingredient ingredient = recipeIngredient.getIngredient();

            // Salvează ingredientul dacă nu este deja salvat
            if (ingredient.getId() == null) {
                // Ingredient nou - trebuie salvat înainte de a fi folosit
                ingredientService.save(ingredient);
            }
        }

        // După ce ingredientele sunt salvate, salvează rețeta
        recipeService.save(recipe);
        return "redirect:/recipes";  // După adăugare, redirecționează către lista de rețete
    }


    @GetMapping("/recipes")
    public String getAllRecipes(Model model) {
        List<Recipe> recipes = recipeService.getAllRecipes();
        model.addAttribute("recipes", recipes);
        return "recipes-list"; // Asigură-te că există un template Thymeleaf numit 'recipes-list.html'
    }

//
//    @PostMapping
//    public Recipe createRecipe(@RequestBody Recipe recipe) {
//        return recipeService.createRecipe(recipe);
//    }

    @GetMapping("/{id}")
    public Recipe getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
    }
}

