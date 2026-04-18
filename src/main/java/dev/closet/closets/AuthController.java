package dev.closet.closets;

import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody AuthRegisterRequest request) {
        return authService.register(request)
                .map(user -> new ResponseEntity<>(new ApiResponse<>("Registration successful.", user), HttpStatus.CREATED))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Email is already registered.", null), HttpStatus.CONFLICT));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request)
                .map(user -> new ResponseEntity<>(new ApiResponse<>("Login successful.", user), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Invalid email or password.", null), HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody AuthRefreshRequest request) {
        return authService.refresh(request)
                .map(user -> new ResponseEntity<>(new ApiResponse<>("Session refreshed.", user), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Refresh token is invalid or expired.", null), HttpStatus.UNAUTHORIZED));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication, @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        if (authentication == null || !authentication.isAuthenticated() || authorization == null || !authorization.startsWith("Bearer ")) {
            return new ResponseEntity<>(new ApiResponse<>("Not authenticated.", null), HttpStatus.UNAUTHORIZED);
        }
        authService.revokeSession(new ObjectId(authentication.getName()));
        return new ResponseEntity<>(new ApiResponse<>("Logged out.", null), HttpStatus.OK);
    }

    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<?> getFavorites(@PathVariable String userId, Authentication authentication) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", List.of()), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", List.of()), HttpStatus.FORBIDDEN);
        }

        return authService.getFavorites(new ObjectId(userId))
                .<ResponseEntity<?>>map(favorites -> new ResponseEntity<>(favorites, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", List.of()), HttpStatus.NOT_FOUND));
    }

    @PutMapping("/users/{userId}/favorites/{closetId}")
    public ResponseEntity<ApiResponse<AuthResponse>> addFavorite(@PathVariable String userId, @PathVariable String closetId, Authentication authentication) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }

        return authService.addFavorite(new ObjectId(userId), new ObjectId(closetId))
                .map(response -> new ResponseEntity<>(new ApiResponse<>("Closet saved.", response), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", null), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/users/{userId}/favorites/{closetId}")
    public ResponseEntity<ApiResponse<AuthResponse>> removeFavorite(@PathVariable String userId, @PathVariable String closetId, Authentication authentication) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }

        return authService.removeFavorite(new ObjectId(userId), new ObjectId(closetId))
                .map(response -> new ResponseEntity<>(new ApiResponse<>("Closet removed from saved.", response), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", null), HttpStatus.NOT_FOUND));
    }

    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        if ((request.displayName() == null || request.displayName().isBlank()) &&
                (request.password() == null || request.password().isBlank())) {
            return new ResponseEntity<>(new ApiResponse<>("Provide display name or password.", null), HttpStatus.BAD_REQUEST);
        }

        return authService.updateProfile(new ObjectId(userId), request)
                .map(response -> new ResponseEntity<>(new ApiResponse<>("Profile updated.", response), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", null), HttpStatus.NOT_FOUND));
    }

    private boolean isAuthorizedUser(Authentication authentication, String userId) {
        return authentication != null && authentication.isAuthenticated() && userId.equals(authentication.getName());
    }
}
