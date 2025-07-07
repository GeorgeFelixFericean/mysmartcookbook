package com.recipeapp.recipe_app.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔐 Tokenul unic generat
    @Column(nullable = false, unique = true)
    private String token;

    // 🔗 Legătura cu userul care vrea resetare
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 🕒 Expiră după 1 oră
    @Column(nullable = false)
    private LocalDateTime expirationDate;

    // ✅ Constructori
    public PasswordResetToken() {
    }

    public PasswordResetToken(String token, User user, LocalDateTime expirationDate) {
        this.token = token;
        this.user = user;
        this.expirationDate = expirationDate;
    }

    // ✅ Getteri și setteri
    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }
}
