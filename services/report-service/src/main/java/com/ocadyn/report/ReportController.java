package com.ocadyn.report;

import com.ocadyn.report.dto.ReportSummaryResponse;
import com.ocadyn.security.CurrentUserResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;
    private final CurrentUserResolver currentUserResolver;

    public ReportController(ReportService reportService, CurrentUserResolver currentUserResolver) {
        this.reportService = reportService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/summary")
    @Operation(summary = "Savings and analytics summary")
    public ReportSummaryResponse summary() {
        return reportService.getSummary(currentUserResolver.requireUserId());
    }
}
