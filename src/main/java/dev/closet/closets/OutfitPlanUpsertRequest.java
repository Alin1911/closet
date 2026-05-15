package dev.closet.closets;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record OutfitPlanUpsertRequest(
        @NotNull(message = "Plan date is required.")
        LocalDate planDate,
        @NotBlank(message = "Title is required.")
        @Size(max = 120, message = "Title must be at most 120 characters.")
        String title,
        @Size(max = 1000, message = "Notes must be at most 1000 characters.")
        String notes,
        List<String> closetIds,
        List<String> coatIds
) {
}
