package com.recipeapp.recipe_app.controller;

import com.recipeapp.recipe_app.dto.ContactMessage;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.contact.receiver}")
    private String toEmail;

    @PostMapping
    public String sendMessage(@RequestBody ContactMessage message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String senderName = (message.getName() != null && !message.getName().trim().isEmpty())
                    ? message.getName()
                    : "Anonymous";

            String senderEmail = (message.getEmail() != null && !message.getEmail().trim().isEmpty())
                    ? message.getEmail()
                    : null;

            String subject = "New message from MySmartCookbook";
            StringBuilder contentBuilder = new StringBuilder();

            contentBuilder.append("From: ").append(senderName);
            if (senderEmail != null) {
                contentBuilder.append(" <").append(senderEmail).append(">");
            }
            contentBuilder.append("\n\nMessage:\n").append(message.getMessage());

            helper.setText(contentBuilder.toString(), false);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setFrom(fromEmail);

            mailSender.send(mimeMessage);
            return "Message sent successfully!";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Failed to send message.";
        }
    }
}
