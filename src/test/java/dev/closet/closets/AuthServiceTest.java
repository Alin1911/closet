package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClosetRepository closetRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenTtlSeconds", 900L);
        ReflectionTestUtils.setField(authService, "refreshTokenTtlSeconds", 604800L);
    }

    @Test
    void register_shouldReturnEmptyWhenEmailAlreadyExists() {
        when(userRepository.findByEmailIgnoreCase("user@closet.dev")).thenReturn(Optional.of(new UserProfile()));

        Optional<AuthResponse> response = authService.register(new AuthRegisterRequest("user@closet.dev", "password123", "User"));

        assertTrue(response.isEmpty());
        verify(userRepository, never()).insert(any(UserProfile.class));
    }

    @Test
    void refresh_shouldRotateSessionTokens() {
        ObjectId userId = new ObjectId();
        UserProfile user = baseUser(userId);
        when(tokenService.hashToken("refresh-raw")).thenReturn("refresh-hash");
        when(userRepository.findByRefreshTokenHashAndRefreshTokenExpiresAtAfter(any(), any())).thenReturn(Optional.of(user));
        when(tokenService.generateRawToken()).thenReturn("new-access-token", "new-refresh-token");
        when(tokenService.hashToken("new-access-token")).thenReturn("new-access-hash");
        when(tokenService.hashToken("new-refresh-token")).thenReturn("new-refresh-hash");
        when(userRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<AuthResponse> response = authService.refresh(new AuthRefreshRequest("refresh-raw"));

        assertTrue(response.isPresent());
        assertEquals("new-access-token", response.get().token());
        assertEquals("new-refresh-token", response.get().refreshToken());
        assertEquals(userId.toHexString(), response.get().userId());
        verify(userRepository).findByRefreshTokenHashAndRefreshTokenExpiresAtAfter(eq("refresh-hash"), any(Instant.class));
    }

    @Test
    void updateProfile_withPassword_shouldClearExistingSessionHashes() {
        ObjectId userId = new ObjectId();
        UserProfile user = baseUser(userId);
        user.setAccessTokenHash("old-access");
        user.setRefreshTokenHash("old-refresh");
        user.setAccessTokenExpiresAt(Instant.now().plusSeconds(100));
        user.setRefreshTokenExpiresAt(Instant.now().plusSeconds(200));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newpass123")).thenReturn("encoded");
        when(userRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<AuthResponse> response = authService.updateProfile(userId, new ProfileUpdateRequest("New Name", "newpass123"));

        assertTrue(response.isPresent());
        assertEquals("New Name", response.get().displayName());
        assertNull(user.getAccessTokenHash());
        assertNull(user.getRefreshTokenHash());
        assertNull(user.getAccessTokenExpiresAt());
        assertNull(user.getRefreshTokenExpiresAt());
        assertEquals("encoded", user.getPasswordHash());
    }

    @Test
    void addFavorite_shouldNotDuplicateClosetIds() {
        ObjectId userId = new ObjectId();
        ObjectId closetId = new ObjectId();
        UserProfile user = baseUser(userId);
        user.setFavoriteClosetIds(new ArrayList<>());
        user.getFavoriteClosetIds().add(closetId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<AuthResponse> response = authService.addFavorite(userId, closetId);

        assertTrue(response.isPresent());
        assertNotNull(response.get().favoriteClosetIds());
        assertEquals(1, response.get().favoriteClosetIds().size());
    }

    private UserProfile baseUser(ObjectId id) {
        UserProfile user = new UserProfile();
        user.setId(id);
        user.setEmail("user@closet.dev");
        user.setDisplayName("Closet User");
        user.setPasswordHash("hash");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user.setFavoriteClosetIds(new ArrayList<>());
        return user;
    }
}
