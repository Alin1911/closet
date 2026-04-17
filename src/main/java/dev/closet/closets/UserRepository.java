package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserProfile, ObjectId> {
    Optional<UserProfile> findByEmailIgnoreCase(String email);
    Optional<UserProfile> findBySessionTokenHashAndSessionExpiresAtAfter(String sessionTokenHash, Instant now);
    long deleteAllBySessionExpiresAtBefore(Instant now);
}
