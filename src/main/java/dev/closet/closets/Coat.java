package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection  = "clothes")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Coat {
    @Id
    public ObjectId id;
    private String body;
}
