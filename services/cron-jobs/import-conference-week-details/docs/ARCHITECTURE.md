# Import Conference Week Details - Architecture Documentation

## Overview

The `import-conference-week-details` service is a data ingestion service that crawls and imports conference week details from the German Bundestag website. It supports both HTML parsing and JSON API endpoints with configurable A/B testing capabilities.

## System Architecture

```mermaid
graph TB
    subgraph "External Systems"
        BT[Bundestag Website]
        DB[(MongoDB Database)]
    end
    
    subgraph "Import Service"
        subgraph "Entry Point"
            MAIN[main.ts]
            INDEX[index.ts]
        end
        
        subgraph "Core Components"
            CONFIG[config.ts]
            ROUTES[routes.ts] 
            CRAWLER[crawler.ts]
        end
        
        subgraph "Data Processing"
            HTMLP[HTML Parser]
            JSONP[JSON Parser]
            URLB[URL Builder]
        end
        
        subgraph "Utilities"
            UTILS[URL Utils]
            TYPES[Type Definitions]
        end
    end
    
    MAIN --> INDEX
    INDEX --> CONFIG
    INDEX --> ROUTES
    INDEX --> DB
    
    ROUTES --> CRAWLER
    ROUTES --> HTMLP
    ROUTES --> JSONP
    ROUTES --> URLB
    
    CRAWLER --> BT
    HTMLP --> BT
    JSONP --> BT
    
    INDEX --> DB
    
    CONFIG --> URLB
    TYPES --> HTMLP
    TYPES --> JSONP
    UTILS --> ROUTES
```

## Component Overview

### Core Components

| Component | Purpose | Key Responsibilities |
|-----------|---------|---------------------|
| `main.ts` | Application entry point | Process orchestration, error handling |
| `index.ts` | Main processing logic | Database operations, data transformation |
| `config.ts` | Configuration management | Environment variables, validation |
| `routes.ts` | Request routing | URL handling, parser selection |
| `crawler.ts` | Web crawling | HTTP requests, response handling |

### Data Processing Components

| Component | Purpose | Key Responsibilities |
|-----------|---------|---------------------|
| `html-parser.ts` | HTML data extraction | Parse HTML responses, extract session data |
| `json-parser.ts` | JSON data extraction | Parse JSON responses, normalize data structure |
| `url-builder.ts` | URL generation | Generate appropriate URLs based on configuration |

### Utility Components

| Component | Purpose | Key Responsibilities |
|-----------|---------|---------------------|
| `url.ts` | URL processing | Parse URL parameters, extract metadata |
| `types.ts` | Type definitions | TypeScript interfaces, data structures |

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant ENV as Environment
    participant MAIN as Main Process
    participant CONFIG as Configuration
    participant ROUTES as Route Handler
    participant URLB as URL Builder
    participant BT as Bundestag API
    participant PARSER as Parser (HTML/JSON)
    participant DB as Database
    
    ENV->>CONFIG: Environment Variables
    MAIN->>CONFIG: Load Configuration
    CONFIG->>URLB: Data Source Type
    
    MAIN->>ROUTES: Start Processing
    ROUTES->>URLB: Generate URL
    URLB->>ROUTES: Appropriate Endpoint URL
    
    ROUTES->>BT: HTTP Request
    BT->>ROUTES: Response (HTML/JSON)
    
    alt HTML Data Source
        ROUTES->>PARSER: HTML Content
        PARSER->>ROUTES: Parsed Session Data
    else JSON Data Source
        ROUTES->>PARSER: JSON Content  
        PARSER->>ROUTES: Parsed Session Data
    end
    
    ROUTES->>MAIN: Processed Data
    MAIN->>DB: Store Conference Week Details
    DB->>MAIN: Confirmation
