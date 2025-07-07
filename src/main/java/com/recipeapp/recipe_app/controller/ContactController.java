// 📁 src/main/java/com/recipeapp/recipe_app/controller/ContactController.java
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
    private String toEmail;  // Adresa la care vrei să primești mesajele

    @PostMapping
    public String sendMessage(@RequestBody ContactMessage message) {
        try {

            System.out.println("✅ Mesaj primit din frontend:");
            System.out.println("Nume: " + message.getName());
            System.out.println("Mesaj: " + message.getMessage());

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            String subject = "New message from MySmartCookbook";
            String content = "From: " +
                    ((message.getName() != null && !message.getName().trim().isEmpty()) ? message.getName() : "Anonymous") +
                    "\n\nMessage:\n" + message.getMessage();

            helper.setText(content, false);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setFrom(fromEmail);

            mailSender.send(mimeMessage);
            System.out.println("✅ Email trimis cu succes către: " + toEmail);
            return "Message sent successfully!";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Failed to send message.";
        }
    }
}
