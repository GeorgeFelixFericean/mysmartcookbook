package com.recipeapp.recipe_app.dto;

/**
 * DTO pentru datele primite la login.
 * Conține username și parola.
 */
public class LoginRequest {

    private String username;
    private String password;

    // Constructor gol (necesar pentru Spring)
    public LoginRequest() {}

    // Getters și setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
