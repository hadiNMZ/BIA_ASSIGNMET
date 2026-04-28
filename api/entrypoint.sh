#!/usr/bin/env sh
set -eu

uv run uvicorn main:app --host 0.0.0.0 --port 8000
