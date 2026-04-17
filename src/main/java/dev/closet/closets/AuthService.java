package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Optional<AuthResponse> register(AuthRegisterRequest request) {
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
        return Optional.of(toResponse(saved));
    }

    public Optional<AuthResponse> login(AuthLoginRequest request) {
        String email = request.email().trim().toLowerCase();
        return userRepository.findByEmailIgnoreCase(email)
                .filter(user -> passwordEncoder.matches(request.password(), user.getPasswordHash()))
                .map(this::toResponse);
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

    private AuthResponse toResponse(UserProfile user) {
        List<String> favoriteIds = user.getFavoriteClosetIds() == null
                ? List.of()
                : user.getFavoriteClosetIds().stream().map(ObjectId::toHexString).toList();
        return new AuthResponse(
                user.getId().toHexString(),
                user.getEmail(),
                user.getDisplayName(),
                favoriteIds
        );
    }
}
