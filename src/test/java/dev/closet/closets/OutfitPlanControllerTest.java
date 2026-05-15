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

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutfitPlanControllerTest {
    @Mock
    private OutfitPlanService outfitPlanService;

    @Mock
    private Authentication authentication;

    private OutfitPlanController outfitPlanController;

    @BeforeEach
    void setUp() {
        outfitPlanController = new OutfitPlanController();
        ReflectionTestUtils.setField(outfitPlanController, "outfitPlanService", outfitPlanService);
    }

    @Test
    void createPlan_shouldReturnForbiddenForDifferentUser() {
        String requestedUserId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(new ObjectId().toHexString());

        ResponseEntity<ApiResponse<OutfitPlan>> response = outfitPlanController.createPlan(
                requestedUserId,
                new OutfitPlanUpsertRequest(LocalDate.now(), "Look", null, null, null),
                authentication
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(outfitPlanService, never()).createPlan(any(ObjectId.class), any(OutfitPlanUpsertRequest.class));
    }

    @Test
    void updatePlan_shouldReturnNotFoundWhenMissing() {
        String userId = new ObjectId().toHexString();
        String planId = new ObjectId().toHexString();
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(userId);
        when(outfitPlanService.updatePlan(any(ObjectId.class), any(ObjectId.class), any(OutfitPlanUpsertRequest.class)))
                .thenReturn(Optional.empty());

        ResponseEntity<ApiResponse<OutfitPlan>> response = outfitPlanController.updatePlan(
                userId,
                planId,
                new OutfitPlanUpsertRequest(LocalDate.now(), "Work", null, null, null),
                authentication
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Outfit plan not found.", response.getBody().message());
    }
}
