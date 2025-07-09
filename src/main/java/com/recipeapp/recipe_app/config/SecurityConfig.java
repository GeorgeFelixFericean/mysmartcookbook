package com.recipeapp.recipe_app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
public class SecurityConfig {
    @Autowired
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers(
                                "/h2-console/**",
                                "/api/users/register",
                                "/api/users/login"
                        )
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/login", "/register", "/forgot-password", "/reset-password",
                                "/api/users/register", "/api/users/login", "/api/users/activate",
                                "/api/forgot-password", "/api/reset-password", "/api/recover-username",
                                "/h2-console/**", "/css/**", "/css_old/**", "/js/**", "/img/**", "/html/**", "/fonts/**",
                                "/template-test/**", "/template-test/css/**", "/template-test/img/**", "/api/recipes/public",
                                "/uploads/**", "/*.jpg", "/public-recipes", "/public-recipe-free/**",
                                "/api/recipes/public/by-id/**", "/demo-tour", "/api/contact", "/api/ingredients/autocomplete",
                                "/api/recipes/autocomplete", "/csrf"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                )
                .logout(logout -> logout.permitAll());
        return http.build();
    }
}