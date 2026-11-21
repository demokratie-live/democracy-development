#!/usr/bin/env bash

kubectl delete deploy/zipkin-collector
kubectl delete deploy/zipkin-ui

kubectl delete statefulsets/zipkin-cassandra

kubectl delete hpa/zipkin-collector

kubectl delete cronjobs/foiled-walrus-zipkin-dependencies-gen

kubectl delete svc/zipkin
kubectl delete svc/zipkin-cassandra
kubectl delete svc/zipkin-ui

kubectl delete storageclasses.storage.k8s.io zipkin-cassandra-storage
kubectl delete secrets zipkin
kubectl delete cm zipkin-storage

kubectl delete ing zipkin