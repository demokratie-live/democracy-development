# Data Flow Documentation

## Overview

This document describes the detailed data flow through the import-conference-week-details service, covering both HTML and JSON processing paths.

## Complete Data Processing Pipeline

```mermaid
flowchart TD
    START([Service Start]) --> INIT[Initialize Configuration]
    
    INIT --> VALIDATE{Validate Config}
    VALIDATE -->|Invalid| CONFIG_ERROR[Configuration Error]
    VALIDATE -->|Valid| CONNECT[Connect to Database]
    
    CONNECT --> DB_CONNECTED{Database Connected?}
    DB_CONNECTED -->|No| DB_ERROR[Database Connection Error]
    DB_CONNECTED -->|Yes| START_CRAWL[Start Crawling Process]
    
    START_CRAWL --> BUILD_URL[Build Initial URL]
    BUILD_URL --> DATA_SOURCE{Data Source Type}
    
    DATA_SOURCE -->|HTML| HTML_URL[Generate HTML URL]
    DATA_SOURCE -->|JSON| JSON_URL[Generate JSON URL]
    
    HTML_URL --> HTML_REQUEST[Make HTTP Request to HTML Endpoint]
    JSON_URL --> JSON_REQUEST[Make HTTP Request to JSON Endpoint]
    
    HTML_REQUEST --> HTML_RESPONSE{Response OK?}
    JSON_REQUEST --> JSON_RESPONSE{Response OK?}
    
    HTML_RESPONSE -->|No| HTTP_ERROR[HTTP Error]
    JSON_RESPONSE -->|No| HTTP_ERROR
    
    HTML_RESPONSE -->|Yes| PARSE_HTML[Parse HTML Content]
    JSON_RESPONSE -->|Yes| PARSE_JSON[Parse JSON Content]
    
    PARSE_HTML --> EXTRACT_HTML[Extract Session Data from HTML]
    PARSE_JSON --> EXTRACT_JSON[Extract Session Data from JSON]
    
    EXTRACT_HTML --> NORMALIZE[Normalize Data Structure]
    EXTRACT_JSON --> NORMALIZE
    
    NORMALIZE --> VALIDATE_DATA{Data Valid?}
    VALIDATE_DATA -->|No| DATA_ERROR[Data Validation Error]
    VALIDATE_DATA -->|Yes| TRANSFORM[Transform for Database]
    
    TRANSFORM --> STORE[Store in Database]
    STORE --> STORED{Successfully Stored?}
    
    STORED -->|No| STORE_ERROR[Storage Error]
    STORED -->|Yes| SUCCESS[Process Complete]
    
    CONFIG_ERROR --> END([End with Error])
    DB_ERROR --> END
    HTTP_ERROR --> END
    DATA_ERROR --> END
    STORE_ERROR --> END
    SUCCESS --> END_SUCCESS([End Successfully])
```

## HTML Processing Flow

```mermaid
sequenceDiagram
    participant CONFIG as Configuration
    participant BUILDER as URL Builder
    participant CRAWLER as Crawler
    participant BUNDESTAG as Bundestag HTML
    participant PARSER as HTML Parser
    participant EXTRACTOR as Data Extractors
    
    CONFIG->>BUILDER: DATA_SOURCE=html
    BUILDER->>CRAWLER: HTML Endpoint URL
    
    CRAWLER->>BUNDESTAG: GET /conferenceweekDetail.form
    BUNDESTAG->>CRAWLER: HTML Response
    
    CRAWLER->>PARSER: Raw HTML Content
    PARSER->>EXTRACTOR: Parse with Cheerio
    
    Note over EXTRACTOR: Extract Navigation Data
    EXTRACTOR->>EXTRACTOR: Find .meta-slider elements
    EXTRACTOR->>EXTRACTOR: Extract previousYear/Week, nextYear/Week
    
    Note over EXTRACTOR: Extract Session Information
    EXTRACTOR->>EXTRACTOR: Find table.bt-table-data
    EXTRACTOR->>EXTRACTOR: Parse caption for session info
    EXTRACTOR->>EXTRACTOR: Extract date, session number
    
    Note over EXTRACTOR: Extract TOP Items
    EXTRACTOR->>EXTRACTOR: Find tbody tr elements
    EXTRACTOR->>EXTRACTOR: Extract time, TOP number, heading
    EXTRACTOR->>EXTRACTOR: Find .bt-button-link for articles
    
    Note over EXTRACTOR: Extract Topic Details
    EXTRACTOR->>EXTRACTOR: Find .bt-top-collapse elements
    EXTRACTOR->>EXTRACTOR: Parse content by double <br> breaks
    EXTRACTOR->>EXTRACTOR: Extract a.dipLink documents
    EXTRACTOR->>EXTRACTOR: Generate document IDs
    
    Note over EXTRACTOR: Extract Status Information
    EXTRACTOR->>EXTRACTOR: Parse status content
    EXTRACTOR->>EXTRACTOR: Handle complex voting information
    EXTRACTOR->>EXTRACTOR: Extract status documents
    
    EXTRACTOR->>PARSER: Structured Session Data
    PARSER->>CRAWLER: ConferenceWeekDetailSession[]
```

