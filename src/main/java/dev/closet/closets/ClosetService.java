package dev.closet.closets;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ClosetService {
    @Autowired
    private ClosetRepository closetRepository;

    @Autowired
    private CoatRepository coatRepository;

    public List<Closet> allClosets(String style, String season, String color, String sort){
        return filterAndSort(style, season, color, sort, null);
    }

    public ClosetPageResponse allClosetsPage(String style, String season, String color, String sort, String query, int page, int size) {
        List<Closet> filtered = filterAndSort(style, season, color, sort, query);
        Map<String, Long> styleCounts = buildFacetCounts(filtered, Closet::getStyle);
        Map<String, Long> seasonCounts = buildFacetCounts(filtered, Closet::getSeason);
        Map<String, Long> colorCounts = buildFacetCounts(filtered, Closet::getColor);
        if (size <= 0) {
            size = 12;
        }
        if (page < 0) {
            page = 0;
        }
        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        int totalPages = filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / size);
        return new ClosetPageResponse(filtered.subList(start, end), filtered.size(), page, size, totalPages, styleCounts, seasonCounts, colorCounts);
    }

    private List<Closet> filterAndSort(String style, String season, String color, String sort, String query) {
        List<Closet> closets = closetRepository.findAll();
        String styleFilter = normalize(style);
        String seasonFilter = normalize(season);
        String colorFilter = normalize(color);
        String normalizedQuery = normalize(query);
        Map<ObjectId, Integer> relevanceScores = new LinkedHashMap<>();

        List<Closet> filtered = closets.stream()
                .filter(closet -> styleFilter == null || styleFilter.equals(normalize(closet.getStyle())))
                .filter(closet -> seasonFilter == null || seasonFilter.equals(normalize(closet.getSeason())))
                .filter(closet -> colorFilter == null || colorFilter.equals(normalize(closet.getColor())))
                .filter(closet -> {
                    if (normalizedQuery == null) {
                        return true;
                    }
                    int score = relevanceScore(closet, normalizedQuery);
                    if (score > 0) {
                        relevanceScores.put(closet.getId(), score);
                        return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());

        Comparator<Closet> comparator = Comparator.comparing(
                c -> c.getCreatedAt() == null ? Instant.EPOCH : c.getCreatedAt(),
                Comparator.reverseOrder()
        );
        if ("name".equalsIgnoreCase(sort)) {
            comparator = Comparator.comparing(c -> c.getName() == null ? "" : c.getName().toLowerCase());
        } else if (normalizedQuery != null) {
            comparator = Comparator
                    .comparingInt((Closet c) -> relevanceScores.getOrDefault(c.getId(), 0))
                    .reversed()
                    .thenComparing(c -> c.getCreatedAt() == null ? Instant.EPOCH : c.getCreatedAt(), Comparator.reverseOrder());
        }

        return filtered.stream().sorted(comparator).toList();
    }

    public Optional<Closet> closetById(ObjectId id){
        return closetRepository.findById(id);
    }

    public Closet createCloset(ClosetUpsertRequest payload) {
        Instant now = Instant.now();
        Closet closet = new Closet();
        closet.setName(payload.name().trim());
        closet.setDescription(payload.description().trim());
        closet.setPoster(payload.poster());
        closet.setTrailerLink(payload.trailerLink());
        closet.setImages(payload.images() == null ? List.of() : payload.images());
        closet.setStyle(payload.style());
        closet.setSeason(payload.season());
        closet.setColor(payload.color());
        closet.setCreatedAt(now);
        closet.setUpdatedAt(now);
        closet.setCoatsIds(new ArrayList<>());
        return closetRepository.insert(closet);
    }

    public Optional<Closet> updateCloset(ObjectId id, ClosetUpsertRequest payload) {
        Optional<Closet> optionalCloset = closetRepository.findById(id);
        if (optionalCloset.isEmpty()) {
            return Optional.empty();
        }

        Closet closet = optionalCloset.get();
        closet.setName(payload.name().trim());
        closet.setDescription(payload.description().trim());
        closet.setPoster(payload.poster());
        closet.setTrailerLink(payload.trailerLink());
        closet.setImages(payload.images() == null ? List.of() : payload.images());
        closet.setStyle(payload.style());
        closet.setSeason(payload.season());
        closet.setColor(payload.color());
        closet.setUpdatedAt(Instant.now());
        return Optional.of(closetRepository.save(closet));
    }

    public boolean deleteCloset(ObjectId id) {
        Optional<Closet> optionalCloset = closetRepository.findById(id);
        if (optionalCloset.isEmpty()) {
            return false;
        }

        Closet closet = optionalCloset.get();
        if (closet.getCoatsIds() != null && !closet.getCoatsIds().isEmpty()) {
            coatRepository.deleteAll(closet.getCoatsIds());
        }
        closetRepository.deleteById(id);
        return true;
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private int relevanceScore(Closet closet, String query) {
        String name = normalize(closet.getName());
        String description = normalize(closet.getDescription());
        String style = normalize(closet.getStyle());
        String season = normalize(closet.getSeason());
        String color = normalize(closet.getColor());

        int score = 0;
        if (name != null && name.equals(query)) {
            score += 120;
        }
        if (name != null && name.contains(query)) {
            score += 80;
        }
        if (description != null && description.contains(query)) {
            score += 25;
        }
        if (query.equals(style) || query.equals(season) || query.equals(color)) {
            score += 40;
        }

        if (name != null) {
            for (String term : query.split("\\s+")) {
                if (term.isBlank()) {
                    continue;
                }
                for (String word : name.split("\\s+")) {
                    if (word.equals(term)) {
                        score += 18;
                    } else if (levenshteinDistance(word, term) <= 1) {
                        score += 10;
                    } else if (word.startsWith(term) || term.startsWith(word)) {
                        score += 8;
                    }
                }
            }
        }
        return score;
    }

    private int levenshteinDistance(String first, String second) {
        int[] previous = new int[second.length() + 1];
        for (int j = 0; j <= second.length(); j++) {
            previous[j] = j;
        }
        for (int i = 1; i <= first.length(); i++) {
            int[] current = new int[second.length() + 1];
            current[0] = i;
            for (int j = 1; j <= second.length(); j++) {
                int cost = first.charAt(i - 1) == second.charAt(j - 1) ? 0 : 1;
                current[j] = Math.min(
                        Math.min(current[j - 1] + 1, previous[j] + 1),
                        previous[j - 1] + cost
                );
            }
            previous = current;
        }
        return previous[second.length()];
    }

    private Map<String, Long> buildFacetCounts(List<Closet> closets, Function<Closet, String> fieldAccessor) {
        return closets.stream()
                .map(fieldAccessor)
                .filter(value -> value != null && !value.isBlank())
                .collect(Collectors.groupingBy(String::trim, LinkedHashMap::new, Collectors.counting()));
    }
}
