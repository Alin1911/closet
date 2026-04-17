package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/closets")
@CrossOrigin(origins = "http://localhost:3000")
public class CoatController {
    @Autowired
    private CoatService coatService;

    @PostMapping
    public ResponseEntity<?> createCoat(@RequestBody CoatCreateRequest payload) {
        if (payload == null) {
            return ResponseEntity.badRequest().body("Request body is required.");
        }
        if (payload.name() == null || payload.name().isBlank()) {
            return ResponseEntity.badRequest().body("Name is required.");
        }
        if (payload.description() == null || payload.description().isBlank()) {
            return ResponseEntity.badRequest().body("Description is required.");
        }

        CoatCreateRequest normalizedPayload = new CoatCreateRequest(
                payload.closetId(),
                payload.name().trim(),
                payload.description().trim(),
                payload.images() == null ? new ArrayList<>() : payload.images()
        );

        return new ResponseEntity<>(coatService.createCoat(normalizedPayload), HttpStatus.CREATED);
    }
}
