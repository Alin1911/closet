package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class CoatService {
    @Autowired
    private CoatRepository coatRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Coat createCoat(String body, String imdbId) {
        Coat coat = coatRepository.insert(new Coat(body));

        mongoTemplate.update(Closet.class)
                .matching(Criteria.where("imdbId").is(imdbId))
                .apply(new Update().push("reviewIds").value(coat))
                .first();

        return coat;
    }
}
