package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class OutfitPlanService {
    @Autowired
    private OutfitPlanRepository outfitPlanRepository;

    @Autowired
    private ClosetRepository closetRepository;

    @Autowired
    private CoatRepository coatRepository;

    public List<OutfitPlan> getUserPlans(ObjectId userId) {
        return outfitPlanRepository.findAllByUserIdOrderByPlanDateAscUpdatedAtDesc(userId);
    }

    public OutfitPlan createPlan(ObjectId userId, OutfitPlanUpsertRequest request) {
        PlanReferences references = parseAndValidateReferences(request.closetIds(), request.coatIds());
        Instant now = Instant.now();
        OutfitPlan plan = new OutfitPlan();
        plan.setUserId(userId);
        plan.setPlanDate(request.planDate());
        plan.setTitle(request.title().trim());
        plan.setNotes(request.notes() == null ? null : request.notes().trim());
        plan.setClosetIds(references.closetIds());
        plan.setCoatIds(references.coatIds());
        plan.setCreatedAt(now);
        plan.setUpdatedAt(now);
        return outfitPlanRepository.insert(plan);
    }

    public Optional<OutfitPlan> updatePlan(ObjectId userId, ObjectId planId, OutfitPlanUpsertRequest request) {
        Optional<OutfitPlan> optionalPlan = outfitPlanRepository.findByIdAndUserId(planId, userId);
        if (optionalPlan.isEmpty()) {
            return Optional.empty();
        }
        PlanReferences references = parseAndValidateReferences(request.closetIds(), request.coatIds());
        OutfitPlan plan = optionalPlan.get();
        plan.setPlanDate(request.planDate());
        plan.setTitle(request.title().trim());
        plan.setNotes(request.notes() == null ? null : request.notes().trim());
        plan.setClosetIds(references.closetIds());
        plan.setCoatIds(references.coatIds());
        plan.setUpdatedAt(Instant.now());
        return Optional.of(outfitPlanRepository.save(plan));
    }

    public boolean deletePlan(ObjectId userId, ObjectId planId) {
        Optional<OutfitPlan> optionalPlan = outfitPlanRepository.findByIdAndUserId(planId, userId);
        if (optionalPlan.isEmpty()) {
            return false;
        }
        outfitPlanRepository.deleteById(planId);
        return true;
    }

    private PlanReferences parseAndValidateReferences(List<String> closetIds, List<String> coatIds) {
        List<ObjectId> closetObjectIds = parseObjectIds(closetIds, "closet");
        List<ObjectId> coatObjectIds = parseObjectIds(coatIds, "coat");
        if (closetObjectIds.isEmpty() && coatObjectIds.isEmpty()) {
            throw new IllegalArgumentException("Select at least one closet or clothing item.");
        }
        if (!closetObjectIds.isEmpty() && closetRepository.findAllById(closetObjectIds).size() != closetObjectIds.size()) {
            throw new IllegalArgumentException("One or more selected closets no longer exist.");
        }
        if (!coatObjectIds.isEmpty() && coatRepository.findAllById(coatObjectIds).size() != coatObjectIds.size()) {
            throw new IllegalArgumentException("One or more selected clothing items no longer exist.");
        }
        return new PlanReferences(closetObjectIds, coatObjectIds);
    }

    private List<ObjectId> parseObjectIds(List<String> rawIds, String label) {
        if (rawIds == null || rawIds.isEmpty()) {
            return List.of();
        }
        Set<ObjectId> unique = new LinkedHashSet<>();
        for (String rawId : rawIds) {
            if (rawId == null || rawId.isBlank()) {
                continue;
            }
            String value = rawId.trim();
            if (!ObjectId.isValid(value)) {
                throw new IllegalArgumentException("Invalid " + label + " id.");
            }
            unique.add(new ObjectId(value));
        }
        return new ArrayList<>(unique);
    }

    private record PlanReferences(List<ObjectId> closetIds, List<ObjectId> coatIds) {
    }
}
