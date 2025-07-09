// UserController.java
package com.recipeapp.recipe_app.controller;

import com.recipeapp.recipe_app.dto.LoginRequest;
import com.recipeapp.recipe_app.exception.InvalidCredentialsException;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

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
        } catch (InvalidCredentialsException e) {
            // ===============================
            // Prindem excepția de credențiale invalide
            // ===============================
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", e.getMessage()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Endpoint explicit pentru logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response) {
        // Invalidăm sesiunea
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Ștergem contextul de securitate
        SecurityContextHolder.clearContext();

        // Ștergem JSESSIONID-ul de pe client
        Cookie cookie = new Cookie("JSESSIONID", null);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Expiră imediat
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/activate")
    public void activateAccount(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        boolean activated = userService.activateUser(code);

        if (activated) {
            // Redirect cu parametru de succes
            response.sendRedirect("/login?activated=true");
        } else {
            // Redirect cu parametru de eroare
            response.sendRedirect("/login?activationFailed=true");
        }
    }
}