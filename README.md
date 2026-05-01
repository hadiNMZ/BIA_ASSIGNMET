# BIA Assignment

Webpage URL: https://svu.store.abdulha.de

API Base URL: https://api.svu.store.abdulha.de

Documentation: https://api.svu.store.abdulha.de/docs

## Local Deployment

Run it locally with Docker:

```bash
docker compose up -d --build
```

The local API will be available here:

```text
http://127.0.0.1:8050
```

Local Swagger docs:

```text
http://127.0.0.1:8050/docs
```

To stop it:

```bash
docker compose down
```

## Server Deployment

This is the basic server deployment flow:

1. SSH into the server.

2. Go to the project folder:

```bash
cd /path/to/BIA_ASSIGNMET
```

3. Start the API and database:

```bash
docker compose up -d --build
```

4. The API container listens on port `8050`, and Docker binds it to `127.0.0.1:8050`.

5. Add the Nginx config:

```bash
sudo cp api/nginx.conf /etc/nginx/sites-available/bia-api
sudo ln -s /etc/nginx/sites-available/bia-api /etc/nginx/sites-enabled/bia-api
```

6. Check and reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

7. Make sure the domain points to the server:

```text
api.svu.store.abdulha.de
```

8. After deployment, check:

```text
https://api.svu.store.abdulha.de/docs
```
