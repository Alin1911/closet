package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/closets")
@CrossOrigin(origins = "http://localhost:3000")
public class CoatController {
    @Autowired
    private CoatService coatService;

    @PostMapping
    public ResponseEntity<Coat> createCoat(@RequestBody Map<String, String> payload) {
        return new ResponseEntity<Coat>(coatService.createCoat(payload.get("name"), payload.get("description"), Collections.singletonList(payload.get("images"))), HttpStatus.CREATED);
    }
}
