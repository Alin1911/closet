package dev.closet.closets;

import java.util.List;

public record ClosetPageResponse(
        List<Closet> items,
        long totalCount,
        int page,
        int size,
        int totalPages
) {
}
