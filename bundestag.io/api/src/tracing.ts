const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

if (!process.env.OTEL_EXPORTER_OTLP_TRACES_URL) {
  console.warn('OTEL_EXPORTER_OTLP_TRACES_URL is not set, tracing will not be enabled');
} else {
  // do not set headers in exporterOptions, the OTel spec recommends setting headers through ENV variables
  // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/protocol/exporter.md#specifying-headers-via-environment-variables

  // highlight-start
  const exporterOptions = {
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_URL,
  };
  // highlight-end

  const traceExporter = new OTLPTraceExporter(exporterOptions);
  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
      // highlight-next-line
      [SemanticResourceAttributes.SERVICE_NAME]: 'bundestag-io-api',
    }),
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry
  sdk.start();

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
}
