// UserController.java
package com.recipeapp.recipe_app.controller;

import com.recipeapp.recipe_app.dto.LoginRequest;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
     * "username": "testuser",
     * "email": "test@example.com",
     * "password": "password123"
     * }
     */
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        // Aici poți adăuga validări suplimentare dacă e cazul
        return userService.registerUser(user);
    }

    /**
     * Endpoint pentru autentificarea utilizatorilor.
     *
     * @param loginRequest DTO care conține username și password
     * @return 200 OK dacă login-ul reușește, 401 Unauthorized dacă eșuează
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            User user = userService.login(loginRequest.getUsername(), loginRequest.getPassword());

            // Creează Authentication
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, List.of() // sau roluri, dacă ai
            );

            // Setează SecurityContext
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Leagă SecurityContext de sesiune
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Endpoint explicit pentru logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        // Invalidăm sesiunea
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Ștergem contextul de securitate
        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("Logged out successfully");
    }

}
