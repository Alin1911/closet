package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClosetRepository extends MongoRepository<Closet, ObjectId> {
    Optional<Closet> findClosetById(String id);
}
