# Deployment & Operations Guide

## Overview

This document provides comprehensive guidance for deploying, configuring, and operating the import-conference-week-details service in various environments.

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_APP[Import Service<br/>Node.js Application]
        DEV_DB[(Local MongoDB<br/>Development Data)]
        DEV_CONFIG[Local Configuration<br/>Environment Variables]
        DEV_LOGS[Local Logs<br/>Console Output]
    end
    
    subgraph "Staging Environment"
        STAGE_APP[Import Service<br/>Containerized]
        STAGE_DB[(Staging MongoDB<br/>Test Data)]
        STAGE_CONFIG[Staging Configuration<br/>Environment Variables]
        STAGE_LOGS[Centralized Logs<br/>Log Aggregation]
    end
    
    subgraph "Production Environment"
        PROD_APP[Import Service<br/>Orchestrated Containers]
        PROD_DB[(Production MongoDB<br/>Live Data)]
        PROD_CONFIG[Production Configuration<br/>Secure Environment Variables]
        PROD_LOGS[Production Logs<br/>Monitoring & Alerting]
        PROD_MONITOR[Monitoring<br/>Health Checks & Metrics]
    end
    
    subgraph "External Services"
        BUNDESTAG[Bundestag API<br/>bundestag.de]
        SHARED_CONFIG[Shared Configuration<br/>Common Packages]
    end
    
    DEV_CONFIG --> DEV_APP
    DEV_APP --> DEV_DB
    DEV_APP --> DEV_LOGS
    DEV_APP --> BUNDESTAG
    
    STAGE_CONFIG --> STAGE_APP
    STAGE_APP --> STAGE_DB
    STAGE_APP --> STAGE_LOGS
    STAGE_APP --> BUNDESTAG
    
    PROD_CONFIG --> PROD_APP
    PROD_APP --> PROD_DB
    PROD_APP --> PROD_LOGS
    PROD_APP --> PROD_MONITOR
    PROD_APP --> BUNDESTAG
    
    SHARED_CONFIG --> DEV_APP
    SHARED_CONFIG --> STAGE_APP
    SHARED_CONFIG --> PROD_APP
```

## Environment Configuration

### Development Environment

```bash
# Development configuration
NODE_ENV=development
DATA_SOURCE=html
CONFERENCE_YEAR=2025
CONFERENCE_WEEK=39
CONFERENCE_LIMIT=5
CRAWL_MAX_REQUESTS_PER_CRAWL=5
DB_URL=mongodb://localhost:27017/bundestagio-dev
LOG_LEVEL=debug
```

### Staging Environment

```bash
# Staging configuration
NODE_ENV=staging
DATA_SOURCE=html
CONFERENCE_YEAR=2025
CONFERENCE_WEEK=39
CONFERENCE_LIMIT=10
CRAWL_MAX_REQUESTS_PER_CRAWL=10
DB_URL=mongodb://staging-db:27017/bundestagio-staging
LOG_LEVEL=info
```

### Production Environment

```bash
# Production configuration
NODE_ENV=production
DATA_SOURCE=html  # or json for A/B testing
CONFERENCE_YEAR=2025
CONFERENCE_WEEK=39
CONFERENCE_LIMIT=10
CRAWL_MAX_REQUESTS_PER_CRAWL=10
DB_URL=mongodb://prod-db-cluster:27017/bundestagio
LOG_LEVEL=info
```

## Container Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port (if needed for health checks)
EXPOSE 3000

# Set user for security
USER node

# Start application
CMD ["node", "build/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  import-service:
    build: .
    environment:
      - DATA_SOURCE=html
      - CONFERENCE_YEAR=2025
      - CONFERENCE_WEEK=39
      - DB_URL=mongodb://mongodb:27017/bundestagio
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - app-network

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
```

## Kubernetes Deployment

### Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: import-conference-week-details
  labels:
    app: import-conference-week-details
