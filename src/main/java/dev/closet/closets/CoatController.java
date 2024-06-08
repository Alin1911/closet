package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/closets")
public class CoatController {
    @Autowired
    private CoatService coatService;

    @PostMapping
    public ResponseEntity<Coat> createCoat(@RequestBody Map<String, String> payload) {
        return new ResponseEntity<Coat>(coatService.createCoat(payload.get("body"), payload.get("imdbId")), HttpStatus.CREATED);
    }
}
