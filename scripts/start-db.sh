#!/bin/bash
container run -d \
  --name lambda-postgres \
  -e POSTGRES_USER=lambda \
  -e POSTGRES_PASSWORD=lambda \
  -e POSTGRES_DB=lambdaphysics \
  -p 5432:5432 \
  postgres:16
