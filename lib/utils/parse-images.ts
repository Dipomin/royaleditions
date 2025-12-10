/**
 * Parse book images safely, handling various formats:
 * - JSON string: '["url1", "url2"]'
 * - Double stringified: '"[\\"url1\\", \\"url2\\"]"'
 * - Already parsed array: ["url1", "url2"]
 */
export function parseBookImages(images: string | string[] | null | undefined): string[] {
  if (!images) {
    return [];
  }

  // If it's already an array, filter and return
  if (Array.isArray(images)) {
    return images.filter((img) => img && typeof img === "string" && img.trim() !== "");
  }

  // If it's a direct URL
  if (typeof images === "string" && images.startsWith("http")) {
    return [images];
  }

  try {
    let parsed: unknown = images;
    let iterations = 0;
    const maxIterations = 5;

    // Keep parsing if it's still a string
    while (typeof parsed === "string" && iterations < maxIterations) {
      const trimmed = parsed.trim();
      
      // Remove surrounding quotes if present
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        parsed = trimmed.slice(1, -1);
      }
      
      try {
        parsed = JSON.parse(parsed as string);
      } catch {
        break;
      }
      
      iterations++;
    }

    // If we got an array, parse each element recursively
    if (Array.isArray(parsed)) {
      const results: string[] = [];
      
      for (const element of parsed) {
        if (typeof element === "string") {
          const trimmed = element.trim();
          
          // If it starts with [ or {, it's JSON - parse it
          if (trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"')) {
            try {
              const recursiveParsed = parseBookImages(element);
              results.push(...recursiveParsed);
            } catch {
              if (trimmed.startsWith("http")) {
                results.push(trimmed);
              }
            }
          } else if (trimmed.startsWith("http")) {
            results.push(trimmed);
          }
        }
      }
      
      return results;
    }

    // If we got a single string, return as array
    if (typeof parsed === "string" && parsed.trim() !== "") {
      return [parsed];
    }

    return [];
  } catch {
    // Try regex extraction as last resort
    const matches = images.toString().match(/https?:\/\/[^\s"'\]]+/g);
    return matches || [];
  }
}
