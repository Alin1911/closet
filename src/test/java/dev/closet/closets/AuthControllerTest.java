package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private Authentication authentication;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController();
        ReflectionTestUtils.setField(authController, "authService", authService);
    }

    @Test
    void logout_shouldReturnUnauthorizedWithoutBearerHeader() {
        when(authentication.isAuthenticated()).thenReturn(true);

        ResponseEntity<ApiResponse<Void>> response = authController.logout(authentication, null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Not authenticated.", response.getBody().message());
        verify(authService, never()).revokeSession(any(ObjectId.class));
    }

    @Test
    void updateProfile_shouldRejectEmptyPayload() {
        String userId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId);

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.updateProfile(
                userId,
                new ProfileUpdateRequest(" ", " "),
                authentication
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Provide display name or password.", response.getBody().message());
    }

    @Test
    void addFavorite_shouldReturnForbiddenForDifferentAuthenticatedUser() {
        String requestedUserId = new ObjectId().toHexString();
        String authenticatedUserId = new ObjectId().toHexString();
        String closetId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(authenticatedUserId);

        ResponseEntity<ApiResponse<AuthResponse>> response =
                authController.addFavorite(requestedUserId, closetId, authentication);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().message().contains("Forbidden"));
        verify(authService, never()).addFavorite(any(ObjectId.class), any(ObjectId.class));
    }

    @Test
    void refresh_shouldReturnUnauthorizedWhenTokenIsInvalid() {
        when(authService.refresh(new AuthRefreshRequest("invalid"))).thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.refresh(new AuthRefreshRequest("invalid"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Refresh token is invalid or expired.", response.getBody().message());
    }
}
