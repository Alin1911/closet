package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchAlertServiceTest {
    @Mock
    private SearchAlertRepository searchAlertRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private SearchAlertService searchAlertService;

    @Test
    void listAlerts_shouldReturnNewMatchCountFromLastCheckedTimestamp() {
        ObjectId userId = new ObjectId();
        ObjectId alertId = new ObjectId();
        Instant now = Instant.now();

        SearchAlert alert = new SearchAlert(
                alertId,
                userId,
                "winter",
                "Classic",
                null,
                null,
                true,
                false,
                now.minusSeconds(500),
                now.minusSeconds(100),
                now.minusSeconds(200)
        );

        Closet newMatch = new Closet();
        newMatch.setId(new ObjectId());
        newMatch.setName("New Winter look");
        newMatch.setStyle("Classic");
        newMatch.setUpdatedAt(now.minusSeconds(10));

        when(searchAlertRepository.findByUserId(userId)).thenReturn(List.of(alert));
        when(mongoTemplate.count(any(Query.class), eq(Closet.class))).thenReturn(1L);
        when(mongoTemplate.findOne(any(Query.class), eq(Closet.class))).thenReturn(newMatch);

        List<SearchAlertResponse> responses = searchAlertService.listAlerts(userId);

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).newMatchCount());
        assertEquals(newMatch.getUpdatedAt(), responses.get(0).newestMatchingClosetUpdatedAt());
        verify(mongoTemplate).count(any(Query.class), eq(Closet.class));
    }

    @Test
    void deleteAlert_shouldReturnFalseWhenAlertBelongsToAnotherUser() {
        ObjectId userId = new ObjectId();
        ObjectId otherUserId = new ObjectId();
        ObjectId alertId = new ObjectId();
        SearchAlert alert = new SearchAlert();
        alert.setId(alertId);
        alert.setUserId(otherUserId);
        when(searchAlertRepository.findById(alertId)).thenReturn(Optional.of(alert));

        boolean deleted = searchAlertService.deleteAlert(userId, alertId);

        assertFalse(deleted);
    }

    @Test
    void acknowledgeAlert_shouldUpdateTimestampForOwner() {
        ObjectId userId = new ObjectId();
        ObjectId alertId = new ObjectId();
        SearchAlert alert = new SearchAlert();
        alert.setId(alertId);
        alert.setUserId(userId);
        alert.setCreatedAt(Instant.now().minusSeconds(300));
        alert.setUpdatedAt(Instant.now().minusSeconds(300));
        alert.setLastCheckedAt(Instant.now().minusSeconds(300));
        when(searchAlertRepository.findById(alertId)).thenReturn(Optional.of(alert));
        when(searchAlertRepository.save(any(SearchAlert.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mongoTemplate.count(any(Query.class), eq(Closet.class))).thenReturn(0L);
        when(mongoTemplate.findOne(any(Query.class), eq(Closet.class))).thenReturn(null);

        Optional<SearchAlertResponse> response = searchAlertService.acknowledgeAlert(userId, alertId);

        assertTrue(response.isPresent());
        assertTrue(response.get().lastCheckedAt().isAfter(Instant.now().minusSeconds(5)));
    }
}
