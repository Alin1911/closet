package dev.closet.closets;

import java.util.List;

public record ImageUploadResponse(
        String url,
        List<String> suggestedTags
) {
}
