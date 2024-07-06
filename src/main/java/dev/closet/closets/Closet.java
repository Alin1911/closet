package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.List;

@Document(collection  = "closets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Closet {
    @Id
    private ObjectId id;
    private String name;
    private String poster;
    private String description;
    private List<String> images;
    @DocumentReference
    private List<Coat> coatsIds;
}
