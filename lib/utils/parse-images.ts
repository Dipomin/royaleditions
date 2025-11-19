/**
 * Parse book images safely, handling various formats:
 * - JSON string: '["url1", "url2"]'
 * - Double stringified: '"[\\"url1\\", \\"url2\\"]"'
 * - Already parsed array: ["url1", "url2"]
 */
export function parseBookImages(images: string | string[] | null | undefined): string[] {
  console.log("=== parseBookImages START ===");
  console.log("Input:", images);
  console.log("Input type:", typeof images);
  
  if (!images) {
    console.log("No images, returning empty array");
    return [];
  }

  // If it's already an array, filter and return
  if (Array.isArray(images)) {
    console.log("Already an array, filtering");
    const filtered = images.filter((img) => img && typeof img === "string" && img.trim() !== "");
    console.log("Filtered result:", filtered);
    return filtered;
  }

  // If it's a direct URL
  if (typeof images === "string" && images.startsWith("http")) {
    console.log("Direct URL detected");
    return [images];
  }

  try {
    let parsed: any = images;
    let iterations = 0;
    const maxIterations = 5;

    // Keep parsing if it's still a string
    while (typeof parsed === "string" && iterations < maxIterations) {
      console.log(`String iteration ${iterations + 1}, parsing:`, parsed);
      const trimmed = parsed.trim();
      
      // Remove surrounding quotes if present
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        parsed = trimmed.slice(1, -1);
        console.log("Removed surrounding quotes:", parsed);
      }
      
      try {
        const temp = JSON.parse(parsed);
        parsed = temp;
        console.log("JSON.parse success:", parsed);
      } catch {
        console.log("JSON.parse failed, breaking loop");
        break;
      }
      
      iterations++;
    }

    console.log("After string parsing:", parsed);

    // If we got an array, parse each element recursively
    if (Array.isArray(parsed)) {
      console.log("Got array with", parsed.length, "elements");
      
      const results: string[] = [];
      
      for (let i = 0; i < parsed.length; i++) {
        const element = parsed[i];
        console.log(`Processing element ${i}:`, element, "type:", typeof element);
        
        // If element is a string that looks like JSON, parse it recursively
        if (typeof element === "string") {
          const trimmed = element.trim();
          
          // If it starts with [ or {, it's JSON - parse it
          if (trimmed.startsWith("[") || trimmed.startsWith("{") || trimmed.startsWith('"')) {
            try {
              console.log(`Element ${i} is JSON, parsing recursively`);
              const recursiveParsed = parseBookImages(element);
              console.log(`Recursive result:`, recursiveParsed);
              results.push(...recursiveParsed);
            } catch {
              console.log(`Element ${i} recursive parse failed, treating as string`);
              if (trimmed.startsWith("http")) {
                results.push(trimmed);
              }
            }
          } else if (trimmed.startsWith("http")) {
            // Direct URL
            console.log(`Element ${i} is direct URL`);
            results.push(trimmed);
          }
        }
      }
      
      console.log("Final results:", results);
      console.log("=== parseBookImages END ===");
      return results;
    }

    // If we got a single string, return as array
    if (typeof parsed === "string" && parsed.trim() !== "") {
      console.log("Single string result");
      return [parsed];
    }

    console.log("Falling back to empty array");
    return [];
  } catch (error) {
    console.error("Parse error:", error);
    // Try regex extraction as last resort
    const matches = images.toString().match(/https?:\/\/[^\s"'\]]+/g);
    console.log("Regex matches:", matches);
    return matches || [];
  }
}
