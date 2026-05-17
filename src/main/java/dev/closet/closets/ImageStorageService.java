package dev.closet.closets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ImageStorageService {
    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    public ImageUploadResponse store(MultipartFile file, TagSuggestionService tagSuggestionService) throws IOException {
        validate(file);
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename());
        String extension = extensionFor(file, originalFilename);
        String generatedName = Instant.now().toEpochMilli() + "-" + UUID.randomUUID() + extension;
        Path uploadPath = Path.of(uploadBaseDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);
        Path destination = uploadPath.resolve(generatedName).normalize();
        if (!destination.startsWith(uploadPath)) {
            throw new IllegalArgumentException("Invalid file name.");
        }
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return new ImageUploadResponse(
                "/api/v1/uploads/images/" + generatedName,
                tagSuggestionService.suggest(List.of(originalFilename))
        );
    }

    public Path resolveFile(String filename) {
        String cleanName = StringUtils.cleanPath(filename);
        Path basePath = Path.of(uploadBaseDir).toAbsolutePath().normalize();
        Path resolved = basePath.resolve(cleanName).normalize();
        if (!resolved.startsWith(basePath)) {
            throw new IllegalArgumentException("Invalid file path.");
        }
        return resolved;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image exceeds the 5MB limit.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported image type.");
        }
    }

    private String extensionFor(MultipartFile file, String originalFilename) {
        String fromName = originalFilename.contains(".")
                ? "." + originalFilename.substring(originalFilename.lastIndexOf('.') + 1)
                : "";
        if (!fromName.isBlank()) {
            return fromName.toLowerCase(Locale.ROOT);
        }
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        return switch (type) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
