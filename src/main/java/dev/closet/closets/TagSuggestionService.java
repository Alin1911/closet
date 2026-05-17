package dev.closet.closets;

import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagSuggestionService {
    private static final List<String> STYLE_KEYWORDS = List.of("casual", "formal", "streetwear", "sport", "minimal", "boho", "vintage");
    private static final List<String> SEASON_KEYWORDS = List.of("spring", "summer", "autumn", "fall", "winter", "all-season");
    private static final List<String> COLOR_KEYWORDS = List.of("black", "white", "blue", "red", "green", "yellow", "pink", "brown", "gray", "grey", "beige", "orange", "purple");

    public List<String> suggest(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }
        Set<String> tags = new LinkedHashSet<>();
        for (String rawValue : values) {
            String value = normalize(rawValue);
            if (value == null) {
                continue;
            }
            addKnownTags(tags, value, STYLE_KEYWORDS);
            addKnownTags(tags, value, SEASON_KEYWORDS);
            addKnownTags(tags, value, COLOR_KEYWORDS);
        }
        return tags.stream().limit(8).collect(Collectors.toList());
    }

    public List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(this::normalize)
                .filter(value -> value != null && value.length() <= 40)
                .distinct()
                .limit(12)
                .collect(Collectors.toList());
    }

    private void addKnownTags(Set<String> tags, String value, List<String> keywordSet) {
        for (String keyword : keywordSet) {
            if (value.contains(keyword)) {
                tags.add(keyword);
            }
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }
}
