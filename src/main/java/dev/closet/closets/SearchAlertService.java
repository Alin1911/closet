package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class SearchAlertService {
    @Autowired
    private SearchAlertRepository searchAlertRepository;

    @Autowired
    private ClosetRepository closetRepository;

    public List<SearchAlertResponse> listAlerts(ObjectId userId) {
        return searchAlertRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(SearchAlert::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toResponseWithMatches)
                .toList();
    }

    public SearchAlertResponse createAlert(ObjectId userId, SearchAlertUpsertRequest request) {
        Instant now = Instant.now();
        SearchAlert alert = new SearchAlert();
        alert.setUserId(userId);
        alert.setQuery(normalizeRaw(request.query()));
        alert.setStyle(normalizeRaw(request.style()));
        alert.setSeason(normalizeRaw(request.season()));
        alert.setColor(normalizeRaw(request.color()));
        alert.setInAppEnabled(request.inAppEnabled() == null || request.inAppEnabled());
        alert.setEmailEnabled(request.emailEnabled() != null && request.emailEnabled());
        alert.setCreatedAt(now);
        alert.setUpdatedAt(now);
        alert.setLastCheckedAt(now);
        return toResponseWithMatches(searchAlertRepository.insert(alert));
    }

    public Optional<SearchAlertResponse> updateAlert(ObjectId userId, ObjectId alertId, SearchAlertUpsertRequest request) {
        return searchAlertRepository.findById(alertId)
                .filter(alert -> alert.getUserId().equals(userId))
                .map(alert -> {
                    alert.setQuery(normalizeRaw(request.query()));
                    alert.setStyle(normalizeRaw(request.style()));
                    alert.setSeason(normalizeRaw(request.season()));
                    alert.setColor(normalizeRaw(request.color()));
                    alert.setInAppEnabled(request.inAppEnabled() == null || request.inAppEnabled());
                    alert.setEmailEnabled(request.emailEnabled() != null && request.emailEnabled());
                    alert.setUpdatedAt(Instant.now());
                    return toResponseWithMatches(searchAlertRepository.save(alert));
                });
    }

    public Optional<SearchAlertResponse> acknowledgeAlert(ObjectId userId, ObjectId alertId) {
        return searchAlertRepository.findById(alertId)
                .filter(alert -> alert.getUserId().equals(userId))
                .map(alert -> {
                    Instant now = Instant.now();
                    alert.setLastCheckedAt(now);
                    alert.setUpdatedAt(now);
                    return toResponseWithMatches(searchAlertRepository.save(alert));
                });
    }

    public boolean deleteAlert(ObjectId userId, ObjectId alertId) {
        Optional<SearchAlert> alert = searchAlertRepository.findById(alertId)
                .filter(item -> item.getUserId().equals(userId));
        if (alert.isEmpty()) {
            return false;
        }
        searchAlertRepository.deleteById(alertId);
        return true;
    }

    private SearchAlertResponse toResponseWithMatches(SearchAlert alert) {
        Instant threshold = alert.getLastCheckedAt() == null ? alert.getCreatedAt() : alert.getLastCheckedAt();
        List<Closet> matchingClosets = closetRepository.findAll().stream()
                .filter(closet -> matchesAlert(closet, alert))
                .toList();
        List<Closet> newMatches = matchingClosets.stream()
                .filter(closet -> {
                    if (threshold == null) {
                        return true;
                    }
                    Instant updatedAt = closet.getUpdatedAt() == null ? closet.getCreatedAt() : closet.getUpdatedAt();
                    return updatedAt != null && updatedAt.isAfter(threshold);
                })
                .toList();
        Instant newestMatchUpdatedAt = newMatches.stream()
                .map(closet -> closet.getUpdatedAt() == null ? closet.getCreatedAt() : closet.getUpdatedAt())
                .filter(instant -> instant != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return new SearchAlertResponse(
                alert.getId().toHexString(),
                alert.getQuery(),
                alert.getStyle(),
                alert.getSeason(),
                alert.getColor(),
                alert.isInAppEnabled(),
                alert.isEmailEnabled(),
                newMatches.size(),
                newestMatchUpdatedAt,
                alert.getCreatedAt(),
                alert.getUpdatedAt(),
                alert.getLastCheckedAt()
        );
    }

    private boolean matchesAlert(Closet closet, SearchAlert alert) {
        String styleFilter = normalize(alert.getStyle());
        String seasonFilter = normalize(alert.getSeason());
        String colorFilter = normalize(alert.getColor());
        String queryFilter = normalize(alert.getQuery());

        if (styleFilter != null && !styleFilter.equals(normalize(closet.getStyle()))) {
            return false;
        }
        if (seasonFilter != null && !seasonFilter.equals(normalize(closet.getSeason()))) {
            return false;
        }
        if (colorFilter != null && !colorFilter.equals(normalize(closet.getColor()))) {
            return false;
        }
        if (queryFilter == null) {
            return true;
        }
        return containsNormalized(closet.getName(), queryFilter)
                || containsNormalized(closet.getDescription(), queryFilter)
                || containsNormalized(closet.getStyle(), queryFilter)
                || containsNormalized(closet.getSeason(), queryFilter)
                || containsNormalized(closet.getColor(), queryFilter);
    }

    private boolean containsNormalized(String source, String query) {
        String normalizedSource = normalize(source);
        return normalizedSource != null && normalizedSource.contains(query);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRaw(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
