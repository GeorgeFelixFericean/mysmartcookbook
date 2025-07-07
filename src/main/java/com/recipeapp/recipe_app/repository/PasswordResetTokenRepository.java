// ===== PasswordResetTokenRepository.java =====
// Repository for CRUD + finder methods on PasswordResetToken
// ------------------------------------------------------------

package com.recipeapp.recipe_app.repository;

import com.recipeapp.recipe_app.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends JpaRepository<PasswordResetToken, Long> {

    // 🔍 Caută tokenul în DB (folosit când userul accesează linkul de resetare)
    Optional<PasswordResetToken> findByToken(String token);
}
