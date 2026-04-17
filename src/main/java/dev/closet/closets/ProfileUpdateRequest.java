package dev.closet.closets;

import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(min = 1, max = 100, message = "Display name must be between 1 and 100 characters.")
        String displayName,
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters.")
        String password
) {
}
