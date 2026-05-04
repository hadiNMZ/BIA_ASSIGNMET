# BIA Assignment

This project is an assignment for the Syrian Virtual University, Term S25.

Subject: BIA - Intelligent Algorithm

## Tutor:
Issam Mohamad Salman

## Assignees

| Name | ID | Arabic Name | Class | GitHub Profile |
| --- | --- | --- | --- | --- |
| Abdulhade Al Ahmad | abdulhade_215220 | عبد الهادي الاحمد | C5 | [AbdulhadeAhmad](https://github.com/AbdulhadeAhmad) |
| Lara Daoud | Lara_261114 | لارا داود | C4 | [laradaood04](https://github.com/laradaood04) |
| Hadi Nouaman | Hadi_190304 | هادي نعمان | C4 | [hadiNMZ](https://github.com/hadiNMZ) |
| Nour Kurdi | nour_190317 | نور كردي | C4 | [nourkurdi1122](https://github.com/nourkurdi1122) |
| Naser Dakhel | naser_156470 | ناصر داخل | C4 | [naser-da](https://github.com/naser-da) |

---

## Live Project URLs:


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

The local frontend will be available here:

```text
http://127.0.0.1:5173
```

Frontend requests to `/api` are proxied to the API container.

Local Swagger docs:

```text
http://127.0.0.1:8050/docs
```

To stop it:

```bash
docker compose down
```
