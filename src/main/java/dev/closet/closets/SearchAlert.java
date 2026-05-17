package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "search_alerts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchAlert {
    @Id
    private ObjectId id;
    private ObjectId userId;
    private String query;
    private String style;
    private String season;
    private String color;
    private boolean inAppEnabled;
    private boolean emailEnabled;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastCheckedAt;
}
