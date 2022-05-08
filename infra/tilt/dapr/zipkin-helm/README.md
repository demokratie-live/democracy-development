# zipkin-helm
A helm chart for zipkin

## usage

### Adding the repo 

`helm repo add zipkin-helm https://financial-times.github.io/zipkin-helm/docs`

### Installing

`helm install -f my-cassandra-config.yaml https://financial-times.github.io/zipkin-helm/docs/zipkin-helm-0.1.1.tgz`

## values

Example

```
cassandra:
  username: zipkinuser
  password: my-super-secret-password
  contactPoints: cassandra-1.me.com,cassandra-2.me.com

ingress:
  host: zipkin.example.com

configmap:
  localdc:
    name: cassandra # use this notation if you want to reuse values from existing configmaps, this takes precedence over the .cassandra field
    key: local.dc
```

## Releasing

### Package the new version

1. Change the version in the `Chart.yaml` file to the new version
2. `helm package -d docs/ .`
3. `helm repo index docs --url https://financial-times.github.io/zipkin-helm/docs/`
4. Commit the changes
5. Make a new release on github
6. `git commit -m 'rebuild pages' --allow-empty && git push`

## Gotchas

#### collectors and ui readiness probe doesn't pass

##### Problem

My collector and ui pods are never coming into service as the readiness probes are not passing.

e.g.
```
foiled-labradoodle-zipkin-cassandra-0                           1/1       Running                      0          8m
foiled-labradoodle-zipkin-collector-6dff48b6df-crl4z            0/1       Running                      0          3m
foiled-labradoodle-zipkin-collector-6dff48b6df-m4v8t            0/1       Running                      0          3m
foiled-labradoodle-zipkin-collector-6dff48b6df-rrwdb            0/1       Running                      0          3m
foiled-labradoodle-zipkin-ui-7bdf9c6c96-jh7vq                   0/1       Running                      0          3m
```

##### Explanation

This can happen for some reason when cassandra comes up before any of the collectors/ui pods.

##### Solution
Try restarting the pods:

```
kubectl delete po -l app=zipkin-collector
kubectl delete po -l app=zipkin-ui
```
