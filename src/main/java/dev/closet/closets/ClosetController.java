package dev.closet.closets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/closet")
public class ClosetController {
    @Autowired
    private ClosetService closetService;
    @GetMapping
    public ResponseEntity<List<Closet>> getAllClosets(){
        return new ResponseEntity<List<Closet>>(closetService.allClosets(), HttpStatus.OK);
    }
}
