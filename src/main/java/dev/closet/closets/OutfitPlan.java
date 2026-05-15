package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Document(collection = "outfit_plans")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OutfitPlan {
    @Id
    private ObjectId id;
    private ObjectId userId;
    private LocalDate planDate;
    private String title;
    private String notes;
    private List<ObjectId> closetIds;
    private List<ObjectId> coatIds;
    private Instant createdAt;
    private Instant updatedAt;
}
