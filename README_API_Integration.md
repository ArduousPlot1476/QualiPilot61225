# Regulatory API Integration - Supabase Edge Function

This Edge Function provides comprehensive integration with regulatory APIs including eCFR, FDA databases, and Federal Register, with robust error handling, retry logic, and type safety.

## 🎯 Features

### API Integrations
- **eCFR API**: Access to Code of Federal Regulations with full text content
- **FDA Device Classification**: Search medical device classifications and product codes
- **FDA 510(k) Database**: Access to premarket notification data
- **Federal Register**: Search regulatory documents and updates

### Type Safety & Validation
- **CFR Citation Parser**: Validates and parses citations in "XX CFR YYY.ZZ" format
- **TypeScript Interfaces**: Comprehensive type definitions for all API responses
- **Input Validation**: Robust validation with descriptive error messages
- **Response Validation**: Ensures API responses match expected structure

### Error Handling & Resilience
- **Retry Logic**: Exponential backoff with configurable retry attempts
- **Timeout Handling**: 10-second timeout with graceful error messages
- **Fallback Behavior**: Continues operation when individual APIs fail
- **Comprehensive Logging**: Detailed error logging with context

## 🚀 Usage Examples

### Parse CFR Citation
```typescript
import { RegulatoryAPIService } from '../lib/api/regulatoryAPI';

// Parse and validate CFR citation
const citation = await RegulatoryAPIService.parseCitation("21 CFR 820.30");
console.log(citation);
// Output: { title: 21, part: 820, section: "30", isValid: true }
```

### Fetch eCFR Content
```typescript
// Get full regulation text
const content = await RegulatoryAPIService.fetcheCFRContent("21 CFR 820.30");
console.log(content.title); // "Design controls"
console.log(content.text);  // Full regulation text
```

### Search FDA Device Classifications
```typescript
// Search by device name
const classifications = await RegulatoryAPIService.searchFDAClassification(
  "pacemaker", // search term
  undefined,   // product code
  5           // limit
);

console.log(classifications.results[0].device_class); // "III"
console.log(classifications.results[0].regulation_number); // "21 CFR 870.3610"
```

### Search FDA 510(k) Database
```typescript
// Search 510(k) submissions
const submissions = await RegulatoryAPIService.searchFDA510K(
  "insulin pump", // search term
  undefined,      // K-number
  10             // limit
);

submissions.results.forEach(submission => {
  console.log(`${submission.k_number}: ${submission.device_name}`);
  console.log(`Decision: ${submission.decision_description}`);
});
```

### Comprehensive Search
```typescript
// Search all APIs simultaneously
const results = await RegulatoryAPIService.comprehensiveSearch({
  citation: "21 CFR 820.30",
  searchTerm: "design controls",
  limit: 5
});

console.log(`Found ${results.results.length} result types`);
console.log(`${results.summary.successful_calls}/${results.summary.total_apis_called} APIs succeeded`);

// Process results by type
results.results.forEach(result => {
  switch (result.type) {
    case 'ecfr':
      console.log('eCFR:', result.data.title);
      break;
    case 'fda_classification':
      console.log('FDA Classifications:', result.data.results.length);
      break;
    case 'fda_510k':
      console.log('510(k) Submissions:', result.data.results.length);
      break;
    case 'federal_register':
      console.log('Federal Register:', result.data.results.length);
      break;
  }
});
```

## 🔧 API Function Actions

### `parse_citation`
Validates and parses CFR citations.

**Request:**
```json
{
  "action": "parse_citation",
  "citation": "21 CFR 820.30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": 21,
    "part": 820,
    "section": "30",
    "isValid": true
  }
}
```

### `fetch_ecfr`
Retrieves full eCFR regulation content.

**Request:**
```json
{
  "action": "fetch_ecfr",
  "citation": "21 CFR 820.30"
}
```

### `search_fda_classification`
Searches FDA device classification database.

**Request:**
```json
{
  "action": "search_fda_classification",
  "searchTerm": "pacemaker",
  "limit": 10
}
```

### `search_fda_510k`
Searches FDA 510(k) premarket notification database.