## JSON Processing Flow

```mermaid
sequenceDiagram
    participant CONFIG as Configuration
    participant BUILDER as URL Builder
    participant CRAWLER as Crawler
    participant BUNDESTAG as Bundestag JSON API
    participant PARSER as JSON Parser
    participant TRANSFORMER as Data Transformer
    
    CONFIG->>BUILDER: DATA_SOURCE=json
    BUILDER->>CRAWLER: JSON Endpoint URL
    
    CRAWLER->>BUNDESTAG: GET /conferenceWeekJSON
    BUNDESTAG->>CRAWLER: JSON Response
    
    CRAWLER->>PARSER: Raw JSON String
    PARSER->>PARSER: JSON.parse()
    
    Note over PARSER: Extract Navigation Data
    PARSER->>PARSER: Access previousWeek/nextWeek objects
    PARSER->>PARSER: Normalize to HTML parser format
    
    Note over PARSER: Extract Session Information
    PARSER->>PARSER: Iterate sessions array
    PARSER->>PARSER: Map date, dateText, session fields
    
    Note over PARSER: Process TOP Items
    PARSER->>TRANSFORMER: Map tops array
    TRANSFORMER->>TRANSFORMER: Parse time with session date
    TRANSFORMER->>TRANSFORMER: Map top, heading, article fields
    
    Note over TRANSFORMER: Process Topic Arrays
    TRANSFORMER->>TRANSFORMER: Map topic array items
    TRANSFORMER->>TRANSFORMER: Extract lines, documents
    TRANSFORMER->>TRANSFORMER: Generate documentIds from URLs
    TRANSFORMER->>TRANSFORMER: Handle undefined vs empty arrays
    
    Note over TRANSFORMER: Process Status Arrays
    TRANSFORMER->>TRANSFORMER: Map status array items
    TRANSFORMER->>TRANSFORMER: Extract status lines, documents
    TRANSFORMER->>TRANSFORMER: Generate status document IDs
    
    TRANSFORMER->>PARSER: Normalized Session Data
    PARSER->>CRAWLER: ConferenceWeekDetailSession[]
```

## Data Transformation Pipeline

```mermaid
graph TD
    subgraph "Raw Data Sources"
        HTML_RAW[Raw HTML Content]
        JSON_RAW[Raw JSON Response]
    end
    
    subgraph "Parsing Layer"
        HTML_PARSE[HTML Parser<br/>Cheerio-based]
        JSON_PARSE[JSON Parser<br/>Native JSON]
    end
    
    subgraph "Extraction Layer"
        NAV_EXTRACT[Navigation Data Extraction]
        SESSION_EXTRACT[Session Information Extraction]
        TOP_EXTRACT[TOP Item Extraction]
        TOPIC_EXTRACT[Topic Detail Extraction]
        STATUS_EXTRACT[Status Information Extraction]
    end
    
    subgraph "Normalization Layer"
        TIME_NORM[Time Normalization]
        DOC_NORM[Document ID Normalization]
        STRUCT_NORM[Structure Normalization]
    end
    
    subgraph "Validation Layer"
        TYPE_VAL[Type Validation]
        DATA_VAL[Data Consistency Validation]
        SCHEMA_VAL[Schema Validation]
    end
    
    subgraph "Output"
        NORMALIZED[Normalized Conference Week Detail]
    end
    
    HTML_RAW --> HTML_PARSE
    JSON_RAW --> JSON_PARSE
    
    HTML_PARSE --> NAV_EXTRACT
    HTML_PARSE --> SESSION_EXTRACT
    JSON_PARSE --> NAV_EXTRACT
    JSON_PARSE --> SESSION_EXTRACT
    
    SESSION_EXTRACT --> TOP_EXTRACT
    TOP_EXTRACT --> TOPIC_EXTRACT
    TOP_EXTRACT --> STATUS_EXTRACT
    
    NAV_EXTRACT --> TIME_NORM
    TOPIC_EXTRACT --> DOC_NORM
    STATUS_EXTRACT --> DOC_NORM
    TOP_EXTRACT --> STRUCT_NORM
    
    TIME_NORM --> TYPE_VAL
    DOC_NORM --> DATA_VAL
    STRUCT_NORM --> SCHEMA_VAL
    
    TYPE_VAL --> NORMALIZED
    DATA_VAL --> NORMALIZED
    SCHEMA_VAL --> NORMALIZED
```

## Document ID Processing

Document IDs are processed consistently across both data sources:

```mermaid
flowchart LR
    DOC_URL[Document URL<br/>https://dserver.bundestag.de/btd/20/038/2003858.pdf]
    
    REGEX[Regex Pattern<br/>/btd/(\d{2})/(\d{3})/(\d+)\.pdf$/]
    
    EXTRACT[Extract Components<br/>major: 20<br/>minor: 038<br/>fullId: 2003858]
    
    PROCESS[Process ID<br/>actualNumber = fullId.substring(-4)<br/>parsedNumber = parseInt(actualNumber)]
    
    RESULT[Document ID<br/>20/3858]
    
    DOC_URL --> REGEX
    REGEX --> EXTRACT
    EXTRACT --> PROCESS
    PROCESS --> RESULT
```

