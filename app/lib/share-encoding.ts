function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function encodeSharePayload(value: unknown): string {
  const serialized = JSON.stringify(value);
  const bytes = new TextEncoder().encode(serialized);
  return encodeURIComponent(bytesToBase64(bytes));
}

export function decodeSharePayload(encoded: string): unknown {
  const base64 = decodeURIComponent(encoded);
  const bytes = base64ToBytes(base64);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as unknown;
}
