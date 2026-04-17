package dev.closet.closets;

import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody AuthRegisterRequest request) {
        return authService.register(request)
                .map(user -> new ResponseEntity<>(new ApiResponse<>("Registration successful.", user), HttpStatus.CREATED))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Email is already registered.", null), HttpStatus.CONFLICT));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request)
                .map(user -> new ResponseEntity<>(new ApiResponse<>("Login successful.", user), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("Invalid email or password.", null), HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<?> getFavorites(@PathVariable String userId) {
        if (!ObjectId.isValid(userId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid user id.", List.of()), HttpStatus.BAD_REQUEST);
        }

        return authService.getFavorites(new ObjectId(userId))
                .<ResponseEntity<?>>map(favorites -> new ResponseEntity<>(favorites, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", List.of()), HttpStatus.NOT_FOUND));
    }

    @PutMapping("/users/{userId}/favorites/{closetId}")
    public ResponseEntity<ApiResponse<AuthResponse>> addFavorite(@PathVariable String userId, @PathVariable String closetId) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }

        return authService.addFavorite(new ObjectId(userId), new ObjectId(closetId))
                .map(response -> new ResponseEntity<>(new ApiResponse<>("Closet saved.", response), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", null), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/users/{userId}/favorites/{closetId}")
    public ResponseEntity<ApiResponse<AuthResponse>> removeFavorite(@PathVariable String userId, @PathVariable String closetId) {
        if (!ObjectId.isValid(userId) || !ObjectId.isValid(closetId)) {
            return new ResponseEntity<>(new ApiResponse<>("Invalid id.", null), HttpStatus.BAD_REQUEST);
        }

        return authService.removeFavorite(new ObjectId(userId), new ObjectId(closetId))
                .map(response -> new ResponseEntity<>(new ApiResponse<>("Closet removed from saved.", response), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(new ApiResponse<>("User not found.", null), HttpStatus.NOT_FOUND));
    }
}
