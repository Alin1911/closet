package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchAlertRepository extends MongoRepository<SearchAlert, ObjectId> {
    List<SearchAlert> findByUserId(ObjectId userId);
}
