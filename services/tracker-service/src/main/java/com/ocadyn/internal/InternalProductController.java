package com.ocadyn.internal;

import com.ocadyn.internal.dto.ActiveProductResponse;
import com.ocadyn.internal.dto.PriceUpdateRequest;
import com.ocadyn.internal.dto.PriceUpdateResponse;
import com.ocadyn.product.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/internal/products")
public class InternalProductController {

    private final ProductService productService;

    public InternalProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/active")
    public List<ActiveProductResponse> listActive() {
        return productService.listActiveProducts();
    }

    @PatchMapping("/{id}/price")
    public PriceUpdateResponse updatePrice(
            @PathVariable String id,
            @RequestBody PriceUpdateRequest request
    ) {
        return productService.applyPriceUpdate(id, request.newPrice());
    }

    @PatchMapping("/{id}/periodic-notification")
    public void recordPeriodicNotification(@PathVariable String id) {
        productService.recordPeriodicNotification(id);
    }
}
