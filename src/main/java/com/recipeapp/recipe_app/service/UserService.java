package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.exception.InvalidCredentialsException;
import com.recipeapp.recipe_app.exception.UserAlreadyExistsException;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

        // Salvăm utilizatorul
        return userRepository.save(user);
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
            throw new InvalidCredentialsException("Hmm... We couldn't find that chef in our kitchen. 🍳 Try again or check your username.");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Oops! That password doesn’t smell right... 🍽️ Try again!");
        }

        // Dacă trece de verificări, returnăm user-ul
        return user;
    }


    // Poți adăuga mai târziu metode pentru login, găsire după email etc.
}
