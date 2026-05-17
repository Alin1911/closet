package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CoatService {
    @Autowired
    private CoatRepository coatRepository;

    @Autowired
    private ClosetRepository closetRepository;

    @Autowired
    private TagSuggestionService tagSuggestionService;

    public Optional<Coat> createCoat(ObjectId closetId, CoatCreateRequest payload) {
        Optional<Closet> optionalCloset = closetRepository.findById(closetId);
        if (optionalCloset.isEmpty()) {
            return Optional.empty();
        }

        List<String> images = payload.images() == null ? List.of() : payload.images();
        List<String> tags = resolveTags(payload.tags(), payload.name(), payload.description(), images);
        Instant now = Instant.now();
        Coat coat = new Coat(payload.name().trim(), payload.description().trim(), images, tags);
        coat.setCreatedAt(now);
        coat.setUpdatedAt(now);
        Coat saved = coatRepository.insert(coat);

        Closet closet = optionalCloset.get();
        List<Coat> coats = closet.getCoatsIds() == null ? new ArrayList<>() : new ArrayList<>(closet.getCoatsIds());
        coats.add(saved);
        closet.setCoatsIds(coats);
        closet.setUpdatedAt(now);
        closetRepository.save(closet);
        return Optional.of(saved);
    }

    public List<Coat> getCoatsByCloset(ObjectId closetId) {
        return closetRepository.findById(closetId)
                .map(closet -> closet.getCoatsIds() == null ? List.<Coat>of() : closet.getCoatsIds())
                .orElse(List.of());
    }

    public Optional<Coat> updateCoat(ObjectId closetId, ObjectId coatId, CoatUpdateRequest payload) {
        Optional<Closet> optionalCloset = closetRepository.findById(closetId);
        if (optionalCloset.isEmpty()) {
            return Optional.empty();
        }

        Optional<Coat> optionalCoat = coatRepository.findById(coatId);
        if (optionalCoat.isEmpty()) {
            return Optional.empty();
        }

        Closet closet = optionalCloset.get();
        boolean belongsToCloset = closet.getCoatsIds() != null &&
                closet.getCoatsIds().stream().anyMatch(coat -> coatId.equals(coat.getId()));
        if (!belongsToCloset) {
            return Optional.empty();
        }

        Coat coat = optionalCoat.get();
        coat.setName(payload.name().trim());
        coat.setDescription(payload.description().trim());
        coat.setImages(payload.images() == null ? List.of() : payload.images());
        coat.setTags(resolveTags(payload.tags(), payload.name(), payload.description(), coat.getImages()));
        coat.setUpdatedAt(Instant.now());
        Coat saved = coatRepository.save(coat);

        List<Coat> refreshed = closet.getCoatsIds().stream()
                .map(c -> coatId.equals(c.getId()) ? saved : c)
                .toList();
        closet.setCoatsIds(refreshed);
        closet.setUpdatedAt(Instant.now());
        closetRepository.save(closet);
        return Optional.of(saved);
    }

    public boolean deleteCoat(ObjectId closetId, ObjectId coatId) {
        Optional<Closet> optionalCloset = closetRepository.findById(closetId);
        if (optionalCloset.isEmpty()) {
            return false;
        }

        Closet closet = optionalCloset.get();
        if (closet.getCoatsIds() == null || closet.getCoatsIds().stream().noneMatch(coat -> coatId.equals(coat.getId()))) {
            return false;
        }

        coatRepository.deleteById(coatId);
        List<Coat> remaining = closet.getCoatsIds().stream()
                .filter(coat -> !coatId.equals(coat.getId()))
                .toList();
        closet.setCoatsIds(remaining);
        closet.setUpdatedAt(Instant.now());
        closetRepository.save(closet);
        return true;
    }

    private List<String> resolveTags(List<String> payloadTags, String name, String description, List<String> images) {
        List<String> normalized = tagSuggestionService.normalizeTags(payloadTags);
        if (normalized == null) {
            normalized = List.of();
        }
        if (!normalized.isEmpty()) {
            return normalized;
        }
        List<String> imageTokens = images == null ? List.of() : images.stream().map(this::extractFileName).toList();
        return tagSuggestionService.suggest(List.of(name, description, String.join(" ", imageTokens)));
    }

    private String extractFileName(String value) {
        if (value == null) {
            return "";
        }
        int index = value.lastIndexOf('/');
        return index >= 0 ? value.substring(index + 1) : value;
    }
}
