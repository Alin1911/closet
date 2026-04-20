package dev.closet.closets;

import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ClosetController.class)
@AutoConfigureMockMvc(addFilters = false)
class ClosetControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClosetService closetService;

    @MockBean
    private AuthTokenFilter authTokenFilter;

    @Test
    void getAllClosets_withPagination_shouldReturnHeadersAndBody() throws Exception {
        Closet closet = new Closet();
        closet.setId(new ObjectId());
        closet.setName("Winter Closet");

        ClosetPageResponse response = new ClosetPageResponse(
                List.of(closet),
                10,
                1,
                5,
                2,
                Map.of("Classic", 7L),
                Map.of("Winter", 6L),
                Map.of("Blue", 4L)
        );

        when(closetService.allClosetsPage(null, null, null, null, "winter", 1, 5)).thenReturn(response);

        mockMvc.perform(get("/api/v1/closets")
                        .queryParam("q", "winter")
                        .queryParam("page", "1")
                        .queryParam("size", "5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "10"))
                .andExpect(header().string("X-Total-Pages", "2"))
                .andExpect(header().string("X-Page", "1"))
                .andExpect(header().string("X-Size", "5"))
                .andExpect(header().string("X-Facet-Styles", "{\"Classic\":7}"))
                .andExpect(jsonPath("$[0].name").value("Winter Closet"));
    }

    @Test
    void getAllClosets_withInvalidPage_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/closets")
                        .queryParam("q", "winter")
                        .queryParam("page", "-1")
                        .queryParam("size", "5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(closetService);
    }
}