```

## Configuration-Driven Architecture

The service implements a flexible configuration system that enables A/B testing between data sources:

```mermaid
graph LR
    subgraph "Configuration Layer"
        ENV[Environment Variables]
        CONFIG[Config Module]
        DEFAULTS[Default Values]
    end
    
    subgraph "URL Generation"
        URLB[URL Builder]
        HTML_URL[HTML Endpoint]
        JSON_URL[JSON Endpoint]
    end
    
    subgraph "Data Processing"
        ROUTER[Route Handler]
        HTML_PARSER[HTML Parser]
        JSON_PARSER[JSON Parser]
    end
    
    ENV --> CONFIG
    DEFAULTS --> CONFIG
    CONFIG --> URLB
    
    URLB --> HTML_URL
    URLB --> JSON_URL
    
    HTML_URL --> ROUTER
    JSON_URL --> ROUTER
    
    ROUTER --> HTML_PARSER
    ROUTER --> JSON_PARSER
```

### Configuration Options

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATA_SOURCE` | `html` | Switch between `html` and `json` data sources |
| `CONFERENCE_YEAR` | `2025` | Starting year for data extraction |
| `CONFERENCE_WEEK` | `37` | Starting week for data extraction |
| `CONFERENCE_LIMIT` | `10` | Results per page (HTML only) |
| `CRAWL_MAX_REQUESTS_PER_CRAWL` | `10` | Request limit per crawl session |
| `DB_URL` | `mongodb://localhost:27017/bundestagio` | Database connection string |

## Data Source Switching Mechanism

```mermaid
flowchart TD
    START([Service Start]) --> LOAD_CONFIG[Load Configuration]
    LOAD_CONFIG --> CHECK_SOURCE{DATA_SOURCE?}
    
    CHECK_SOURCE -->|html or undefined| HTML_PATH[HTML Processing Path]
    CHECK_SOURCE -->|json| JSON_PATH[JSON Processing Path]
    CHECK_SOURCE -->|invalid| ERROR[Throw Configuration Error]
    
    HTML_PATH --> HTML_URL[Generate HTML URL]
    JSON_PATH --> JSON_URL[Generate JSON URL]
    
    HTML_URL --> HTML_REQUEST[HTTP Request to HTML Endpoint]
    JSON_URL --> JSON_REQUEST[HTTP Request to JSON Endpoint]
    
    HTML_REQUEST --> HTML_PARSE[Parse HTML Response]
    JSON_REQUEST --> JSON_PARSE[Parse JSON Response]
    
    HTML_PARSE --> NORMALIZE[Normalize Data Structure]
    JSON_PARSE --> NORMALIZE
    
    NORMALIZE --> STORE[Store in Database]
    STORE --> END([Process Complete])
```

## Parser Architecture

Both parsers implement the same interface and produce identical data structures:

```mermaid
classDiagram
    class IParser {
        <<interface>>
        +extractNavigationData() NavigationData
        +extractSessionInfo() ConferenceWeekDetailSession[]
    }
    
    class HTMLParser {
        +extractNavigationData($: CheerioAPI) NavigationData
        +extractSessionInfo($: CheerioAPI) ConferenceWeekDetailSession[]
        -extractTopItems() ConferenceWeekDetailSessionTop[]
        -extractTopicDetails() ConferenceWeekDetailSessionTopTopic[]
        -extractStatusItems() ConferenceWeekDetailSessionTopStatus[]
    }
    
    class JSONParser {
        +parseConferenceWeekJSON(jsonString: string) ParsedResult
        +extractNavigationDataFromJSON(data: ConferenceWeekJSON) NavigationData
        +extractSessionInfoFromJSON(data: ConferenceWeekJSON) ConferenceWeekDetailSession[]
        -parseDateTime(timeStr: string, sessionDate?: string) Date
        -extractDocumentIds(documents: string[]) string[]
    }
    
    class ConferenceWeekDetailSession {
        +date: string
        +dateText: string
        +session: string
        +tops: ConferenceWeekDetailSessionTop[]
    }
    
    class ConferenceWeekDetailSessionTop {
        +time: Date
        +top: string
        +heading: string
        +article: string
        +topic: ConferenceWeekDetailSessionTopTopic[]
        +status: ConferenceWeekDetailSessionTopStatus[]
    }
    
    IParser <|-- HTMLParser
    IParser <|-- JSONParser
    HTMLParser --> ConferenceWeekDetailSession
    JSONParser --> ConferenceWeekDetailSession
    ConferenceWeekDetailSession --> ConferenceWeekDetailSessionTop
```

