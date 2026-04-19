package dev.closet.closets;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClosetRepository closetRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    @Value("${auth.access-token.ttl-seconds:900}")
    private long accessTokenTtlSeconds;

    @Value("${auth.refresh-token.ttl-seconds:604800}")
    private long refreshTokenTtlSeconds;

    public Optional<AuthResponse> register(AuthRegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            recordAuthEvent("register", "rejected_duplicate_email");
            return Optional.empty();
        }

        Instant now = Instant.now();
        UserProfile user = new UserProfile();
        user.setEmail(email);
        user.setDisplayName(request.displayName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFavoriteClosetIds(new ArrayList<>());
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        UserProfile saved = userRepository.insert(user);
        recordAuthEvent("register", "success");
        return Optional.of(issueSession(saved));
    }

    public Optional<AuthResponse> login(AuthLoginRequest request) {
        String email = request.email().trim().toLowerCase();
        Optional<UserProfile> user = userRepository.findByEmailIgnoreCase(email);
        if (user.isEmpty()) {
            recordAuthEvent("login", "unknown_email");
            return Optional.empty();
        }
        if (!passwordEncoder.matches(request.password(), user.get().getPasswordHash())) {
            recordAuthEvent("login", "invalid_password");
            return Optional.empty();
        }
        recordAuthEvent("login", "success");
        return Optional.of(issueSession(user.get()));
    }

    public Optional<AuthResponse> refresh(AuthRefreshRequest request) {
        String hash = tokenService.hashToken(request.refreshToken().trim());
        Optional<AuthResponse> response = userRepository.findByRefreshTokenHashAndRefreshTokenExpiresAtAfter(hash, Instant.now())
                .map(this::issueSession);
        recordAuthEvent("refresh", response.isPresent() ? "success" : "rejected");
        return response;
    }

    public void revokeSession(ObjectId userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setAccessTokenHash(null);
            user.setAccessTokenExpiresAt(null);
            user.setRefreshTokenHash(null);
            user.setRefreshTokenExpiresAt(null);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
            recordAuthEvent("logout", "success");
        });
    }

    public Optional<List<Closet>> getFavorites(ObjectId userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    List<ObjectId> ids = user.getFavoriteClosetIds() == null ? List.of() : user.getFavoriteClosetIds();
                    if (ids.isEmpty()) {
                        return List.<Closet>of();
                    }
                    return closetRepository.findAllById(ids);
                });
    }

    public Optional<AuthResponse> addFavorite(ObjectId userId, ObjectId closetId) {
        Optional<UserProfile> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            recordAuthEvent("favorites_add", "user_not_found");
            return Optional.empty();
        }

        UserProfile user = optionalUser.get();
        List<ObjectId> favorites = user.getFavoriteClosetIds() == null ? new ArrayList<>() : new ArrayList<>(user.getFavoriteClosetIds());
        if (favorites.stream().noneMatch(id -> id.equals(closetId))) {
            favorites.add(closetId);
        }
        user.setFavoriteClosetIds(favorites);
        user.setUpdatedAt(Instant.now());
        recordAuthEvent("favorites_add", "success");
        return Optional.of(toResponse(userRepository.save(user)));
    }

    public Optional<AuthResponse> removeFavorite(ObjectId userId, ObjectId closetId) {
        Optional<UserProfile> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            recordAuthEvent("favorites_remove", "user_not_found");
            return Optional.empty();
        }

        UserProfile user = optionalUser.get();
        List<ObjectId> favorites = user.getFavoriteClosetIds() == null ? new ArrayList<>() : new ArrayList<>(user.getFavoriteClosetIds());
        favorites.removeIf(id -> id.equals(closetId));
        user.setFavoriteClosetIds(favorites);
        user.setUpdatedAt(Instant.now());
        recordAuthEvent("favorites_remove", "success");
        return Optional.of(toResponse(userRepository.save(user)));
    }

    public Optional<AuthResponse> updateProfile(ObjectId userId, ProfileUpdateRequest request) {
        Optional<AuthResponse> response = userRepository.findById(userId).map(user -> {
            if (request.displayName() != null && !request.displayName().isBlank()) {
                user.setDisplayName(request.displayName().trim());
            }
            if (request.password() != null && !request.password().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(request.password()));
                user.setAccessTokenHash(null);
                user.setAccessTokenExpiresAt(null);
                user.setRefreshTokenHash(null);
                user.setRefreshTokenExpiresAt(null);
            }
            user.setUpdatedAt(Instant.now());
            return toResponse(userRepository.save(user));
        });
        recordAuthEvent("profile_update", response.isPresent() ? "success" : "user_not_found");
        return response;
    }

    public Optional<UserProfile> resolveUserByToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        String hash = tokenService.hashToken(rawToken.trim());
        return userRepository.findByAccessTokenHashAndAccessTokenExpiresAtAfter(hash, Instant.now());
    }

    private AuthResponse issueSession(UserProfile user) {
        String token = tokenService.generateRawToken();
        String refreshToken = tokenService.generateRawToken();
        Instant now = Instant.now();
        user.setAccessTokenHash(tokenService.hashToken(token));
        user.setAccessTokenExpiresAt(now.plusSeconds(accessTokenTtlSeconds));
        user.setRefreshTokenHash(tokenService.hashToken(refreshToken));
        user.setRefreshTokenExpiresAt(now.plusSeconds(refreshTokenTtlSeconds));
        user.setUpdatedAt(Instant.now());
        UserProfile saved = userRepository.save(user);
        return toResponse(saved, token, refreshToken);
    }

    private AuthResponse toResponse(UserProfile user) {
        return toResponse(user, null, null);
    }

    private AuthResponse toResponse(UserProfile user, String token, String refreshToken) {
        List<String> favoriteIds = user.getFavoriteClosetIds() == null
                ? List.of()
                : user.getFavoriteClosetIds().stream().map(ObjectId::toHexString).toList();
        return new AuthResponse(
                user.getId().toHexString(),
                user.getEmail(),
                user.getDisplayName(),
                favoriteIds,
                token,
                refreshToken
        );
    }

    private void recordAuthEvent(String action, String outcome) {
        if (meterRegistry == null) {
            return;
        }
        meterRegistry.counter(
                        "closet.auth.events",
                        Tags.of("action", action, "outcome", outcome)
                )
                .increment();
    }
}
