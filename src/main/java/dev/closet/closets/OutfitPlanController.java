package dev.closet.closets;

import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/{userId}/outfit-plans")
@CrossOrigin(origins = "http://localhost:3000")
public class OutfitPlanController {
    @Autowired
    private OutfitPlanService outfitPlanService;

    @GetMapping
    public ResponseEntity<?> getPlans(@PathVariable String userId, Authentication authentication) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", List.of()), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", List.of()), HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(outfitPlanService.getUserPlans(new ObjectId(userId)), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OutfitPlan>> createPlan(
            @PathVariable String userId,
            @Valid @RequestBody OutfitPlanUpsertRequest request,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        try {
            OutfitPlan created = outfitPlanService.createPlan(new ObjectId(userId), request);
            return new ResponseEntity<>(new ApiResponse<>("Outfit plan created.", created), HttpStatus.CREATED);
        } catch (IllegalArgumentException exception) {
            return new ResponseEntity<>(new ApiResponse<>(exception.getMessage(), null), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{planId}")
    public ResponseEntity<ApiResponse<OutfitPlan>> updatePlan(
            @PathVariable String userId,
            @PathVariable String planId,
            @Valid @RequestBody OutfitPlanUpsertRequest request,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(planId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        try {
            return outfitPlanService.updatePlan(new ObjectId(userId), new ObjectId(planId), request)
                    .map(plan -> new ResponseEntity<>(new ApiResponse<>("Outfit plan updated.", plan), HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Outfit plan not found.", null), HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException exception) {
            return new ResponseEntity<>(new ApiResponse<>(exception.getMessage(), null), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(
            @PathVariable String userId,
            @PathVariable String planId,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(planId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        boolean deleted = outfitPlanService.deletePlan(new ObjectId(userId), new ObjectId(planId));
        if (!deleted) {
            return new ResponseEntity<>(new ApiResponse<>("Outfit plan not found.", null), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ApiResponse<>("Outfit plan deleted.", null), HttpStatus.OK);
    }

    private boolean isAuthorizedUser(Authentication authentication, String userId) {
        return authentication != null && authentication.isAuthenticated() && userId.equals(authentication.getName());
    }
}
