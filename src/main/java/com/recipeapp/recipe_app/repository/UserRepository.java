package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository interface for User entity.
 * This provides basic CRUD operations and custom finder methods.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used for login)
    Optional<User> findByEmail(String email);

    // Check if a user with the given email exists (used for validation during registration)
    boolean existsByEmail(String email);

    // Check if a user with the given username exists
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByActivationCode(String code);

}
