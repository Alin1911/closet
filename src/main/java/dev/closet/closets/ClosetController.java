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
    public ResponseEntity<Optional<Closet>> getClosetByImdbId(@PathVariable String imdbId){
        return new ResponseEntity<Optional<Closet>>(closetService.closetByImdbId(imdbId), HttpStatus.OK);
    }
}
