package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.exception.InvalidCredentialsException;
import com.recipeapp.recipe_app.exception.UserAlreadyExistsException;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;


    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Salvăm un utilizator în baza de date
    public User registerUser(User user) {
        // ===========================
        // Verificare lungime minimă parolă
        // ===========================
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        // Verificare format valid email
        if (!user.getEmail().matches("^[^@]+@[^@]+\\.[^@]+$")) {
            throw new IllegalArgumentException("Invalid email format. Example: yourname@domain.com");
        }

        // Verificăm dacă username-ul există deja
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        // Verificăm dacă email-ul există deja
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("Email is already in use");
        }

        // Criptăm parola înainte de salvare
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        // Setăm contul ca inactiv
        user.setEnabled(false);

        // Generăm un cod unic de activare
        String activationCode = UUID.randomUUID().toString();
        user.setActivationCode(activationCode);

        User savedUser = userRepository.save(user);

        // 🔗 Construim linkul de activare
        String activationLink = "http://localhost:8080/api/users/activate?code=" + savedUser.getActivationCode();

        // ✉️ Trimitem emailul
        emailService.sendActivationEmail(savedUser.getEmail(), savedUser.getUsername(), activationLink);

        return savedUser;
    }

    /**
     * Verifică dacă username și parola sunt corecte pentru login.
     * Aruncă InvalidCredentialsException dacă datele nu sunt valide.
     *
     * @param username Username-ul introdus de utilizator
     * @param password Parola introdusă de utilizator
     */
    public User login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            throw new InvalidCredentialsException("Invalid username. Please try again.");
        }

        User user = userOptional.get();

        // 🔒 Verificăm dacă contul este activat
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Account not activated. Please check your email.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Incorrect password. Please try again.");
        }

        // Dacă trece de verificări, returnăm user-ul
        return user;
    }


    public boolean activateUser(String code) {
        Optional<User> optionalUser = userRepository.findByActivationCode(code);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Activăm contul
            user.setEnabled(true);

            // Ștergem codul de activare (nu mai e nevoie)
            user.setActivationCode(null);

            // Salvăm modificările
            userRepository.save(user);
            return true;
        }

        return false; // Cod invalid
    }
}
