package com.recipeapp.recipe_app.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dti9mi29n",
                "api_key", "665142894927999",
                "api_secret", "6z_k3nxs-3CljU0f0LGD1NljRI8"
        ));
    }
}
