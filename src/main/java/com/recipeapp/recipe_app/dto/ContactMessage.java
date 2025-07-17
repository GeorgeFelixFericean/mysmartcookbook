// 📁 src/main/java/com/recipeapp/recipe_app/dto/ContactMessage.java
package com.recipeapp.recipe_app.dto;

public class ContactMessage {
    private String name;
    private String message;
    private String email;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
