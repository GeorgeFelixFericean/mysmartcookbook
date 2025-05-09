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
            throw new InvalidCredentialsException("Invalid username or password");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // Dacă trece de verificări, returnăm user-ul
        return user;
    }


    // Poți adăuga mai târziu metode pentru login, găsire după email etc.
}
