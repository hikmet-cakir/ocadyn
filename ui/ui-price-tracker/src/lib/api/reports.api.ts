import { apiRequest } from '@/lib/api-client';
import { mapReportSummary, type ReportSummary } from '@/lib/mappers';
import type { ApiReportSummaryResponse } from '@/types/api.types';

export async function fetchReportSummary(): Promise<ReportSummary> {
  const response = await apiRequest<ApiReportSummaryResponse>('/api/reports/summary');
  return mapReportSummary(response);
}
