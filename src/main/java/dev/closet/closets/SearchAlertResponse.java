package dev.closet.closets;

import java.time.Instant;

public record SearchAlertResponse(
        String id,
        String query,
        String style,
        String season,
        String color,
        boolean inAppEnabled,
        boolean emailEnabled,
        int newMatchCount,
        Instant newestMatchingClosetUpdatedAt,
        Instant createdAt,
        Instant updatedAt,
        Instant lastCheckedAt
) {
}
