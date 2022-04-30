k8s_yaml(kustomize('./infra/kustomize/overlays/local'))

k8s_resource(workload='democracy-api-depl', port_forwards='3001:3000')
k8s_resource(workload='bundestagio-depl', port_forwards='3100:3100')
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