## Time Processing Pipeline

Time information is handled differently based on the data source:

```mermaid
graph TD
    subgraph "HTML Time Processing"
        HTML_TIME[Time String: "09:00"]
        HTML_DATE[Session Date: "2025-09-27"]
        HTML_PARSER[parseTimeString function]
        HTML_RESULT[Date: 2025-09-27T09:00:00.000Z]
    end
    
    subgraph "JSON Time Processing"
        JSON_TIME[Time String: "09:00"]
        JSON_DATE[Session Date: "2025-09-27"]
        JSON_PARSER[parseDateTime function]
        JSON_RESULT[Date: 2025-09-27T09:00:00.000Z]
    end
    
    subgraph "Consistency Validation"
        COMPARE[Compare Results]
        IDENTICAL[Identical Timestamps]
    end
    
    HTML_TIME --> HTML_PARSER
    HTML_DATE --> HTML_PARSER
    HTML_PARSER --> HTML_RESULT
    
    JSON_TIME --> JSON_PARSER
    JSON_DATE --> JSON_PARSER
    JSON_PARSER --> JSON_RESULT
    
    HTML_RESULT --> COMPARE
    JSON_RESULT --> COMPARE
    COMPARE --> IDENTICAL
```

## Error Handling Flow

```mermaid
graph TD
    PROCESS[Processing Step] --> ERROR{Error Occurred?}
    
    ERROR -->|No| CONTINUE[Continue Processing]
    ERROR -->|Yes| ERROR_TYPE{Error Type}
    
    ERROR_TYPE -->|Configuration| CONFIG_ERR[Configuration Error<br/>- Invalid DATA_SOURCE<br/>- Missing required config<br/>- Invalid format]
    
    ERROR_TYPE -->|Network| NETWORK_ERR[Network Error<br/>- HTTP request failed<br/>- Timeout occurred<br/>- Server unavailable]
    
    ERROR_TYPE -->|Parsing| PARSE_ERR[Parsing Error<br/>- Invalid HTML structure<br/>- Malformed JSON<br/>- Missing required elements]
    
    ERROR_TYPE -->|Database| DB_ERR[Database Error<br/>- Connection failed<br/>- Write operation failed<br/>- Schema validation error]
    
    CONFIG_ERR --> LOG_ERROR[Log Error Details]
    NETWORK_ERR --> RETRY{Retry Possible?}
    PARSE_ERR --> LOG_ERROR
    DB_ERR --> LOG_ERROR
    
    RETRY -->|Yes| WAIT[Wait with Backoff]
    RETRY -->|No| LOG_ERROR
    
    WAIT --> PROCESS
    LOG_ERROR --> FAIL[Fail Process]
    CONTINUE --> SUCCESS[Process Success]
```

## Data Consistency Validation

The service implements comprehensive validation to ensure data consistency:

```mermaid
graph TD
    subgraph "Structure Validation"
        SCHEMA[Schema Compliance]
        REQUIRED[Required Fields]
        TYPES[Data Types]
    end
    
    subgraph "Content Validation"
        FORMAT[Format Validation]
        RANGE[Range Checks]
        RELATIONSHIPS[Relationship Validation]
    end
    
    subgraph "Cross-Source Validation"
        HTML_DATA[HTML Parser Output]
        JSON_DATA[JSON Parser Output]
        COMPARE[Compare Structures]
        IDENTICAL[Verify Identical Results]
    end
    
    subgraph "Quality Assurance"
        COMPLETENESS[Data Completeness]
        ACCURACY[Data Accuracy]
        CONSISTENCY[Internal Consistency]
    end
    
    SCHEMA --> FORMAT
    REQUIRED --> RANGE
    TYPES --> RELATIONSHIPS
    
    HTML_DATA --> COMPARE
    JSON_DATA --> COMPARE
    COMPARE --> IDENTICAL
    
    IDENTICAL --> COMPLETENESS
    COMPLETENESS --> ACCURACY
    ACCURACY --> CONSISTENCY
```

## Performance Optimization

```mermaid
graph LR
    subgraph "Request Optimization"
        RATE_LIMIT[Rate Limiting]
        CONNECTION_POOL[Connection Pooling]
        TIMEOUT[Request Timeouts]
    end
    
    subgraph "Processing Optimization"
        PARALLEL[Parallel Processing]
        STREAMING[Streaming Parsing]
        MEMORY_MGT[Memory Management]
    end
    
    subgraph "Storage Optimization"
        BATCH[Batch Operations]
        INDEX[Database Indexing]
        COMPRESSION[Data Compression]
    end
    
    RATE_LIMIT --> PARALLEL
    CONNECTION_POOL --> STREAMING
    TIMEOUT --> MEMORY_MGT
    
    PARALLEL --> BATCH
    STREAMING --> INDEX
    MEMORY_MGT --> COMPRESSION
```

This data flow documentation provides detailed insight into how data moves through the import-conference-week-details service, ensuring transparency and maintainability of the processing pipeline.