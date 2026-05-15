package dev.closet.closets;

import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/{userId}/search-alerts")
@CrossOrigin(origins = "http://localhost:3000")
public class SearchAlertController {
    @Autowired
    private SearchAlertService searchAlertService;

    @GetMapping
    public ResponseEntity<?> list(@PathVariable String userId, Authentication authentication) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", List.of()), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", List.of()), HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(searchAlertService.listAlerts(new ObjectId(userId)), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SearchAlertResponse>> create(
            @PathVariable String userId,
            @Valid @RequestBody SearchAlertUpsertRequest request,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        if (isEmptyAlert(request)) {
            return new ResponseEntity<>(new ApiResponse<>("Provide at least one filter or search query.", null), HttpStatus.BAD_REQUEST);
        }
        SearchAlertResponse alert = searchAlertService.createAlert(new ObjectId(userId), request);
        return new ResponseEntity<>(new ApiResponse<>("Search alert created.", alert), HttpStatus.CREATED);
    }

    @PutMapping("/{alertId}")
    public ResponseEntity<ApiResponse<SearchAlertResponse>> update(
            @PathVariable String userId,
            @PathVariable String alertId,
            @Valid @RequestBody SearchAlertUpsertRequest request,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(alertId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }
        if (isEmptyAlert(request)) {
            return new ResponseEntity<>(new ApiResponse<>("Provide at least one filter or search query.", null), HttpStatus.BAD_REQUEST);
        }

        return searchAlertService.updateAlert(new ObjectId(userId), new ObjectId(alertId), request)
                .map(alert -> new ResponseEntity<>(new ApiResponse<>("Search alert updated.", alert), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Search alert not found.", null), HttpStatus.NOT_FOUND));
    }

    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<ApiResponse<SearchAlertResponse>> acknowledge(
            @PathVariable String userId,
            @PathVariable String alertId,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(alertId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }

        return searchAlertService.acknowledgeAlert(new ObjectId(userId), new ObjectId(alertId))
                .map(alert -> new ResponseEntity<>(new ApiResponse<>("Search alert acknowledged.", alert), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Search alert not found.", null), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String userId,
            @PathVariable String alertId,
            Authentication authentication
    ) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(alertId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }
        if (!isAuthorizedUser(authentication, userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Forbidden.", null), HttpStatus.FORBIDDEN);
        }

        boolean deleted = searchAlertService.deleteAlert(new ObjectId(userId), new ObjectId(alertId));
        if (!deleted) {
            return new ResponseEntity<>(new ApiResponse<>("Search alert not found.", null), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ApiResponse<>("Search alert deleted.", null), HttpStatus.OK);
    }

    private boolean isAuthorizedUser(Authentication authentication, String userId) {
        return authentication != null && authentication.isAuthenticated() && userId.equals(authentication.getName());
    }

    private boolean isEmptyAlert(SearchAlertUpsertRequest request) {
        return (request.query() == null || request.query().isBlank())
                && (request.style() == null || request.style().isBlank())
                && (request.season() == null || request.season().isBlank())
                && (request.color() == null || request.color().isBlank());
    }
}
