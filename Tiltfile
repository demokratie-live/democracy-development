load('ext://helm_remote', 'helm_remote')
k8s_yaml(kustomize('./infra/kustomize/overlays/local'))

k8s_resource(workload='democracy-app-depl', port_forwards='3000:3000', labels=["democracy"])
k8s_resource(workload='democracy-api-depl', port_forwards='3001:3000', labels=["democracy"])

k8s_resource(workload='bundestagio-admin-depl', labels=["bundestag"])
k8s_resource(workload='bundestagio-depl', port_forwards='3101:3100', labels=["bundestag"])
k8s_resource(workload='bundestagio-dip-depl', port_forwards='3102:3101', labels=["bundestag"])

k8s_resource(workload='qr-code-handler-depl', labels=["services"])

k8s_resource(workload='cleanup-push-queue', labels=["cronjobs"])
k8s_resource(workload='democracy-sync-deputy-profiles-cronjob', labels=["cronjobs"])
k8s_resource(workload='democracy-sync-named-polls-cronjob', labels=["cronjobs"])
k8s_resource(workload='democracy-sync-procedures-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-conference-week-details-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-deputy-profiles-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-deputy-profiles-period-18-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-deputy-profiles-period-19-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-named-poll-deputies-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-named-polls-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-plenary-minutes-cronjob', labels=["cronjobs"])
k8s_resource(workload='import-procedures-cronjob', labels=["cronjobs"])
k8s_resource(workload='index-sync-bundestagio-cronjob', labels=["cronjobs"])
k8s_resource(workload='index-sync-democracy-cronjob', labels=["cronjobs"])
k8s_resource(workload='push-send-queued-cronjob', labels=["cronjobs"])
k8s_resource(workload='queue-pushs-conference-week-cronjob', labels=["cronjobs"])
k8s_resource(workload='queue-pushs-vote-conference-week-cronjob', labels=["cronjobs"])
k8s_resource(workload='queue-pushs-vote-top-100-cronjob', labels=["cronjobs"])
k8s_resource(workload='shedule-bio-resync-cronjob', labels=["cronjobs"])

k8s_resource(workload='democracy-mongo-depl', labels=["third-paty"])
k8s_resource(workload='gorush', labels=["third-paty"])
k8s_resource(workload='nats-depl', labels=["third-paty"])
k8s_resource(workload='redis', labels=["third-paty"])


# democracy-api
docker_build(
    'democracy/democracy-server',
    context='./democracy/api',
    dockerfile='./democracy/api/Dockerfile',
    only=['.'],
    target='build_stage',
    entrypoint='yarn dev',
    live_update=[
        sync('./democracy/api/src/', '/app/src/'),
        run(
            'yarn install',
            trigger=['./yarn.lock']
        )
    ]
)
# import-procedures-cronjob
docker_build(
    'democracy/crawler',
    context='./services/cron-jobs/crawler',
    dockerfile='./services/cron-jobs/crawler/Dockerfile',
    only=['.'],
    target='build_stage',
    entrypoint='yarn dev',
    live_update=[
        sync('./services/cron-jobs/crawler/src/', '/app/src/'),
        run(
            'yarn install',
            trigger=['./yarn.lock']
        )
    ]
)

### DAPR #######################################################################
helm_remote('dapr',
            repo_url='https://dapr.github.io/helm-charts/',
            namespace='dapr-system',
            create_namespace=True,
            version='1.7.0'
)
k8s_yaml(helm('./infra/dapr/zipkin-helm',
     namespace='dapr-system',
))
k8s_yaml(kustomize('./infra/dapr'), allow_duplicates=True)

k8s_resource(workload='dapr-dashboard', port_forwards='3300:8080', labels=["dapr"])
k8s_resource(workload='dapr-operator', labels=["dapr"])
k8s_resource(workload='dapr-sentry', labels=["dapr"])
k8s_resource(workload='dapr-sidecar-injector', labels=["dapr"])
k8s_resource(workload='dapr-placement-server', labels=["dapr"])
k8s_resource(workload='chart-zipkin-ui', port_forwards='9411', labels=["dapr"])
k8s_resource(workload='chart-zipkin-dependencies-gen', labels=["dapr"])
k8s_resource(workload='chart-zipkin-cassandra', labels=["dapr"])
k8s_resource(workload='chart-zipkin-collector', labels=["dapr"])

### HASHICORP VAULT  #######################################################################
# helm_remote('vault',
#             repo_url='https://helm.releases.hashicorp.com',
#             namespace='hashicorp-vault',
#             create_namespace=True
# )
# k8s_resource(workload='vault-agent-injector', labels=["vault"])
# k8s_resource(workload='vault', port_forwards='3301:8200', labels=["vault"])

### Monitoring  #######################################################################
k8s_yaml('infra/monitoring/prometheus/monitoring.coreos.com_prometheuses.yaml') # FIX https://github.com/prometheus-community/helm-charts/issues/1500#issuecomment-969149744
helm_remote('kube-prometheus-stack',
    repo_url='https://prometheus-community.github.io/helm-charts',
    namespace='monitoring',
    create_namespace=True,
    values="./infra/monitoring/prometheus/values.yaml"
)

k8s_resource(workload='kube-prometheus-stack-prometheus-node-exporter', labels=["monitoring"])
k8s_resource(workload='kube-prometheus-stack-kube-state-metrics', labels=["monitoring"])
k8s_resource(workload='kube-prometheus-stack-operator', labels=["monitoring"])
k8s_resource(workload='kube-prometheus-stack-grafana', port_forwards='3302:3000', labels=["monitoring"])