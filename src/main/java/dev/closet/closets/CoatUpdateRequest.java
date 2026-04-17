package dev.closet.closets;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CoatUpdateRequest(
        @NotBlank(message = "Name is required.")
        @Size(max = 120, message = "Name must be at most 120 characters.")
        String name,
        @NotBlank(message = "Description is required.")
        @Size(max = 1000, message = "Description must be at most 1000 characters.")
        String description,
        List<String> images
) {
}
