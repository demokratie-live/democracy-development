# How To Contribute

1. [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Activate Docker Desktop Kubernetes
3. [Prepare Ingress](https://kubernetes.github.io/ingress-nginx/deploy/)
4. Add GitHub Credentials to pull docker images from github

`kubectl create secret docker-registry regcred --docker-server=docker.pkg.github.com --docker-username=<GITHUB_USERNAME> --docker-password=<GITHUB_TOKEN> --docker-email=<EMAIL_ADDRESS>`

5. clone democracy-development
6. run `yarn dev`
7. edit `/etc/hosts` (macOS) add

```
127.0.0.1 democracy.develop
127.0.0.1 bundestagio.develop
127.0.0.1 bio-admin.develop
127.0.0.1 democracy-api.develop
127.0.0.1 democracy-app.develop
```

8. start coding :)
