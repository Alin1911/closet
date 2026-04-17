package dev.closet.closets;


import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

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
        if (size <= 0) {
            size = 12;
        }
        if (page < 0) {
            page = 0;
        }
        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        int totalPages = filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / size);
        return new ClosetPageResponse(filtered.subList(start, end), filtered.size(), page, size, totalPages);
    }

    private List<Closet> filterAndSort(String style, String season, String color, String sort, String query) {
        Stream<Closet> stream = closetRepository.findAll().stream();

        if (style != null && !style.isBlank()) {
            String styleFilter = style.trim().toLowerCase();
            stream = stream.filter(closet -> closet.getStyle() != null && closet.getStyle().trim().toLowerCase().equals(styleFilter));
        }

        if (season != null && !season.isBlank()) {
            String seasonFilter = season.trim().toLowerCase();
            stream = stream.filter(closet -> closet.getSeason() != null && closet.getSeason().trim().toLowerCase().equals(seasonFilter));
        }

        if (color != null && !color.isBlank()) {
            String colorFilter = color.trim().toLowerCase();
            stream = stream.filter(closet -> closet.getColor() != null && closet.getColor().trim().toLowerCase().equals(colorFilter));
        }

        if (query != null && !query.isBlank()) {
            String q = query.trim().toLowerCase();
            stream = stream.filter(closet ->
                    (closet.getName() != null && closet.getName().toLowerCase().contains(q)) ||
                            (closet.getDescription() != null && closet.getDescription().toLowerCase().contains(q))
            );
        }

        Comparator<Closet> comparator = Comparator.comparing(
                c -> c.getCreatedAt() == null ? Instant.EPOCH : c.getCreatedAt(),
                Comparator.reverseOrder()
        );
        if ("name".equalsIgnoreCase(sort)) {
            comparator = Comparator.comparing(c -> c.getName() == null ? "" : c.getName().toLowerCase());
        }

        return stream.sorted(comparator).toList();
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
}
