package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserProfile, ObjectId> {
    Optional<UserProfile> findByEmailIgnoreCase(String email);
    Optional<UserProfile> findByAccessTokenHashAndAccessTokenExpiresAtAfter(String accessTokenHash, Instant now);
    Optional<UserProfile> findByRefreshTokenHashAndRefreshTokenExpiresAtAfter(String refreshTokenHash, Instant now);
}
