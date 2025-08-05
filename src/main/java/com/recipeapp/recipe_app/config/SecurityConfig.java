package com.recipeapp.recipe_app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;


import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // H2 Console Security Configuration
    @Bean
    @Order(1)
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(AntPathRequestMatcher.antMatcher("/h2-console/**"))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**")).permitAll()
                );
        return http.build();
    }

    // Main Security Configuration
    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configure CSRF cookie
        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        tokenRepository.setCookieCustomizer(customizer -> {
            customizer.sameSite("Strict");
            customizer.secure(false); // true in production
            customizer.path("/");
        });
        tokenRepository.setHeaderName("X-XSRF-TOKEN");

        http
                // CSRF Configuration
                .csrf(csrf -> {
                    csrf.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler() {
                        @Override
                        public void handle(HttpServletRequest request,
                                           HttpServletResponse response,
                                           Supplier<CsrfToken> csrfToken) {
                            if ("GET".equals(request.getMethod())) {
                                CsrfToken token = csrfToken.get();
                                tokenRepository.saveToken(token, request, response);
                            }
                        }
                    });
                    csrf.csrfTokenRepository(tokenRepository);
                })

                // Exception Handling
                .exceptionHandling(ex -> ex
//                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                    response.setContentType("application/json");
                                    response.setStatus(403);
                                    response.getWriter().write("{\"error\":\"Access denied - Invalid CSRF token\"}");
                                })
                )

                // Security Headers (Updated for CSS)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives(
                                        "default-src 'self'; " +
                                                "script-src 'self' 'unsafe-inline'; " +
                                                "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
                                                "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com https://cdn.jsdelivr.net data:; " +
                                                "img-src 'self' data: blob:; " +
                                                "connect-src 'self'"
                                )
                        )
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .preload(true)
                                .maxAgeInSeconds(31536000)
                        )
                        .xssProtection(xss -> xss
                                .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK)
                        )
                )

                // Authorization
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/login", "/register", "/forgot-password", "/reset-password",
                                "/api/users/register", "/api/users/login", "/api/users/activate",
                                "/api/forgot-password", "/api/reset-password", "/api/recover-username",
                                "/css/**", "/js/**", "/img/**", "/fonts/**",
                                "/api/recipes/public/**", "/uploads/**",
                                "/public-recipes", "/public-recipe-free/**",
                                "/demo-tour", "/api/contact",
                                "/api/ingredients/autocomplete", "/api/recipes/autocomplete",
                                "/api/csrf-token", "/api/csrf", "/*.*", "/privacy", "/terms", "/contact", "/about"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                // 👇 Adaugă această linie:
                .httpBasic(Customizer.withDefaults())

                .formLogin(AbstractHttpConfigurer::disable)

                // Logout
                .logout(logout -> logout
                        .logoutUrl("/api/users/logout")
                        .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                        .invalidateHttpSession(true)
                        .permitAll()
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.builder()
                .username("myaccess")
                .password("$2a$10$2k69.vgXgXNySoxFPdlrXezOCLw9dmZ.uXBEOAiuJGQrG3mSzIBNm") // encoded offline
                .roles("GATEKEEPER")
                .build();

        return new InMemoryUserDetailsManager(user);
    }

}