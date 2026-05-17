package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.time.Instant;
import java.util.List;

@Document(collection  = "closets")
@CompoundIndexes({
        @CompoundIndex(name = "closet_browse_filters_idx", def = "{'style': 1, 'season': 1, 'color': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "closet_recent_idx", def = "{'createdAt': -1}")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Closet {
    @Id
    private ObjectId id;
    @TextIndexed(weight = 4)
    private String name;
    private String poster;
    @TextIndexed(weight = 2)
    private String description;
    private String trailerLink;
    private List<String> images;
    private List<String> tags;
    private String style;
    private String season;
    private String color;
    private Instant createdAt;
    private Instant updatedAt;
    @DocumentReference
    private List<Coat> coatsIds;
}
