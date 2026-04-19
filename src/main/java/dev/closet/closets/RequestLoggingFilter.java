package dev.closet.closets;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String REQUEST_ID_MDC_KEY = "requestId";
    private static final Pattern OBJECT_ID_PATTERN = Pattern.compile("/[a-fA-F0-9]{24}(?=/|$)");
    private static final Pattern TRAILER_ID_PATTERN = Pattern.compile("/[a-zA-Z0-9_-]{11}(?=/|$)");

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }
        response.setHeader(REQUEST_ID_HEADER, requestId);
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        long startedAt = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startedAt;
            LOGGER.info("requestId={} method={} path={} query={} status={} durationMs={} remoteAddr={}",
                    requestId,
                    request.getMethod(),
                    request.getRequestURI(),
                    request.getQueryString(),
                    response.getStatus(),
                    duration,
                    request.getRemoteAddr());
            if (meterRegistry != null) {
                meterRegistry.timer(
                                "closet.http.requests",
                                Tags.of(
                                        "method", request.getMethod(),
                                        "path", normalizePath(request.getRequestURI()),
                                        "status", String.valueOf(response.getStatus())
                                )
                        )
                        .record(duration, java.util.concurrent.TimeUnit.MILLISECONDS);
            }
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            return "unknown";
        }
        String normalized = OBJECT_ID_PATTERN.matcher(path).replaceAll("/{id}");
        return TRAILER_ID_PATTERN.matcher(normalized).replaceAll("/{trailerId}");
    }
}
