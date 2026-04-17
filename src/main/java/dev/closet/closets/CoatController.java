package dev.closet.closets;

import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class CoatController {
    @Autowired
    private CoatService coatService;

    @GetMapping("/api/v1/closets/{closetId}/coats")
    public ResponseEntity<?> getCoatsByCloset(@PathVariable String closetId) {
        if (!ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid closet id.", List.of()), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(coatService.getCoatsByCloset(new ObjectId(closetId)), HttpStatus.OK);
    }

    @PostMapping("/api/v1/closets/{closetId}/coats")
    public ResponseEntity<?> createCoat(@PathVariable String closetId, @Valid @RequestBody CoatCreateRequest payload) {
        if (!ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid closet id.", null), HttpStatus.BAD_REQUEST);
        }

        return coatService.createCoat(new ObjectId(closetId), payload)
                .<ResponseEntity<?>>map(coat -> new ResponseEntity<>(new ApiResponse<>("Item note created.", coat), HttpStatus.CREATED))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Closet not found.", null), HttpStatus.NOT_FOUND));
    }

    @PutMapping("/api/v1/closets/{closetId}/coats/{coatId}")
    public ResponseEntity<ApiResponse<Coat>> updateCoat(
            @PathVariable String closetId,
            @PathVariable String coatId,
            @Valid @RequestBody CoatUpdateRequest payload
    ) {
        if (!ObjectId.isValid(closetId) || !ObjectId.isValid(coatId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }

        return coatService.updateCoat(new ObjectId(closetId), new ObjectId(coatId), payload)
                .map(coat -> new ResponseEntity<>(new ApiResponse<>("Item note updated.", coat), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Item note not found.", null), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/api/v1/closets/{closetId}/coats/{coatId}")
    public ResponseEntity<ApiResponse<Void>> deleteCoat(@PathVariable String closetId, @PathVariable String coatId) {
        if (!ObjectId.isValid(closetId) || !ObjectId.isValid(coatId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }

        boolean deleted = coatService.deleteCoat(new ObjectId(closetId), new ObjectId(coatId));
        if (!deleted) {
            return new ResponseEntity<>(new ApiResponse<>("Item note not found.", null), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ApiResponse<>("Item note deleted.", null), HttpStatus.OK);
    }
}
