package com.recipeapp.recipe_app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendActivationEmail(String toEmail, String username, String activationLink) {
        String url = "https://api.brevo.com/v3/smtp/email";

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("sender", Map.of("name", "My Smart Cookbook", "email", "contact@mysmartcookbook.com"));
        emailData.put("to", List.of(Map.of("email", toEmail, "name", username)));
        emailData.put("subject", "Activate your account");
        emailData.put("htmlContent", """
                <p>Hello <strong>%s</strong>,</p>
                <p>Thank you for registering! Please activate your account by clicking the link below:</p>
                <p><a href="%s">Activate My Account</a></p>
                <p>If you didn’t request this, you can ignore this message.</p>
                """.formatted(username, activationLink)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("❌ Failed to send activation email: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Email sending exception: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String username, String resetLink) {
        String url = "https://api.brevo.com/v3/smtp/email";

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("sender", Map.of("name", "My Smart Cookbook", "email", "contact@mysmartcookbook.com"));
        emailData.put("to", List.of(Map.of("email", toEmail, "name", username)));
        emailData.put("subject", "Reset your password");
        emailData.put("htmlContent", """
                <p>Hi there,</p>
                <p>We received a request to reset the password for your <strong>My Smart Cookbook</strong> account.</p>
                <p><strong>Username:</strong> %s</p>
                <p>Click the link below to set a new password:</p>
                <p><a href="%s">Reset My Password</a></p>
                <p>This link will expire in 1 hour. If you didn’t request this, you can safely ignore the message.</p>
                <p>– The My Smart Cookbook Team</p>
                """.formatted(username, resetLink)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("❌ Failed to send password reset email: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Password reset email exception: " + e.getMessage());
        }
    }

    public void sendGenericEmail(String toEmail, String subject, String htmlBody) {
        String url = "https://api.brevo.com/v3/smtp/email";

        Map<String, Object> emailData = new HashMap<>();
        emailData.put("sender", Map.of("name", "My Smart Cookbook", "email", "contact@mysmartcookbook.com"));
        emailData.put("to", List.of(Map.of("email", toEmail)));
        emailData.put("subject", subject);
        emailData.put("htmlContent", htmlBody);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailData, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("❌ Failed to send email: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("❌ Email sending exception: " + e.getMessage());
        }
    }
}
