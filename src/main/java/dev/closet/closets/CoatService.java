package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.bson.types.ObjectId;

import java.util.List;

@Service
public class CoatService {
    @Autowired
    private CoatRepository coatRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Coat createCoat(CoatCreateRequest payload) {
        List<String> images = payload.images() == null ? List.of() : payload.images();
        Coat coat = coatRepository.insert(new Coat(payload.name(), payload.description(), images));

        if (payload.closetId() != null && ObjectId.isValid(payload.closetId())) {
            mongoTemplate.update(Closet.class)
                    .matching(Criteria.where("_id").is(new ObjectId(payload.closetId())))
                    .apply(new Update().push("coatsIds").value(coat))
                    .first();
        }
        return coat;
    }
}
