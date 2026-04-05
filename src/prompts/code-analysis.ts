export function buildCodeAnalysisPrompt(
  files: { path: string; content: string }[],
  repoUrl: string,
  framework: string | undefined,
  language: string | undefined
): string {
  const fileContents = files
    .map((f) => `=== ${f.path} ===\n${f.content.slice(0, 2500)}`)
    .join('\n\n');

  return `You are a cloud efficiency expert reviewing a student project's source code for waste.
Analyze the files below for specific, concrete inefficiencies. Focus on:
- Unnecessary or redundant API/database calls (fetching more data than needed)
- Heavy dependencies imported for trivial use (e.g. lodash for one function)
- Synchronous blocking work that could be deferred or parallelised
- Large payloads being transferred when only a subset is used
- Unstreamed large responses that should be streamed
- AI model usage where a smaller/cheaper model would work
- Missing pagination on endpoints that return large lists
- Images or assets served without compression or caching headers

Return a JSON array. Each item must follow this exact shape:
{
  "title": "Short specific title mentioning the file or pattern",
  "description": "One or two sentences explaining exactly what the inefficiency is and why it matters for energy/cost",
  "impact": "HIGH" | "MEDIUM" | "LOW",
  "category": "compute" | "assets" | "dependencies" | "ci-cd" | "storage" | "networking",
  "affectedFiles": ["path/to/file.ts"]
}

STRICT RULES:
- Return ONLY a valid JSON array, nothing else. No markdown fences, no explanation text.
- Only report issues you can directly see in the code. Do not hallucinate.
- If the code looks clean, return an empty array [].
- Maximum 4 issues. Pick only the most impactful ones.
- Each title must be specific to this repo, not generic advice.

Repo: ${repoUrl}
Stack: ${framework || 'Unknown'}, ${language || 'Unknown'}

Source files to analyse:
${fileContents}`;
}
