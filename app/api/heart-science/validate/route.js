import { validateHeartSceneSpec } from "../../../../lib/heart-science";

export async function POST(request) {
  try {
    const spec = await request.json();
    const result = validateHeartSceneSpec(spec);
    return Response.json(result, { status: result.ok ? 200 : 422 });
  } catch (error) {
    return Response.json(
      { ok: false, errors: ["Invalid JSON payload"], detail: error?.message || "unknown" },
      { status: 400 }
    );
  }
}
