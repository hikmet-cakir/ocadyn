package com.ocadyn.product;

import com.ocadyn.common.TrackingStatus;
import com.ocadyn.product.dto.DashboardStatsResponse;
import com.ocadyn.product.dto.ProductResponse;
import com.ocadyn.product.dto.TrackProductRequest;
import com.ocadyn.product.dto.ToggleFavoriteRequest;
import com.ocadyn.product.dto.UpdateNotificationSettingsRequest;
import com.ocadyn.product.dto.UpdateTrackingStatusRequest;
import com.ocadyn.security.CurrentUserResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;
    private final CurrentUserResolver currentUserResolver;

    public ProductController(ProductService productService, CurrentUserResolver currentUserResolver) {
        this.productService = productService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    @Operation(summary = "List tracked products")
    public List<ProductResponse> list(
            @RequestParam(required = false) TrackingStatus status,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(required = false) String search
    ) {
        String userId = currentUserResolver.requireUserId();
        return productService.listProducts(userId, status, favorite, search);
    }

    @GetMapping("/stats")
    @Operation(summary = "Dashboard summary stats")
    public DashboardStatsResponse stats() {
        return productService.getStats(currentUserResolver.requireUserId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id")
    public ProductResponse get(@PathVariable String id) {
        return productService.getProduct(currentUserResolver.requireUserId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Track product from URL")
    public ProductResponse track(@Valid @RequestBody TrackProductRequest request) {
        return productService.trackFromUrl(currentUserResolver.requireUserId(), request);
    }

    @PatchMapping("/{id}/tracking")
    @Operation(summary = "Update tracking status")
    public ProductResponse updateTracking(
            @PathVariable String id,
            @Valid @RequestBody UpdateTrackingStatusRequest request
    ) {
        return productService.updateTrackingStatus(currentUserResolver.requireUserId(), id, request);
    }

    @PatchMapping("/{id}/favorite")
    @Operation(summary = "Toggle favorite")
    public ProductResponse favorite(
            @PathVariable String id,
            @Valid @RequestBody ToggleFavoriteRequest request
    ) {
        return productService.toggleFavorite(currentUserResolver.requireUserId(), id, request.favorite());
    }

    @PutMapping("/{id}/notification-settings")
    @Operation(summary = "Update notification settings")
    public ProductResponse updateNotificationSettings(
            @PathVariable String id,
            @Valid @RequestBody UpdateNotificationSettingsRequest request
    ) {
        return productService.updateNotificationSettings(currentUserResolver.requireUserId(), id, request);
    }
}
