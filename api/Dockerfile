FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_SYSTEM_PYTHON=1

COPY api/requirements.txt .

RUN uv pip install --no-cache -r requirements.txt

COPY api/ .
COPY algorithm/ algorithm/

RUN chmod +x /app/entrypoint.sh

EXPOSE 8050

ENTRYPOINT ["/app/entrypoint.sh"]