## Testing Architecture

```mermaid
graph TD
    subgraph "Test Structure"
        subgraph "Unit Tests"
            CONFIG_TEST[Config Tests]
            PARSER_TESTS[Parser Tests]
            UTIL_TESTS[Utility Tests]
        end
        
        subgraph "Integration Tests"
            WORKFLOW_TEST[Workflow Tests]
            DATA_COMPARISON[Data Source Comparison]
            DETAILED_COMPARISON[Detailed HTML-JSON Comparison]
        end
        
        subgraph "Test Data"
            MOCK_HTML[Mock HTML Responses]
            MOCK_JSON[Mock JSON Responses]
            REALISTIC_DATA[Realistic Test Data]
        end
    end
    
    subgraph "Validation Layers"
        LINT[ESLint Validation]
        TYPE_CHECK[TypeScript Checking]
        BUILD_CHECK[Build Verification]
    end
    
    CONFIG_TEST --> CONFIG
    PARSER_TESTS --> HTMLP[HTML Parser]
    PARSER_TESTS --> JSONP[JSON Parser]
    UTIL_TESTS --> URLB[URL Builder]
    
    WORKFLOW_TEST --> ROUTES
    DATA_COMPARISON --> PARSER_TESTS
    DETAILED_COMPARISON --> REALISTIC_DATA
    
    MOCK_HTML --> PARSER_TESTS
    MOCK_JSON --> PARSER_TESTS
    REALISTIC_DATA --> DATA_COMPARISON
```

### Test Coverage Areas

| Test Type | Purpose | Coverage |
|-----------|---------|----------|
| **Unit Tests** | Individual component testing | Config, parsers, utilities |
| **Integration Tests** | End-to-end workflow testing | Complete data processing pipeline |
| **Comparison Tests** | Data consistency validation | HTML vs JSON parser output |
| **Edge Case Tests** | Error handling and boundary conditions | Empty responses, invalid data |

## Database Schema

The service stores data in MongoDB using the following schema structure:

```mermaid
erDiagram
    ConferenceWeekDetail {
        string url
        number year
        number week
        object previousWeek
        object nextWeek
        array sessions
    }
    
    ConferenceWeekDetailSession {
        string date
        string dateText
        string session
        array tops
    }
    
    ConferenceWeekDetailSessionTop {
        date time
        string top
        string heading
        string article
        array topic
        array status
    }
    
    ConferenceWeekDetailSessionTopTopic {
        array lines
        array documents
        array documentIds
    }
    
    ConferenceWeekDetailSessionTopStatus {
        array lines
        array documents
        array documentIds
    }
    
    ConferenceWeekDetail ||--o{ ConferenceWeekDetailSession : contains
    ConferenceWeekDetailSession ||--o{ ConferenceWeekDetailSessionTop : contains
    ConferenceWeekDetailSessionTop ||--o{ ConferenceWeekDetailSessionTopTopic : has
    ConferenceWeekDetailSessionTop ||--o{ ConferenceWeekDetailSessionTopStatus : has
```

## Performance Considerations

### Crawling Strategy

```mermaid
graph LR
    subgraph "Request Management"
        QUEUE[Request Queue]
        LIMITER[Rate Limiter]
        RETRY[Retry Logic]
    end
    
    subgraph "Processing Strategy"
        CONCURRENT[Concurrent Processing]
        DEDUP[Deduplication]
        CACHE[Response Caching]
    end
    
    subgraph "Resource Management"
        MEMORY[Memory Management]
        CONNECTION[Connection Pooling]
        TIMEOUT[Request Timeouts]
    end
    
    QUEUE --> LIMITER
    LIMITER --> RETRY
    RETRY --> CONCURRENT
    CONCURRENT --> DEDUP
    DEDUP --> CACHE
    CACHE --> MEMORY
    MEMORY --> CONNECTION
    CONNECTION --> TIMEOUT
```

### Optimization Features

