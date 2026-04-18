package dev.closet.closets;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfile {
    @Id
    private ObjectId id;
    private String email;
    private String displayName;
    private String passwordHash;
    private String accessTokenHash;
    private Instant accessTokenExpiresAt;
    private String refreshTokenHash;
    private Instant refreshTokenExpiresAt;
    private List<ObjectId> favoriteClosetIds;
    private Instant createdAt;
    private Instant updatedAt;
}
