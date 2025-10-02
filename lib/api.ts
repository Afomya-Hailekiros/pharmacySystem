// lib/api.ts
const API = process.env.NEXT_PUBLIC_API_URL || "";

type StudentPayload = any; // simple for now; add types later

async function handleRes(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "API error");
  return json;
}

export async function getStudents() {
  const res = await fetch(`${API}/api/v1/students`);
  const json = await handleRes(res);
  return json.data || [];
}

export async function createStudent(payload: StudentPayload) {
  const res = await fetch(`${API}/api/v1/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateStudent(id: string, payload: StudentPayload) {
  const res = await fetch(`${API}/api/v1/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteStudent(id: string) {
  const res = await fetch(`${API}/api/v1/students/${id}`, { method: "DELETE" });
  return handleRes(res);
}
