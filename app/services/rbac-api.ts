import client from "~/services/api-client";

interface ApiEnvelope<T> {
  code: number;
  data: T;
  message?: string;
}

export async function rbacGet<T>(path: string): Promise<T> {
  const res = await client.get<ApiEnvelope<T>>(path);
  return res.data.data;
}

export async function rbacPost<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const res = await client.post<ApiEnvelope<T>>(path, body);
  return res.data.data;
}

export async function rbacPut<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const res = await client.put<ApiEnvelope<T>>(path, body);
  return res.data.data;
}

export async function rbacDelete(path: string): Promise<void> {
  await client.delete(path);
}
