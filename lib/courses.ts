import "server-only";

export type Course = {
  id: number;
  code: string;
  title: string;
  description: string;
};

export async function getCourses(): Promise<Course[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in the server environment.");
  }

  const endpoint = new URL("/rest/v1/courses", url);
  endpoint.searchParams.set("select", "id,code,title,description");
  endpoint.searchParams.set("order", "code.asc");
  const response = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(`Course query failed (HTTP ${response.status}). Check the table, key, and SELECT policy.`);
  }
  const rows: unknown = await response.json();
  if (!Array.isArray(rows) || !rows.every((row) =>
    row !== null && typeof row === "object" &&
    typeof row.id === "number" && typeof row.code === "string" &&
    typeof row.title === "string" && typeof row.description === "string"
  )) {
    throw new Error("The courses response does not match the expected schema.");
  }
  return rows as Course[];
}
