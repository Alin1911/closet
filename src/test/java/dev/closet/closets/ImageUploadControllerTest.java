package dev.closet.closets;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ImageUploadController.class)
@AutoConfigureMockMvc(addFilters = false)
class ImageUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImageStorageService imageStorageService;

    @MockBean
    private TagSuggestionService tagSuggestionService;

    @MockBean
    private AuthTokenFilter authTokenFilter;

    @Test
    void uploadImage_shouldReturnCreatedResponse() throws Exception {
        when(imageStorageService.store(any(), any())).thenReturn(new ImageUploadResponse("/api/v1/uploads/images/test.jpg", List.of("winter")));

        MockMultipartFile file = new MockMultipartFile("file", "coat.jpg", MediaType.IMAGE_JPEG_VALUE, "image".getBytes());
        mockMvc.perform(multipart("/api/v1/uploads/images").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url").value("/api/v1/uploads/images/test.jpg"))
                .andExpect(jsonPath("$.data.suggestedTags[0]").value("winter"));
    }

    @Test
    void uploadImage_shouldReturnBadRequestForValidationError() throws Exception {
        when(imageStorageService.store(any(), any())).thenThrow(new IllegalArgumentException("Unsupported image type."));

        MockMultipartFile file = new MockMultipartFile("file", "coat.txt", MediaType.TEXT_PLAIN_VALUE, "bad".getBytes());
        mockMvc.perform(multipart("/api/v1/uploads/images").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported image type."));
    }
}
