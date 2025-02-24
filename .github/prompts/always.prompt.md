# Broject basics

- if you want to run commands
  - always use `devbox run` to execute commands
  - the packagemanager is pnpm for node packages
  - use always --filter when u want to run somethin in a package
- Docker commands run without devbox
  - a mongo db (DB_URL) you can start via `docker compose up mongo`
  - build a docker image like this `docker build --build-arg SERVICE=PACKANGE_NAME --build-arg SERVICE_PATH=services/cron-jobs/SERVICE_DIR -t PACKAGE_NAME:latest -f services/cron-jobs/SERVICE_DIR/Dockerfile .`
    - always from repository root
- its an pnpm monorepo
- with turbo repo
