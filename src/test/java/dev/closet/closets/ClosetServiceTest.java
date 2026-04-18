package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClosetServiceTest {

    @Mock
    private ClosetRepository closetRepository;

    @Mock
    private CoatRepository coatRepository;

    @InjectMocks
    private ClosetService closetService;

    @Test
    void allClosetsPage_shouldReturnRelevanceAndFacetCounts() {
        Closet winterClassic = closet(new ObjectId(), "Winter Classic", "Warm coat layers", "Classic", "Winter", "Blue", Instant.parse("2026-01-01T00:00:00Z"));
        Closet summerEdit = closet(new ObjectId(), "Summer Edit", "Lightweight staples", "Modern", "Summer", "White", Instant.parse("2026-02-01T00:00:00Z"));
        Closet winterMinimal = closet(new ObjectId(), "Minimal Wardrobe", "Wintar picks for city wear", "Minimal", "Winter", "Black", Instant.parse("2026-03-01T00:00:00Z"));

        when(closetRepository.findAll()).thenReturn(List.of(winterClassic, summerEdit, winterMinimal));

        ClosetPageResponse response = closetService.allClosetsPage(null, null, null, "newest", "wintar", 0, 12);

        assertEquals(2, response.totalCount());
        assertEquals(2, response.items().size());
        assertTrue(response.items().stream().anyMatch(item -> "Winter Classic".equals(item.getName())));
        assertTrue(response.items().stream().anyMatch(item -> "Minimal Wardrobe".equals(item.getName())));
        assertEquals(2L, response.seasonCounts().get("Winter"));
        assertTrue(response.colorCounts().containsKey("Blue"));
        assertTrue(response.colorCounts().containsKey("Black"));
    }

    @Test
    void allClosetsPage_shouldSortByNameWhenRequested() {
        Closet closetB = closet(new ObjectId(), "Bravo Closet", "b", "Classic", "Winter", "Blue", Instant.parse("2026-01-01T00:00:00Z"));
        Closet closetA = closet(new ObjectId(), "Alpha Closet", "a", "Modern", "Summer", "White", Instant.parse("2026-02-01T00:00:00Z"));

        when(closetRepository.findAll()).thenReturn(List.of(closetB, closetA));

        ClosetPageResponse response = closetService.allClosetsPage(null, null, null, "name", null, 0, 12);

        assertEquals(2, response.items().size());
        assertEquals("Alpha Closet", response.items().get(0).getName());
        assertEquals("Bravo Closet", response.items().get(1).getName());
    }

    private Closet closet(ObjectId id, String name, String description, String style, String season, String color, Instant createdAt) {
        Closet closet = new Closet();
        closet.setId(id);
        closet.setName(name);
        closet.setDescription(description);
        closet.setStyle(style);
        closet.setSeason(season);
        closet.setColor(color);
        closet.setCreatedAt(createdAt);
        return closet;
    }
}
