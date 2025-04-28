package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.exception.UserAlreadyExistsException;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Salvăm un utilizator în baza de date
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use");
        }
        // Criptăm parola înainte de salvare
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }


    // Poți adăuga mai târziu metode pentru login, găsire după email etc.
}
