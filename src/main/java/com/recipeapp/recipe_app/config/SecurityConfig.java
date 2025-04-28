package com.recipeapp.recipe_app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Bean pentru encoderul de parole
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(auth -> auth

    /// /                        .requestMatchers("/api/users/register", "/h2-console/**").permitAll()
//                                .requestMatchers("/api/users/register", "/h2-console/**").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .csrf(csrf -> csrf.disable()) // ok pentru testare în Postman
//                .formLogin(login -> login.disable()) // dezactivează login-ul UI
//                .httpBasic(basic -> basic.disable()); // dezactivează basic auth
//
//        return http.build();
//    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/home", "/add-recipe", "/login", "/register", "/api/users/register", "/api/users/login", "/h2-console/**", "/css/**", "/js/**", "/img/**").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                )
                .logout(logout -> logout.permitAll());

        return http.build();
    }


}
