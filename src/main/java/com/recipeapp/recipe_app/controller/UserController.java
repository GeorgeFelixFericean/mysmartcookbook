// UserController.java
package com.recipeapp.recipe_app.controller;

import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users") // Prefix pentru toate rutele din controller
@CrossOrigin(origins = "*") // Permite accesul frontendului din altă origine (dev mode)
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint pentru înregistrarea unui utilizator nou.
     * Primește JSON de tipul:
     * {
     *   "username": "testuser",
     *   "email": "test@example.com",
     *   "password": "password123"
     * }
     */
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // Aici poți adăuga validări suplimentare dacă e cazul
        return userService.registerUser(user);
    }
}
