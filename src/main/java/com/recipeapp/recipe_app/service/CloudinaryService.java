// CloudinaryService.java
package com.recipeapp.recipe_app.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // ✅ Injectăm valorile din application.properties
    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret
    ) {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    // ✅ Metodă care primește imaginea prelucrată (ca byte[])
    public String uploadImage(byte[] imageBytes) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(imageBytes,
                ObjectUtils.asMap("folder", "recipes"));
        return uploadResult.get("secure_url").toString();
    }
}
