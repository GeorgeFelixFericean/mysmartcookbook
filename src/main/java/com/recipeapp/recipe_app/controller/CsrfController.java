package com.recipeapp.recipe_app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CsrfController {
    @GetMapping("/csrf-token")
    public ResponseEntity<Map<String, String>> getCsrfToken() {
        return ResponseEntity.ok()
                .body(Map.of("status", "CSRF token cookie set"));
    }
}