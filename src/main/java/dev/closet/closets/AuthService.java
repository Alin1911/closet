package dev.closet.closets;

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

    @Value("${auth.session.ttl-seconds:604800}")
    private long sessionTtlSeconds;

    public Optional<AuthResponse> register(AuthRegisterRequest request) {
        cleanupExpiredSessions();
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
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
        return Optional.of(issueSession(saved));
    }

    public Optional<AuthResponse> login(AuthLoginRequest request) {
        cleanupExpiredSessions();
        String email = request.email().trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(email)
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .map(this::issueSession);
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
            return Optional.empty();
        }

        UserProfile user = optionalUser.get();
        List<ObjectId> favorites = user.getFavoriteClosetIds() == null ? new ArrayList<>() : new ArrayList<>(user.getFavoriteClosetIds());
        if (favorites.stream().noneMatch(id -> id.equals(closetId))) {
            favorites.add(closetId);
        }
        user.setFavoriteClosetIds(favorites);
        user.setUpdatedAt(Instant.now());
        return Optional.of(toResponse(userRepository.save(user)));
    }

    public Optional<AuthResponse> removeFavorite(ObjectId userId, ObjectId closetId) {
        Optional<UserProfile> optionalUser = userRepository.findById(userId);
        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        UserProfile user = optionalUser.get();
        List<ObjectId> favorites = user.getFavoriteClosetIds() == null ? new ArrayList<>() : new ArrayList<>(user.getFavoriteClosetIds());
        favorites.removeIf(id -> id.equals(closetId));
        user.setFavoriteClosetIds(favorites);
        user.setUpdatedAt(Instant.now());
        return Optional.of(toResponse(userRepository.save(user)));
    }

    public Optional<AuthResponse> updateProfile(ObjectId userId, ProfileUpdateRequest request) {
        return userRepository.findById(userId).map(user -> {
            if (request.displayName() != null && !request.displayName().isBlank()) {
                user.setDisplayName(request.displayName().trim());
            }
            if (request.password() != null && !request.password().isBlank()) {
                user.setPasswordHash(passwordEncoder.encode(request.password()));
            }
            user.setUpdatedAt(Instant.now());
            return toResponse(userRepository.save(user));
        });
    }

    public Optional<UserProfile> resolveUserByToken(String rawToken) {
        cleanupExpiredSessions();
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        String hash = tokenService.hashToken(rawToken.trim());
        return userRepository.findBySessionTokenHashAndSessionExpiresAtAfter(hash, Instant.now());
    }

    private AuthResponse issueSession(UserProfile user) {
        String token = tokenService.generateRawToken();
        user.setSessionTokenHash(tokenService.hashToken(token));
        user.setSessionExpiresAt(Instant.now().plusSeconds(sessionTtlSeconds));
        user.setUpdatedAt(Instant.now());
        UserProfile saved = userRepository.save(user);
        return toResponse(saved, token);
    }

    private AuthResponse toResponse(UserProfile user) {
        return toResponse(user, null);
    }

    private AuthResponse toResponse(UserProfile user, String token) {
        List<String> favoriteIds = user.getFavoriteClosetIds() == null
                ? List.of()
                : user.getFavoriteClosetIds().stream().map(ObjectId::toHexString).toList();
        return new AuthResponse(
                user.getId().toHexString(),
                user.getEmail(),
                user.getDisplayName(),
                favoriteIds,
                token
        );
    }

    private void cleanupExpiredSessions() {
        userRepository.deleteAllBySessionExpiresAtBefore(Instant.now());
    }
}
