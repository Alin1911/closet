package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/closets")
@CrossOrigin(origins = "http://localhost:3000")
public class ClosetController {
    @Autowired
    private ClosetService closetService;
    @GetMapping
    public ResponseEntity<List<Closet>> getAllClosets(){
        return new ResponseEntity<List<Closet>>(closetService.allClosets(), HttpStatus.OK);
    }

    @GetMapping("/imdb/{imdbId}")
    public ResponseEntity<Optional<Closet>> getClosetByImdbId(@PathVariable("imdbId") String closetId){
        if (!ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(Optional.empty(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<Optional<Closet>>(closetService.closetById(new ObjectId(closetId)), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Closet>> getClosetById(@PathVariable String id) {
        if (!ObjectId.isValid(id)) {
            return new ResponseEntity<>(Optional.empty(), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(closetService.closetById(new ObjectId(id)), HttpStatus.OK);
    }
}
