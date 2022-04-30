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