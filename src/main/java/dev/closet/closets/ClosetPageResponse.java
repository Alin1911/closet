package dev.closet.closets;

import java.util.List;
import java.util.Map;

public record ClosetPageResponse(
        List<Closet> items,
        long totalCount,
        int page,
        int size,
        int totalPages,
        Map<String, Long> styleCounts,
        Map<String, Long> seasonCounts,
        Map<String, Long> colorCounts
) {
}
