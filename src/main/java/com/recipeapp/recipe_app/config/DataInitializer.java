package com.recipeapp.recipe_app.config;

import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initSystemUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String systemEmail = "system@whatcanieat.com";

            if (userRepository.findByEmail(systemEmail).isEmpty()) {
                User systemUser = new User();
                systemUser.setUsername("system");
                systemUser.setEmail(systemEmail);
                systemUser.setPassword(passwordEncoder.encode("dummy-password"));
                userRepository.save(systemUser);

                System.out.println("✅ System user created");
            } else {
                System.out.println("ℹ️ System user already exists");
            }
        };
    }
}