spec:
  replicas: 1
  selector:
    matchLabels:
      app: import-conference-week-details
  template:
    metadata:
      labels:
        app: import-conference-week-details
    spec:
      containers:
      - name: import-service
        image: democracy-development/import-conference-week-details:latest
        env:
        - name: DATA_SOURCE
          valueFrom:
            configMapKeyRef:
              name: import-config
              key: data-source
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - "ps aux | grep '[n]ode' || exit 1"
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - /bin/sh
            - -c
            - "ps aux | grep '[n]ode' || exit 1"
          initialDelaySeconds: 5
          periodSeconds: 5
```

### ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: import-config
data:
  data-source: "html"
  conference-year: "2025"
  conference-week: "39"
  conference-limit: "10"
  crawl-max-requests: "10"
  log-level: "info"
```

### Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
type: Opaque
data:
  connection-string: bW9uZ29kYjovL3Byb2QtZGI6MjcwMTcvYnVuZGVzdGFnaW8=  # base64 encoded
```

## Monitoring and Observability

### Health Check Endpoint

```mermaid
sequenceDiagram
    participant HC as Health Check
    participant APP as Application
    participant DB as Database
    participant EXT as External API
    
    HC->>APP: GET /health
    APP->>DB: Check Connection
    DB->>APP: Connection Status
    APP->>EXT: Check API Availability
    EXT->>APP: API Status
    APP->>HC: Health Status Response
    
    Note over HC,APP: Response includes:<br/>- Service status<br/>- Database connectivity<br/>- External API availability<br/>- Last successful run<br/>- Configuration status
```

### Monitoring Stack

```mermaid
graph TD
    subgraph "Application Layer"
        APP[Import Service]
        HEALTH[Health Endpoints]
        METRICS[Application Metrics]
    end
    
    subgraph "Collection Layer"
        PROMETHEUS[Prometheus<br/>Metrics Collection]
        GRAFANA[Grafana<br/>Visualization]
        ALERTMANAGER[AlertManager<br/>Alert Processing]
    end
    
    subgraph "Storage Layer"
        TSDB[Time Series DB<br/>Prometheus Storage]
        LOGS[Log Storage<br/>ElasticSearch/CloudWatch]
    end
    
    subgraph "Notification Layer"
        SLACK[Slack Notifications]
        EMAIL[Email Alerts]
        PAGERDUTY[PagerDuty Integration]
    end
    
    APP --> HEALTH
    APP --> METRICS
    HEALTH --> PROMETHEUS
    METRICS --> PROMETHEUS
    
    PROMETHEUS --> GRAFANA
    PROMETHEUS --> ALERTMANAGER
    PROMETHEUS --> TSDB
    
    APP --> LOGS
    
    ALERTMANAGER --> SLACK
    ALERTMANAGER --> EMAIL
    ALERTMANAGER --> PAGERDUTY
```

### Key Metrics

| Metric | Type | Description | Alert Threshold |
|--------|------|-------------|-----------------|
| `conference_week_processing_duration` | Histogram | Time to process a conference week | > 300s |
| `conference_week_processing_total` | Counter | Total number of processed weeks | Rate decrease |
| `conference_week_processing_errors` | Counter | Number of processing errors | > 5/hour |
| `database_connection_status` | Gauge | Database connection health | 0 (disconnected) |
| `external_api_response_time` | Histogram | Bundestag API response time | > 10s |
| `external_api_errors` | Counter | External API errors | > 10/hour |
| `memory_usage_bytes` | Gauge | Memory usage | > 400MB |
| `cpu_usage_percent` | Gauge | CPU usage percentage | > 80% |

## A/B Testing Deployment

### Blue-Green Deployment for A/B Testing

```mermaid
graph TD
    subgraph "Traffic Router"
        LB[Load Balancer<br/>Traffic Distribution]
    end
    
    subgraph "Blue Deployment (HTML)"
        BLUE_APP[Import Service<br/>DATA_SOURCE=html]
        BLUE_DB[(Database<br/>Blue Results)]
    end
    
    subgraph "Green Deployment (JSON)"
        GREEN_APP[Import Service<br/>DATA_SOURCE=json]
        GREEN_DB[(Database<br/>Green Results)]
    end
    
    subgraph "Comparison Layer"
        COMPARE[Data Comparison Service]
        METRICS[A/B Test Metrics]
        DASHBOARD[A/B Test Dashboard]
    end
    
    LB -->|50%| BLUE_APP
    LB -->|50%| GREEN_APP
    
    BLUE_APP --> BLUE_DB
    GREEN_APP --> GREEN_DB
    
    BLUE_DB --> COMPARE
    GREEN_DB --> COMPARE
    
    COMPARE --> METRICS
    METRICS --> DASHBOARD
