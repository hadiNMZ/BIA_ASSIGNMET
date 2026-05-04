import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);
const apiBase = process.env.API_BASE || "http://127.0.0.1:8050";
const root = dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);

  if (url.pathname.startsWith("/api/")) {
    await proxyApiRequest(request, response, url);
    return;
  }

  const route =
    url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const file = normalize(join(root, route));

  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

async function proxyApiRequest(request, response, url) {
  const target = `${apiBase}${url.pathname.replace(/^\/api/, "")}${url.search}`;
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    if (value && !["host", "connection", "content-length"].includes(key)) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }

  try {
    const apiResponse = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method || "GET") ? undefined : request,
      duplex: "half",
    });

    response.writeHead(apiResponse.status, Object.fromEntries(apiResponse.headers));
    response.end(Buffer.from(await apiResponse.arrayBuffer()));
  } catch {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ detail: "Could not reach live API" }));
  }
}

server.listen(port, host, () => {
  console.log(`Frontend server running at http://${host}:${port}`);
  console.log(`Proxying /api requests to ${apiBase}`);
});
