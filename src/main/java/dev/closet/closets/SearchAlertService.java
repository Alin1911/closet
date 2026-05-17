package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class SearchAlertService {
    @Autowired
    private SearchAlertRepository searchAlertRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<SearchAlertResponse> listAlerts(ObjectId userId) {
        return searchAlertRepository.findByUserId(userId).stream()
                .sorted((left, right) -> {
                    Instant leftUpdated = left.getUpdatedAt();
                    Instant rightUpdated = right.getUpdatedAt();
                    if (leftUpdated == null && rightUpdated == null) {
                        return 0;
                    }
                    if (leftUpdated == null) {
                        return 1;
                    }
                    if (rightUpdated == null) {
                        return -1;
                    }
                    return rightUpdated.compareTo(leftUpdated);
                })
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
        Query newMatchQuery = buildAlertQuery(alert, threshold);
        long newMatchCountLong = mongoTemplate.count(newMatchQuery, Closet.class);
        int newMatchCount = newMatchCountLong > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) newMatchCountLong;

        Query newestMatchQuery = buildAlertQuery(alert, threshold);
        newestMatchQuery.with(Sort.by(Sort.Direction.DESC, "updatedAt"));
        newestMatchQuery.limit(1);
        Closet newestMatch = mongoTemplate.findOne(newestMatchQuery, Closet.class);
        Instant newestMatchUpdatedAt = newestMatch == null ? null : (newestMatch.getUpdatedAt() == null ? newestMatch.getCreatedAt() : newestMatch.getUpdatedAt());

        return new SearchAlertResponse(
                alert.getId().toHexString(),
                alert.getQuery(),
                alert.getStyle(),
                alert.getSeason(),
                alert.getColor(),
                alert.isInAppEnabled(),
                alert.isEmailEnabled(),
                newMatchCount,
                newestMatchUpdatedAt,
                alert.getCreatedAt(),
                alert.getUpdatedAt(),
                alert.getLastCheckedAt()
        );
    }

    private Query buildAlertQuery(SearchAlert alert, Instant threshold) {
        Query query = new Query();
        List<Criteria> andConditions = new ArrayList<>();

        if (normalize(alert.getStyle()) != null) {
            andConditions.add(Criteria.where("style").regex("^" + Pattern.quote(alert.getStyle().trim()) + "$", "i"));
        }
        if (normalize(alert.getSeason()) != null) {
            andConditions.add(Criteria.where("season").regex("^" + Pattern.quote(alert.getSeason().trim()) + "$", "i"));
        }
        if (normalize(alert.getColor()) != null) {
            andConditions.add(Criteria.where("color").regex("^" + Pattern.quote(alert.getColor().trim()) + "$", "i"));
        }

        if (normalize(alert.getQuery()) != null) {
            String quoted = Pattern.quote(alert.getQuery().trim());
            andConditions.add(new Criteria().orOperator(
                    Criteria.where("name").regex(quoted, "i"),
                    Criteria.where("description").regex(quoted, "i"),
                    Criteria.where("style").regex(quoted, "i"),
                    Criteria.where("season").regex(quoted, "i"),
                    Criteria.where("color").regex(quoted, "i")
            ));
        }

        if (threshold != null) {
            andConditions.add(Criteria.where("updatedAt").gt(threshold));
        }

        if (!andConditions.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(andConditions.toArray(new Criteria[0])));
        }
        return query;
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