- **Request Rate Limiting**: Configurable crawl limits to respect server resources
- **Deduplication**: Prevent processing the same URL multiple times
- **Connection Management**: Efficient HTTP connection handling
- **Memory Management**: Controlled resource usage during processing
- **Error Recovery**: Robust error handling and retry mechanisms

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_SERVICE[Import Service]
        DEV_DB[(Local MongoDB)]
        DEV_CONFIG[Development Config]
    end
    
    subgraph "Production Environment"
        PROD_SERVICE[Import Service]
        PROD_DB[(Production MongoDB)]
        PROD_CONFIG[Production Config]
        MONITORING[Monitoring & Logging]
    end
    
    subgraph "External Dependencies"
        BUNDESTAG[Bundestag API]
        SHARED_CONFIG[Shared Configurations]
    end
    
    DEV_CONFIG --> DEV_SERVICE
    DEV_SERVICE --> DEV_DB
    DEV_SERVICE --> BUNDESTAG
    
    PROD_CONFIG --> PROD_SERVICE
    PROD_SERVICE --> PROD_DB
    PROD_SERVICE --> BUNDESTAG
    PROD_SERVICE --> MONITORING
    
    SHARED_CONFIG --> DEV_SERVICE
    SHARED_CONFIG --> PROD_SERVICE
```

## Security Considerations

### Data Protection

- **Input Validation**: All external data is validated before processing
- **SQL Injection Prevention**: Using parameterized queries with MongoDB
- **Rate Limiting**: Protection against service abuse
- **Error Handling**: Secure error messages without sensitive information

### Configuration Security

- **Environment Variables**: Sensitive configuration stored in environment variables
- **Default Values**: Secure defaults for all configuration options
- **Validation**: Configuration validation at startup

## Monitoring and Observability

### Logging Strategy

```mermaid
graph LR
    subgraph "Log Levels"
        INFO[Info Logs]
        WARN[Warning Logs]  
        ERROR[Error Logs]
        DEBUG[Debug Logs]
    end
    
    subgraph "Log Categories"
        CONFIG_LOG[Configuration Events]
        PROCESS_LOG[Processing Events]
        ERROR_LOG[Error Events]
        PERFORMANCE_LOG[Performance Metrics]
    end
    
    subgraph "Output Destinations"
        CONSOLE[Console Output]
        FILE[Log Files]
        EXTERNAL[External Systems]
    end
    
    INFO --> PROCESS_LOG
    WARN --> ERROR_LOG
    ERROR --> ERROR_LOG
    DEBUG --> PERFORMANCE_LOG
    
    CONFIG_LOG --> CONSOLE
    PROCESS_LOG --> CONSOLE
    ERROR_LOG --> FILE
    PERFORMANCE_LOG --> EXTERNAL
```

### Key Metrics

- **Processing Time**: Time taken to process each conference week
- **Success Rate**: Percentage of successful data extractions
- **Error Rate**: Frequency and types of errors encountered  
- **Data Consistency**: Validation of data quality between sources
- **Resource Usage**: Memory and CPU utilization patterns

## Future Enhancements

### Planned Improvements

1. **Additional Data Sources**: Support for more Bundestag data endpoints
2. **Real-time Processing**: WebSocket or SSE support for live updates
3. **Advanced Caching**: Redis-based caching for improved performance
4. **Data Validation**: Enhanced data quality checks and validation rules
5. **API Integration**: REST API for external system integration

### Scalability Considerations

```mermaid
graph TB
    subgraph "Current Architecture"
        SINGLE[Single Service Instance]
        DIRECT[Direct Database Access]
        SIMPLE[Simple Configuration]
    end
    
    subgraph "Scalable Architecture"
        MULTIPLE[Multiple Service Instances]
        QUEUE[Message Queue]
        LOAD_BALANCER[Load Balancer]
        CACHE[Distributed Cache]
        CONFIG_SERVICE[Configuration Service]
    end
    
    SINGLE --> MULTIPLE
    DIRECT --> QUEUE
    SIMPLE --> CONFIG_SERVICE
    MULTIPLE --> LOAD_BALANCER
    QUEUE --> CACHE
```

This architecture documentation provides a comprehensive overview of the import-conference-week-details service, including its design patterns, data flow, and operational characteristics. The service is designed with flexibility, maintainability, and scalability in mind, supporting both current requirements and future enhancements.