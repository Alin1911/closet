package dev.closet.closets;

import java.util.List;

public record CoatCreateRequest(
        String closetId,
        String name,
        String description,
        List<String> images
) {
}
