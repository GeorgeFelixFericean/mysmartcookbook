// ===== PasswordResetService.java =====
// Generează token și trimite email cu link de resetare
// -----------------------------------------------------

package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.model.PasswordResetToken;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.PasswordResetTokenRepository;
import com.recipeapp.recipe_app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void createPasswordResetToken(String email) {
        // 🔍 Căutăm userul după email
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("No user found with that email");
        }

        User user = optionalUser.get();

        // 🔐 Generăm token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiration = LocalDateTime.now().plusHours(1);

        // 💾 Salvăm tokenul în DB
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiration);
        tokenRepository.save(resetToken);

        // 📧 Construim linkul și trimitem emailul
//        String resetLink = "https://mysmartcookbook.com/reset-password?token=" + token;
        String resetLink = "http://localhost:8080/reset-password?token=" + token;
        String subject = "Reset your password";
        String body = "Hi " + user.getUsername() + ",\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "Best regards,\nWhatCanIEat?! Team";

        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), resetLink);
    }

    public void resetPassword(String token, String newPassword) {
        // 🔍 Căutăm tokenul în DB
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));

        // ⏰ Verificăm dacă tokenul a expirat
        if (resetToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired. Please request a new reset link.");
        }

        // 🔐 Resetăm parola utilizatorului
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 🗑️ Ștergem tokenul pentru siguranță
        tokenRepository.delete(resetToken);
    }

}
