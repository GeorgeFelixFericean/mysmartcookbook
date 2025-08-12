package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.exception.InvalidCredentialsException;
import com.recipeapp.recipe_app.exception.UserAlreadyExistsException;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    @Value("${app.activation.base-url}")
    private String activationBaseUrl;


    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User registerUser(User user) {
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        if (!user.getEmail().matches("^[^@]+@[^@]+\\.[^@]+$")) {
            throw new IllegalArgumentException("Invalid email format. Example: yourname@domain.com");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use");
        }

        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        user.setEnabled(false);

        String activationCode = UUID.randomUUID().toString();
        user.setActivationCode(activationCode);

        User savedUser = userRepository.save(user);

        String activationLink = activationBaseUrl + "/api/users/activate?code=" + savedUser.getActivationCode();

        emailService.sendActivationEmail(savedUser.getEmail(), savedUser.getUsername(), activationLink);

        return savedUser;
    }

    public User login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new InvalidCredentialsException("Invalid username. Please try again.");
        }

        User user = userOptional.get();

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Account not activated. Please check your email.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Incorrect password. Please try again.");
        }

        return user;
    }

    public boolean activateUser(String code) {
        Optional<User> optionalUser = userRepository.findByActivationCode(code);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            user.setEnabled(true);

            user.setActivationCode(null);

            userRepository.save(user);
            return true;
        }

        return false;
    }
}
