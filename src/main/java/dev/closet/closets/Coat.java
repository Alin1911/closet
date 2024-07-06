package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection  = "clothes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Coat {
    @Id
    public ObjectId id;
    private List<String> images;
    private String name;
    private String description;

    public Coat(String name, String description, List<String> images) {
        this.name = name;
        this.description = description;
        this.images = images;
    }
}
