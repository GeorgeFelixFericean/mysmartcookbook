package com.recipeapp.recipe_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class PageController {

    @GetMapping("/")
    public String landingPage() {
        return "index";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }


    @GetMapping("/home")
    public String homePage() {
        return "home";
    }

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
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
        return "recipe";
    }

    @GetMapping("/edit-recipe/{id}")
    public String editRecipePage(@PathVariable Long id) {
        return "edit-recipe";
    }

    @GetMapping("/public-recipes")
    public String publicRecipesPage() {
        return "public-recipes";
    }

    @GetMapping("/public-recipes-user")
    public String publicRecipesForLoggedInUsers() {
        return "public-recipes-user";
    }

    @GetMapping("/public-recipe-user/{id}")
    public String publicRecipeUserDetailsPage(@PathVariable Long id) {
        return "public-recipe-user";
    }

    @GetMapping("/public-recipe-free/{id}")
    public String publicRecipeFreeDetailsPage(@PathVariable Long id) {
        return "public-recipe-free";
    }

    @GetMapping("/demo-tour")
    public String demoTourPage() {
        return "demo-tour";
    }

    @GetMapping("/forgot-password")
    public String showForgotPasswordPage() {
        return "forgot-password";
    }

    @GetMapping("/reset-password")
    public String showResetPasswordPage() {
        return "reset-password";
    }

    @GetMapping("/public-recipe-free")
    public String redirectPublicFreeToHome() {
        return "redirect:/home";
    }

    @GetMapping("/privacy")
    public String showPrivacyPage() {
        return "privacy";
    }

    @GetMapping("/terms")
    public String showTermsPage() {
        return "terms";
    }

    @GetMapping("/contact")
    public String showContactPage() {
        return "contact";
    }

    @GetMapping("/about")
    public String showAboutUsPage() {
        return "about";
    }
}
