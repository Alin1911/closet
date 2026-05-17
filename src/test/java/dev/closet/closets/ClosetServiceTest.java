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
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClosetServiceTest {

    @Mock
    private ClosetRepository closetRepository;

    @Mock
    private CoatRepository coatRepository;

    @Mock
    private TagSuggestionService tagSuggestionService;

    @InjectMocks
    private ClosetService closetService;

    @Test
    void allClosetsPage_shouldReturnRelevanceAndFacetCounts() {
        when(tagSuggestionService.suggest(anyList())).thenReturn(List.of("winter"));
        Closet winterClassic = closet(new ObjectId(), "Winter Classic", "Warm coat layers", "Classic", "Winter", "Blue", Instant.parse("2026-01-01T00:00:00Z"));
        Closet summerEdit = closet(new ObjectId(), "Summer Edit", "Lightweight staples", "Modern", "Summer", "White", Instant.parse("2026-02-01T00:00:00Z"));
        Closet winterMinimal = closet(new ObjectId(), "Minimal Wardrobe", "Wintar picks for city wear", "Minimal", "Winter", "Black", Instant.parse("2026-03-01T00:00:00Z"));

        when(closetRepository.findAll()).thenReturn(List.of(winterClassic, summerEdit, winterMinimal));

        ClosetPageResponse response = closetService.allClosetsPage(null, null, null, null, "newest", "wintar", 0, 12);

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
        when(tagSuggestionService.suggest(anyList())).thenReturn(List.of("style"));
        Closet closetB = closet(new ObjectId(), "Bravo Closet", "b", "Classic", "Winter", "Blue", Instant.parse("2026-01-01T00:00:00Z"));
        Closet closetA = closet(new ObjectId(), "Alpha Closet", "a", "Modern", "Summer", "White", Instant.parse("2026-02-01T00:00:00Z"));

        when(closetRepository.findAll()).thenReturn(List.of(closetB, closetA));

        ClosetPageResponse response = closetService.allClosetsPage(null, null, null, null, "name", null, 0, 12);

        assertEquals(2, response.items().size());
        assertEquals("Alpha Closet", response.items().get(0).getName());
        assertEquals("Bravo Closet", response.items().get(1).getName());
    }

    @Test
    void allClosetsPage_shouldUseCacheForIdenticalQueries() {
        when(tagSuggestionService.suggest(anyList())).thenReturn(List.of("modern"));
        Closet closet = closet(new ObjectId(), "Alpha Closet", "a", "Modern", "Summer", "White", Instant.parse("2026-02-01T00:00:00Z"));
        when(closetRepository.findAll()).thenReturn(List.of(closet));

        ClosetPageResponse first = closetService.allClosetsPage("Modern", "Summer", "White", null, "newest", "alpha", 0, 12);
        ClosetPageResponse second = closetService.allClosetsPage("Modern", "Summer", "White", null, "newest", "alpha", 0, 12);

        assertEquals(first.items().size(), second.items().size());
        verify(closetRepository, times(1)).findAll();
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