```

### A/B Testing Configuration

```yaml
# Blue environment (HTML)
apiVersion: v1
kind: ConfigMap
metadata:
  name: import-config-blue
data:
  data-source: "html"
  deployment-variant: "blue"

---

# Green environment (JSON)
apiVersion: v1
kind: ConfigMap
metadata:
  name: import-config-green
data:
  data-source: "json"
  deployment-variant: "green"
```

## Operational Procedures

### Deployment Process

```mermaid
flowchart TD
    START([Deployment Start]) --> BUILD[Build Application]
    BUILD --> TEST[Run Tests]
    TEST --> TEST_PASS{Tests Pass?}
    
    TEST_PASS -->|No| FIX[Fix Issues]
    FIX --> BUILD
    
    TEST_PASS -->|Yes| STAGE[Deploy to Staging]
    STAGE --> STAGE_TEST[Run Staging Tests]
    STAGE_TEST --> STAGE_PASS{Staging Tests Pass?}
    
    STAGE_PASS -->|No| ROLLBACK_STAGE[Rollback Staging]
    ROLLBACK_STAGE --> FIX
    
    STAGE_PASS -->|Yes| PROD_DEPLOY[Deploy to Production]
    PROD_DEPLOY --> HEALTH_CHECK[Health Check]
    HEALTH_CHECK --> HEALTHY{Service Healthy?}
    
    HEALTHY -->|No| ROLLBACK_PROD[Rollback Production]
    ROLLBACK_PROD --> INVESTIGATE[Investigate Issues]
    
    HEALTHY -->|Yes| MONITOR[Monitor Performance]
    MONITOR --> SUCCESS([Deployment Complete])
    
    INVESTIGATE --> FIX
```

### Rollback Procedure

```mermaid
sequenceDiagram
    participant OPS as Operations Team
    participant K8S as Kubernetes
    participant APP as Application
    participant DB as Database
    participant MONITOR as Monitoring
    
    OPS->>MONITOR: Detect Issue
    MONITOR->>OPS: Alert Triggered
    
    OPS->>K8S: Initiate Rollback
    K8S->>APP: Stop Current Version
    K8S->>APP: Start Previous Version
    
    APP->>DB: Verify Database Connection
    DB->>APP: Connection Confirmed
    
    APP->>MONITOR: Health Check Response
    MONITOR->>OPS: Service Restored
    
    OPS->>OPS: Document Incident
    OPS->>OPS: Schedule Post-Mortem
