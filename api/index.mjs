import { handleApi } from "./core.mjs";

export default async function handler(request, response) {
  let body = "";
  if (typeof request.body === "string") body = request.body;
  else if (request.body && typeof request.body === "object") body = JSON.stringify(request.body);
  else for await (const chunk of request) body += chunk;
  const result = await handleApi({
    method: request.method,
    url: request.url,
    headers: request.headers,
    body,
  });
  Object.entries(result.headers).forEach(([key, value]) => response.setHeader(key, value));
  response.status(result.status).json(result.body);
}
