package com.recipeapp.recipe_app.service;

import com.recipeapp.recipe_app.dto.RecipeDTO;
import com.recipeapp.recipe_app.model.Ingredient;
import com.recipeapp.recipe_app.model.Recipe;
import com.recipeapp.recipe_app.model.User;
import com.recipeapp.recipe_app.repository.RecipeRepository;
import com.recipeapp.recipe_app.repository.UserRepository;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private CloudinaryService cloudinaryService;


    public RecipeService(RecipeRepository recipeRepository, UserRepository userRepository, CloudinaryService cloudinaryService) {
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<Recipe> searchRecipesByName(String name) {
        return recipeRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Recipe> searchRecipesByIngredients(List<String> ingredients) {
        return recipeRepository.findByIngredients(ingredients, ingredients.size());
    }

    public Recipe saveRecipe(RecipeDTO recipeDTO, MultipartFile imageFile, String username) {
        // 1. Construim entitatea Recipe din DTO
        Recipe recipe = new Recipe();
        recipe.setName(recipeDTO.getName());
        recipe.setInstructions(recipeDTO.getInstructions());
        recipe.setNotes(recipeDTO.getNotes());
        recipe.setExternalLink(recipeDTO.getExternalLink()); // 🆕 Setăm linkul extern

        // 2. Transformăm IngredientDTO -> Ingredient și le legăm de rețetă
        List<Ingredient> ingredients = new ArrayList<>();
        if (recipeDTO.getIngredients() != null) {
            ingredients = recipeDTO.getIngredients().stream().map(dto -> {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(dto.getName());
                ingredient.setQuantity(dto.getQuantity());
                ingredient.setUnit(dto.getUnit());
                ingredient.setRecipe(recipe);
                return ingredient;
            }).collect(Collectors.toList());
        }
        recipe.setIngredients(ingredients);

        // 3. Dacă user-ul a încărcat un fișier imagine, îl salvăm în "uploads/"
//        if (imageFile != null && !imageFile.isEmpty()) {
//            try {
//                String originalFilename = imageFile.getOriginalFilename();
//                // generăm un nume unic pentru fișier
//                String uniqueFilename = "recipe-" + System.currentTimeMillis() + "_" + originalFilename;
//
//                // folderul "uploads/" - îl creăm dacă nu există
//                Path uploadPath = Paths.get("uploads");
//                if (!Files.exists(uploadPath)) {
//                    Files.createDirectories(uploadPath);
//                }
//
//                // copiem fișierul în "uploads/" cu redimensionare și compresie
//                Path filePath = uploadPath.resolve(uniqueFilename);
//
//                // Verificăm extensia fișierului (acceptăm doar JPG și PNG pentru control)
//                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
//
//                try (OutputStream os = Files.newOutputStream(filePath)) {
//                    BufferedImage originalImage = ImageIO.read(imageFile.getInputStream());
//
//                    // ⚙️ Redimensionare la lățime max 1000px (păstrăm proporțiile)
//                    BufferedImage resizedImage = Thumbnails.of(originalImage)
//                            .size(1000, 1000) // se va păstra aspect ratio
//                            .asBufferedImage();
//
//                    // 💾 Salvăm în funcție de tip (cu compresie la JPEG)
//                    if ("jpg".equals(fileExtension) || "jpeg".equals(fileExtension)) {
//                        ImageWriter jpgWriter = ImageIO.getImageWritersByFormatName("jpg").next();
//                        ImageWriteParam jpgWriteParam = jpgWriter.getDefaultWriteParam();
//                        jpgWriteParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
//                        jpgWriteParam.setCompressionQuality(0.8f); // 80% calitate
//
//                        try (ImageOutputStream ios = ImageIO.createImageOutputStream(os)) {
//                            jpgWriter.setOutput(ios);
//                            jpgWriter.write(null, new IIOImage(resizedImage, null, null), jpgWriteParam);
//                        }
//
//                        jpgWriter.dispose();
//                    } else {
//                        // PNG nu suportă compresie „lossy” — salvăm direct
//                        ImageIO.write(resizedImage, fileExtension, os);
//                    }
//                }
//
//
//                // stocăm în DB doar calea accesibilă via HTTP
//                // ex: "/recipe-1679068342123_img.jpg"
//                recipe.setImagePath("/" + uniqueFilename);
//
//            } catch (IOException e) {
//                e.printStackTrace();
//                throw new RuntimeException("Eroare la salvarea fișierului imagine", e);
//            }
//        }
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadFile(imageFile);
                recipe.setImagePath(imageUrl);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Eroare la procesarea sau urcarea imaginii", e);
            }
        }

        // Obținem User din UserRepository
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        recipe.setUser(user);
        // 4. Salvăm rețeta în DB (include și ingredientele)
        return recipeRepository.save(recipe);
    }

    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    @Transactional
    public Optional<Recipe> updateRecipe(Long id, RecipeDTO recipeDTO, MultipartFile imageFile, boolean deleteImage) {
        Optional<Recipe> optionalRecipe = recipeRepository.findById(id);
        if (optionalRecipe.isEmpty()) {
            return Optional.empty();
        }

        Recipe recipe = optionalRecipe.get();
        if (deleteImage) {
            recipe.setImagePath(null); // 🔹 Ștergem calea din DB
        }
        // Actualizăm doar câmpurile transmise
        if (recipeDTO.getName() != null) {
            recipe.setName(recipeDTO.getName());
        }

        if (recipeDTO.getInstructions() != null) {
            recipe.setInstructions(recipeDTO.getInstructions());
        }

        if (recipeDTO.getNotes() != null) {
            recipe.setNotes(recipeDTO.getNotes());
        }

        if (recipeDTO.getExternalLink() != null) {
            recipe.setExternalLink(recipeDTO.getExternalLink());
        }

        // Dacă a fost trimis un fișier imagine nou
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String originalFilename = imageFile.getOriginalFilename();
                String uniqueFilename = "recipe-" + System.currentTimeMillis() + "_" + originalFilename;
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                // copiem fișierul în "uploads/" cu redimensionare și compresie
                Path filePath = uploadPath.resolve(uniqueFilename);

                // Verificăm extensia fișierului (acceptăm doar JPG și PNG pentru control)
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

                try (OutputStream os = Files.newOutputStream(filePath)) {
                    BufferedImage originalImage = ImageIO.read(imageFile.getInputStream());

                    // ⚙️ Redimensionare la lățime max 1000px (păstrăm proporțiile)
                    BufferedImage resizedImage = Thumbnails.of(originalImage)
                            .size(1000, 1000) // se va păstra aspect ratio
                            .asBufferedImage();

                    // 💾 Salvăm în funcție de tip (cu compresie la JPEG)
                    if ("jpg".equals(fileExtension) || "jpeg".equals(fileExtension)) {
                        ImageWriter jpgWriter = ImageIO.getImageWritersByFormatName("jpg").next();
                        ImageWriteParam jpgWriteParam = jpgWriter.getDefaultWriteParam();
                        jpgWriteParam.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                        jpgWriteParam.setCompressionQuality(0.8f); // 80% calitate

                        try (ImageOutputStream ios = ImageIO.createImageOutputStream(os)) {
                            jpgWriter.setOutput(ios);
                            jpgWriter.write(null, new IIOImage(resizedImage, null, null), jpgWriteParam);
                        }

                        jpgWriter.dispose();
                    } else {
                        // PNG nu suportă compresie „lossy” — salvăm direct
                        ImageIO.write(resizedImage, fileExtension, os);
                    }
                }
                recipe.setImagePath("/" + uniqueFilename);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Eroare la actualizarea imaginii", e);
            }
        }

        // curățăm lista de ingrediente și adăugăm noile ingrediente
        recipe.getIngredients().clear();

        if (recipeDTO.getIngredients() != null) {
            for (var dto : recipeDTO.getIngredients()) {
                Ingredient ingredient = new Ingredient();
                ingredient.setName(dto.getName());
                ingredient.setQuantity(dto.getQuantity());
                ingredient.setUnit(dto.getUnit());
                ingredient.setRecipe(recipe);
                recipe.getIngredients().add(ingredient);
            }
        }

        Recipe updated = recipeRepository.save(recipe);
        return Optional.of(updated);
    }

    public Page<Recipe> getFilteredRecipes(String name, List<String> ingredients, Pageable pageable, String username) {
        System.out.println("Ajuns în filtrare cu ingrediente: " + ingredients + " pentru user: " + username);
        boolean hasName = name != null && !name.isBlank();
        boolean hasIngredients = ingredients != null && !ingredients.isEmpty();

        if (!hasName && !hasIngredients) {
            return recipeRepository.findByUserUsername(username, pageable);
        }

        if (!hasName) {
            return recipeRepository.findByPartialIngredientNames(ingredients, username, pageable);
        }

        if (!hasIngredients) {
            return recipeRepository.findByUserUsernameAndNameContainingIgnoreCase(username, name, pageable);
        }

        // filtrare dublă – întâi după ingrediente, apoi după nume
        Page<Recipe> filteredByIngredients = recipeRepository.findByPartialIngredientNames(ingredients, username, pageable);

        String lowerName = name.toLowerCase();
        List<Recipe> filteredRecipes = filteredByIngredients
                .stream()
                .filter(r -> r.getName().toLowerCase().contains(lowerName))
                .toList();

        return new PageImpl<>(filteredRecipes, pageable, filteredRecipes.size());
    }

    public Page<Recipe> getFilteredPublicRecipes(String name, List<String> ingredients, Pageable pageable) {
        System.out.println("🟢 Filtrare PUBLICĂ: name=" + name + ", ingredients=" + ingredients);

        boolean hasName = name != null && !name.isBlank();
        boolean hasIngredients = ingredients != null && !ingredients.isEmpty();

        // ✅ Fără filtre: returnăm toate rețetele publice (ale userului 'system')
        if (!hasName && !hasIngredients) {
            return recipeRepository.findByUserUsername("system", pageable);
        }

        // ✅ Doar ingrediente
        if (!hasName) {
            return recipeRepository.findByPartialIngredientNames(ingredients, "system", pageable);
        }

        // ✅ Doar nume
        if (!hasIngredients) {
            return recipeRepository.findByUserUsernameAndNameContainingIgnoreCase("system", name, pageable);
        }

        // ✅ Ambele filtre
        Page<Recipe> filteredByIngredients = recipeRepository.findByPartialIngredientNames(ingredients, "system", pageable);

        String lowerName = name.toLowerCase();
        List<Recipe> filteredRecipes = filteredByIngredients
                .stream()
                .filter(r -> r.getName().toLowerCase().contains(lowerName))
                .toList();

        return new PageImpl<>(filteredRecipes, pageable, filteredRecipes.size());
    }

    public Page<Recipe> getFilteredPublicRecipesForSystemUser(String name, List<String> ingredients, Pageable pageable) {
        return getFilteredPublicRecipes(name, ingredients, pageable);
    }

    public Recipe copyRecipeToUser(Long originalId, String targetUsername) {
        Optional<Recipe> originalOpt = recipeRepository.findById(originalId);
        if (originalOpt.isEmpty()) return null;

        Recipe original = originalOpt.get();

        // Verificăm dacă rețeta aparține userului 'system'
        if (!"system".equalsIgnoreCase(original.getUser().getUsername())) {
            throw new RuntimeException("Recipe is not public and cannot be copied.");
        }

        // Găsim utilizatorul curent
        User targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + targetUsername));

        // Creăm o copie
        Recipe copy = new Recipe();
        copy.setName(original.getName());
        copy.setInstructions(original.getInstructions());
        copy.setNotes(original.getNotes());
        copy.setExternalLink(original.getExternalLink());
        copy.setImagePath(original.getImagePath()); // Copiem calea, nu fișierul

        // Copiem ingredientele
        List<Ingredient> copiedIngredients = original.getIngredients().stream().map(origIng -> {
            Ingredient ing = new Ingredient();
            ing.setName(origIng.getName());
            ing.setQuantity(origIng.getQuantity());
            ing.setUnit(origIng.getUnit());
            ing.setRecipe(copy); // legătură bidirecțională
            return ing;
        }).collect(Collectors.toList());

        copy.setIngredients(copiedIngredients);
        copy.setUser(targetUser);

        return recipeRepository.save(copy);
    }

    public List<String> autocompleteRecipeNames(String prefix) {
        return recipeRepository.findDistinctNamesStartingWith(prefix);
    }
}