```

### Backup and Recovery

```mermaid
graph TD
    subgraph "Backup Strategy"
        DB_BACKUP[Database Backup<br/>Daily Automated]
        CONFIG_BACKUP[Configuration Backup<br/>Version Controlled]
        APP_BACKUP[Application Backup<br/>Container Images]
    end
    
    subgraph "Recovery Procedures"
        DATA_RECOVERY[Data Recovery<br/>From Backup]
        CONFIG_RECOVERY[Configuration Recovery<br/>From Git]
        APP_RECOVERY[Application Recovery<br/>Previous Image]
    end
    
    subgraph "Validation"
        INTEGRITY_CHECK[Data Integrity Check]
        FUNCTION_TEST[Functionality Test]
        PERFORMANCE_CHECK[Performance Validation]
    end
    
    DB_BACKUP --> DATA_RECOVERY
    CONFIG_BACKUP --> CONFIG_RECOVERY
    APP_BACKUP --> APP_RECOVERY
    
    DATA_RECOVERY --> INTEGRITY_CHECK
    CONFIG_RECOVERY --> FUNCTION_TEST
    APP_RECOVERY --> PERFORMANCE_CHECK
```

## Troubleshooting Guide

### Common Issues

| Issue | Symptoms | Diagnosis | Resolution |
|-------|----------|-----------|------------|
| **Configuration Error** | Service fails to start | Check logs for config validation errors | Verify environment variables |
| **Database Connection** | Connection timeout errors | Test database connectivity | Check network, credentials |
| **External API Issues** | HTTP errors from Bundestag | Monitor API response codes | Implement retry logic, contact support |
| **Memory Issues** | Out of memory errors | Monitor memory usage metrics | Increase memory limits, optimize code |
| **Performance Degradation** | Slow processing times | Check processing duration metrics | Optimize queries, increase resources |

### Diagnostic Commands

```bash
# Check service status
kubectl get pods -l app=import-conference-week-details

# View logs
kubectl logs -f deployment/import-conference-week-details

# Check resource usage
kubectl top pods -l app=import-conference-week-details

# Execute health check
kubectl exec -it deployment/import-conference-week-details -- node -e "console.log('Health check')"

# Check configuration
kubectl get configmap import-config -o yaml

# View secrets (masked)
kubectl get secret database-secret -o yaml
```

### Performance Tuning

```mermaid
graph TD
    subgraph "Performance Optimization"
        CPU[CPU Optimization<br/>- Adjust CPU limits<br/>- Enable CPU affinity<br/>- Optimize async operations]
        
        MEMORY[Memory Optimization<br/>- Monitor heap usage<br/>- Implement garbage collection tuning<br/>- Optimize data structures]
        
        NETWORK[Network Optimization<br/>- Connection pooling<br/>- Request batching<br/>- Timeout tuning]
        
        DATABASE[Database Optimization<br/>- Index optimization<br/>- Query optimization<br/>- Connection pooling]
    end
    
    subgraph "Monitoring"
        METRICS[Performance Metrics]
        ALERTS[Performance Alerts]
        DASHBOARD[Performance Dashboard]
    end
    
    CPU --> METRICS
    MEMORY --> METRICS
    NETWORK --> METRICS
    DATABASE --> METRICS
    
    METRICS --> ALERTS
    METRICS --> DASHBOARD
```

## Security Considerations

### Security Checklist

- [ ] Environment variables encrypted at rest
- [ ] Network traffic encrypted in transit
- [ ] Container runs as non-root user
- [ ] Resource limits configured
- [ ] Security scanning enabled
- [ ] Access logs monitored
- [ ] Regular security updates applied

### Security Architecture

```mermaid
graph TD
    subgraph "Network Security"
        FIREWALL[Firewall Rules]
        TLS[TLS Encryption]
        VPN[VPN Access]
    end
    
    subgraph "Application Security"
        AUTH[Authentication]
        RBAC[Role-Based Access]
        SECRETS[Secret Management]
    end
    
    subgraph "Infrastructure Security"
        SCANNING[Container Scanning]
        UPDATES[Security Updates]
        MONITORING[Security Monitoring]
    end
    
    FIREWALL --> AUTH
    TLS --> RBAC
    VPN --> SECRETS
    
    AUTH --> SCANNING
    RBAC --> UPDATES
    SECRETS --> MONITORING
```

This deployment guide provides comprehensive coverage of operational aspects for the import-conference-week-details service, ensuring reliable and secure operations across all environments.