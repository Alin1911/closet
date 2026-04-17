package dev.closet.closets;

import java.util.List;

public record AuthResponse(
        String userId,
        String email,
        String displayName,
        List<String> favoriteClosetIds
) {
}