**Request:**
```json
{
  "action": "search_fda_510k",
  "searchTerm": "insulin pump",
  "limit": 10
}
```

### `search_federal_register`
Searches Federal Register documents.

**Request:**
```json
{
  "action": "search_federal_register",
  "searchTerm": "medical device",
  "cfrTitle": 21,
  "cfrPart": 820,
  "limit": 10
}
```

### `comprehensive_search`
Performs concurrent searches across all APIs.

**Request:**
```json
{
  "action": "comprehensive_search",
  "citation": "21 CFR 820.30",
  "searchTerm": "design controls",
  "limit": 5
}
```

## 🛡️ Error Handling

### Citation Validation Errors
```typescript
const result = await RegulatoryAPIService.parseCitation("invalid citation");
// Returns: { isValid: false, errorMessage: "Invalid CFR citation format..." }
```

### API Timeout Handling
```typescript
try {
  const content = await RegulatoryAPIService.fetcheCFRContent("21 CFR 820.30");
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('API request timed out after 10 seconds');
  }
}
```

### Rate Limiting
```typescript
try {
  const results = await RegulatoryAPIService.searchFDAClassification("device");
} catch (error) {
  if (error.message.includes('rate limit')) {
    console.log('API rate limit exceeded, please try again later');
  }
}
```

### Fallback Behavior
```typescript
const results = await RegulatoryAPIService.comprehensiveSearch({
  searchTerm: "medical device"
});

// Even if some APIs fail, you get partial results
console.log(`Got ${results.results.length} successful results`);
console.log(`${results.errors.length} APIs failed`);

// Check specific errors
results.errors.forEach(error => {
  console.log(`${error.source} failed: ${error.message}`);
});
```

## 🔍 Utility Functions

### Citation Validation
```typescript
const validation = RegulatoryAPIService.validateCFRCitation("21 CFR 820.30");
console.log(validation.isValid); // true

const invalid = RegulatoryAPIService.validateCFRCitation("invalid");
console.log(invalid.errorMessage); // "Invalid CFR citation format..."
```

### URL Generation
```typescript
// Generate official URLs
const ecrfUrl = RegulatoryAPIService.generateeCFRURL(21, 820, "30");
// "https://www.ecfr.gov/current/title-21/part-820/section-820.30"

const classificationUrl = RegulatoryAPIService.generateFDAClassificationURL("DQO");
// "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpcd/classification.cfm?ID=DQO"

const fivetenKUrl = RegulatoryAPIService.generateFDA510KURL("K123456");
// "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=K123456"
```

### Citation Formatting
```typescript
const formatted = RegulatoryAPIService.formatCFRCitation(21, 820, "30");
console.log(formatted); // "21 CFR 820.30"
```

## 📊 Response Structure

All API responses follow a consistent structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  action: string;
  data: T;
  errors?: Array<{
    code: string;
    message: string;
    source: string;
    timestamp: string;
  }>;
  timestamp: string;
}
```

## 🚀 Deployment

1. **Deploy Edge Function:**
```bash
supabase functions deploy regulatory-api-integration
```

2. **Set Environment Variables:**
```bash
# No additional API keys required - uses public APIs
```

3. **Test Function:**
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/regulatory-api-integration" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "parse_citation", "citation": "21 CFR 820.30"}'
```

## 📈 Performance & Monitoring

### API Logging
All API calls are logged to the `api_logs` table with:
- Request parameters
- Response data
- Error details
- Processing time
- Success/failure status

### Retry Configuration
```typescript
const retryConfig = {
  maxAttempts: 3,      // Maximum retry attempts
  baseDelay: 1000,     // Initial delay (1 second)
  maxDelay: 10000      // Maximum delay (10 seconds)
};
```

### Timeout Settings
- **API Timeout**: 10 seconds per request
- **Retry Delays**: Exponential backoff (1s, 2s, 4s, 8s, 10s max)
- **Concurrent Requests**: Up to 4 simultaneous API calls in comprehensive search

This integration provides a robust, type-safe, and resilient interface to regulatory APIs with comprehensive error handling and monitoring capabilities.