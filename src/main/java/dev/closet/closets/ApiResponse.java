package dev.closet.closets;

public record ApiResponse<T>(
        String message,
        T data
) {
}
