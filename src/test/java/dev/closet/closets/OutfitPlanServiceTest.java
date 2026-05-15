package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OutfitPlanServiceTest {
    @Mock
    private OutfitPlanRepository outfitPlanRepository;

    @Mock
    private ClosetRepository closetRepository;

    @Mock
    private CoatRepository coatRepository;

    @InjectMocks
    private OutfitPlanService outfitPlanService;

    @Test
    void createPlan_shouldRejectWhenNoReferencesProvided() {
        OutfitPlanUpsertRequest request = new OutfitPlanUpsertRequest(LocalDate.now(), "Plan", "Notes", List.of(), List.of());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> outfitPlanService.createPlan(new ObjectId(), request));

        assertTrue(exception.getMessage().contains("Select at least one closet or clothing item"));
        verify(outfitPlanRepository, never()).insert(any(OutfitPlan.class));
    }

    @Test
    void createPlan_shouldInsertWhenReferencesExist() {
        ObjectId userId = new ObjectId();
        ObjectId closetId = new ObjectId();
        ObjectId coatId = new ObjectId();
        OutfitPlanUpsertRequest request = new OutfitPlanUpsertRequest(
                LocalDate.of(2026, 5, 20),
                "Weekend fit",
                "Layered look",
                List.of(closetId.toHexString()),
                List.of(coatId.toHexString())
        );
        when(closetRepository.findAllById(any(Iterable.class))).thenReturn(List.of(new Closet()));
        when(coatRepository.findAllById(any(Iterable.class))).thenReturn(List.of(new Coat()));
        when(outfitPlanRepository.insert(any(OutfitPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OutfitPlan created = outfitPlanService.createPlan(userId, request);

        assertEquals(userId, created.getUserId());
        assertEquals("Weekend fit", created.getTitle());
        assertEquals(1, created.getClosetIds().size());
        assertEquals(1, created.getCoatIds().size());
    }

    @Test
    void updatePlan_shouldReturnEmptyWhenPlanNotFound() {
        ObjectId userId = new ObjectId();
        ObjectId planId = new ObjectId();
        when(outfitPlanRepository.findByIdAndUserId(planId, userId)).thenReturn(Optional.empty());

        Optional<OutfitPlan> response = outfitPlanService.updatePlan(
                userId,
                planId,
                new OutfitPlanUpsertRequest(LocalDate.now(), "Workday", null, List.of(new ObjectId().toHexString()), List.of())
        );

        assertTrue(response.isEmpty());
        verify(outfitPlanRepository, never()).save(any(OutfitPlan.class));
    }
}
