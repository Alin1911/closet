package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CoatService {
    @Autowired
    private CoatRepository coatRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public Coat createCoat(String name, String description, List<String> images, String id) {
        Coat coat = coatRepository.insert(new Coat(name, description, images));

        mongoTemplate.update(Closet.class)
                .matching(Criteria.where("id").is(id))
                .apply(new Update().push("coatsIds").value(coat))
                .first();

        return coat;
    }

    public Coat createCoat(String name, String description, List<String> images) {
        return coatRepository.insert(new Coat(name, description, images));
    }
}
