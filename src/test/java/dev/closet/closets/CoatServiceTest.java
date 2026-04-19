package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CoatServiceTest {

    @Mock
    private CoatRepository coatRepository;

    @Mock
    private ClosetRepository closetRepository;

    @InjectMocks
    private CoatService coatService;

    @Test
    void createCoat_shouldReturnEmptyWhenClosetDoesNotExist() {
        ObjectId closetId = new ObjectId();
        when(closetRepository.findById(closetId)).thenReturn(Optional.empty());

        Optional<Coat> response = coatService.createCoat(closetId, new CoatCreateRequest(null, "Note", "Description", List.of()));

        assertTrue(response.isEmpty());
        verify(coatRepository, never()).insert(any(Coat.class));
    }

    @Test
    void createCoat_shouldPersistAndAttachToCloset() {
        ObjectId closetId = new ObjectId();
        ObjectId coatId = new ObjectId();
        Closet closet = new Closet();
        closet.setId(closetId);
        closet.setCoatsIds(new ArrayList<>());
        when(closetRepository.findById(closetId)).thenReturn(Optional.of(closet));
        when(coatRepository.insert(any(Coat.class))).thenAnswer(invocation -> {
            Coat coat = invocation.getArgument(0);
            coat.setId(coatId);
            return coat;
        });

        Optional<Coat> response = coatService.createCoat(closetId, new CoatCreateRequest(null, "Note", "Description", List.of("image.png")));

        assertTrue(response.isPresent());
        assertEquals(coatId, response.get().getId());
        assertEquals(1, closet.getCoatsIds().size());
        assertEquals(coatId, closet.getCoatsIds().get(0).getId());
        verify(closetRepository).save(closet);
    }

    @Test
    void updateCoat_shouldReturnEmptyWhenCoatNotLinkedToCloset() {
        ObjectId closetId = new ObjectId();
        ObjectId linkedCoatId = new ObjectId();
        ObjectId requestedCoatId = new ObjectId();

        Closet closet = new Closet();
        closet.setId(closetId);
        Coat linked = new Coat();
        linked.setId(linkedCoatId);
        closet.setCoatsIds(List.of(linked));

        Coat existing = new Coat();
        existing.setId(requestedCoatId);

        when(closetRepository.findById(closetId)).thenReturn(Optional.of(closet));
        when(coatRepository.findById(requestedCoatId)).thenReturn(Optional.of(existing));

        Optional<Coat> response = coatService.updateCoat(closetId, requestedCoatId, new CoatUpdateRequest("Updated", "Updated desc", List.of()));

        assertTrue(response.isEmpty());
        verify(coatRepository, never()).save(any(Coat.class));
    }

    @Test
    void deleteCoat_shouldRemoveCoatFromClosetAndRepository() {
        ObjectId closetId = new ObjectId();
        ObjectId coatId = new ObjectId();

        Coat coat = new Coat();
        coat.setId(coatId);
        Closet closet = new Closet();
        closet.setId(closetId);
        closet.setCoatsIds(new ArrayList<>(List.of(coat)));
        when(closetRepository.findById(closetId)).thenReturn(Optional.of(closet));

        boolean deleted = coatService.deleteCoat(closetId, coatId);

        assertTrue(deleted);
        assertFalse(closet.getCoatsIds().stream().anyMatch(existing -> coatId.equals(existing.getId())));
        verify(coatRepository).deleteById(coatId);
        verify(closetRepository).save(closet);
    }
}
