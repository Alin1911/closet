package dev.closet.closets;

import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/v1/uploads/images")
public class ImageUploadController {
    private final ImageStorageService imageStorageService;
    private final TagSuggestionService tagSuggestionService;

    public ImageUploadController(ImageStorageService imageStorageService, TagSuggestionService tagSuggestionService) {
        this.imageStorageService = imageStorageService;
        this.tagSuggestionService = tagSuggestionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            ImageUploadResponse uploaded = imageStorageService.store(file, tagSuggestionService);
            return new ResponseEntity<>(new ApiResponse<>("Image uploaded.", uploaded), HttpStatus.CREATED);
        } catch (IllegalArgumentException exception) {
            return new ResponseEntity<>(new ApiResponse<>(exception.getMessage(), null), HttpStatus.BAD_REQUEST);
        } catch (IOException exception) {
            return new ResponseEntity<>(new ApiResponse<>("Could not store image.", null), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            Path path = imageStorageService.resolveFile(filename);
            if (!Files.exists(path)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            UrlResource resource = new UrlResource(path.toUri());
            String contentType = Files.probeContentType(path);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .contentType(MediaType.parseMediaType(contentType == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType))
                    .body(resource);
        } catch (Exception exception) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
