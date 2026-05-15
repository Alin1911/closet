package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchAlertControllerTest {
    @Mock
    private SearchAlertService searchAlertService;

    @Mock
    private Authentication authentication;

    private SearchAlertController searchAlertController;

    @BeforeEach
    void setUp() {
        searchAlertController = new SearchAlertController();
        ReflectionTestUtils.setField(searchAlertController, "searchAlertService", searchAlertService);
    }

    @Test
    void create_shouldRejectEmptyAlertPayload() {
        String userId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId);

        ResponseEntity<ApiResponse<SearchAlertResponse>> response = searchAlertController.create(
                userId,
                new SearchAlertUpsertRequest("", "", "", "", true, false),
                authentication
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Provide at least one filter or search query.", response.getBody().message());
    }

    @Test
    void acknowledge_shouldReturnNotFoundWhenAlertMissing() {
        String userId = new ObjectId().toHexString();
        String alertId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId);
        when(searchAlertService.acknowledgeAlert(any(ObjectId.class), any(ObjectId.class))).thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<SearchAlertResponse>> response = searchAlertController.acknowledge(userId, alertId, authentication);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Search alert not found.", response.getBody().message());
    }
}
