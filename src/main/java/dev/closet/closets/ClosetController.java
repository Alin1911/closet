package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/closet")
public class ClosetController {
    @Autowired
    private ClosetService closetService;
    @GetMapping
    public ResponseEntity<List<Closet>> getAllClosets(){
        return new ResponseEntity<List<Closet>>(closetService.allClosets(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Closet>> getClosetById(@PathVariable ObjectId id){
        return new ResponseEntity<Optional<Closet>>(closetService.closetById(id), HttpStatus.OK);
    }
}
