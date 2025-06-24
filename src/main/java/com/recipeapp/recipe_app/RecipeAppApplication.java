package com.recipeapp.recipe_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class RecipeAppApplication {

	public static void main(String[] args) {
//		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
//		String rawPassword = "admin123"; // sau altă parolă
//		String encodedPassword = encoder.encode(rawPassword);
//		System.out.println(encodedPassword);
		SpringApplication.run(RecipeAppApplication.class, args);
	}

}
