package com.recipeapp.recipe_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @GetMapping("/")
    public String landingPage() {
        return "landing"; // va încărca landing.html din templates
    }

    @GetMapping("/home")
    public String homePage() {
        return "home"; // home.html rămâne exact cum e
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register"; // returnează register.html din templates
    }

    @GetMapping("/add-recipe")
    public String addRecipePage() {
        return "add-recipe";
    }

    @GetMapping("/search")
    public String searchPage() {
        return "search";
    }

    @GetMapping("/all-recipes")
    public String allRecipesPage() {
        return "all-recipes";
    }

    @GetMapping("/recipe/{id}")
    public String recipeDetailsPage(@PathVariable Long id) {
        // Nu încărcăm datele direct aici,
        // doar returnăm pagina "recipe.html"
        return "recipe";
    }

    @GetMapping("/edit-recipe/{id}")
    public String editRecipePage(@PathVariable Long id) {
        return "edit-recipe"; // Va încărca edit-recipe.html din templates
    }
}
