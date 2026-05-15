package dev.closet.closets;

import jakarta.validation.constraints.Size;

public record SearchAlertUpsertRequest(
        @Size(max = 120, message = "Query must be 120 characters or fewer.")
        String query,
        @Size(max = 50, message = "Style must be 50 characters or fewer.")
        String style,
        @Size(max = 50, message = "Season must be 50 characters or fewer.")
        String season,
        @Size(max = 50, message = "Color must be 50 characters or fewer.")
        String color,
        Boolean inAppEnabled,
        Boolean emailEnabled
) {
}
