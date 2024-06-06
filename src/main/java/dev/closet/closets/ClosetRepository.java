package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClosetRepository extends MongoRepository<Closet, ObjectId> {
    /*
        This interface extends MongoRepository which is a part of Spring Data MongoDB.

        The MongoRepository interface provides methods for performing CRUD operations on a MongoDB database.
    */
}
