k8s_yaml(kustomize('./infra/kustomize/overlays/local'))

k8s_resource(workload='democracy-api-depl', port_forwards='3001:3000')
k8s_resource(workload='bundestagio-depl', port_forwards='3100:3100')