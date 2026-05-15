package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutfitPlanRepository extends MongoRepository<OutfitPlan, ObjectId> {
    List<OutfitPlan> findAllByUserIdOrderByPlanDateAscUpdatedAtDesc(ObjectId userId);
    Optional<OutfitPlan> findByIdAndUserId(ObjectId id, ObjectId userId);
}
