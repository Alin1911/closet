package dev.closet.closets;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/closets")
@CrossOrigin(origins = "http://localhost:3000", exposedHeaders = {"X-Total-Count", "X-Total-Pages", "X-Page", "X-Size"})
public class ClosetController {
    @Autowired
    private ClosetService closetService;

    @GetMapping
    public ResponseEntity<List<Closet>> getAllClosets(
            @RequestParam(required = false) String style,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ){
        if (page != null || size != null || (query != null && !query.isBlank())) {
            ClosetPageResponse response = closetService.allClosetsPage(style, season, color, sort, query, page == null ? 0 : page, size == null ? 12 : size);
            HttpHeaders headers = new HttpHeaders();
            headers.add("X-Total-Count", String.valueOf(response.totalCount()));
            headers.add("X-Total-Pages", String.valueOf(response.totalPages()));
            headers.add("X-Page", String.valueOf(response.page()));
            headers.add("X-Size", String.valueOf(response.size()));
            return new ResponseEntity<>(response.items(), headers, HttpStatus.OK);
        }
        return new ResponseEntity<>(closetService.allClosets(style, season, color, sort), HttpStatus.OK);
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

    @PostMapping
    public ResponseEntity<ApiResponse<Closet>> createCloset(@Valid @RequestBody ClosetUpsertRequest payload) {
        Closet closet = closetService.createCloset(payload);
        return new ResponseEntity<>(new ApiResponse<>("Closet created.", closet), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Closet>> updateCloset(@PathVariable String id, @Valid @RequestBody ClosetUpsertRequest payload) {
        if (!ObjectId.isValid(id)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid closet id.", null), HttpStatus.BAD_REQUEST);
        }

        return closetService.updateCloset(new ObjectId(id), payload)
                .map(closet -> new ResponseEntity<>(new ApiResponse<>("Closet updated.", closet), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Closet not found.", null), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCloset(@PathVariable String id) {
        if (!ObjectId.isValid(id)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid closet id.", null), HttpStatus.BAD_REQUEST);
        }

        boolean deleted = closetService.deleteCloset(new ObjectId(id));
        if (!deleted) {
            return new ResponseEntity<>(new ApiResponse<>("Closet not found.", null), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ApiResponse<>("Closet deleted.", null), HttpStatus.OK);
    }
}
