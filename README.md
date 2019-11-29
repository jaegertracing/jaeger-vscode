# VSCode extension for Jaeger

Jaeger, inspired by [Dapper](https://research.google.com/pubs/pub36356.html) and [OpenZipkin](http://zipkin.io/), is a distributed tracing system released as open source by Uber Technologies. It is used for monitoring and troubleshooting microservices-based distributed systems, including:

* Distributed context propagation
* Distributed transaction monitoring
* Root cause analysis
* Service dependency analysis
* Performance / latency optimization

Once a Jaeger tracing system has been started, any applications (services) that are being tested within the IDE can report their tracing infomration to Jaeger through the use of an [OpenTracing compliant tracer](https://www.jaegertracing.io/docs/latest/client-libraries/) or using the emerging [OpenTelemetry clients](https://opentelemetry.io/) with Jaeger exporter.

![demo](jaeger-vscode.gif)

This extension contributes three commands that can be used to manage a Jaeger _all-in-one_ server from within the IDE. These commands are:

* Observability: Start Jaeger [jaeger.start]

This command will start the Jaeger _all-in-one_ server (using in-memory storage).

* Observability: Show Jaeger UI [jaeger.ui]

This command will open a web view to show the Jaeger UI.

* Observability: Stop Jaeger [jaeger.stop]

This command will terminate the Jaeger _all-in-one_ server.
