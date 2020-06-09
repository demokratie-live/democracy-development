Install Docker Desktop
Activate Docker Desktop Kubernetes
Prepare Ingress https://kubernetes.github.io/ingress-nginx/deploy/

kubectl create secret docker-registry regcred --docker-server=docker.pkg.github.com --docker-username=<GITHUB_USERNAME> --docker-password=<GITHUB_TOKEN> --docker-email=<EMAIL_ADDRESS>
