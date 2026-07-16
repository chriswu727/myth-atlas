export const sharedArtDirection = `Use case: illustration-story
Asset type: portrait key art for a premium mythology archive website entry, vertical 3:4 composition
Primary request: Create a definitive, visually compelling depiction of the supplied Shanhaijing subject, faithful to the ancient text rather than later generic fantasy designs.
Style/medium: museum-grade mythological natural-history painting; convincing anatomy, materials, terrain, weather, and scale; restrained influence from ancient Chinese ink wash and mineral pigments fused with sophisticated cinematic realism; mysterious, sacred, and uncanny rather than game-concept cliché.
Composition/framing: a legible primary subject or environment, strong silhouette and depth, vertical portrait with safe margins for responsive website cropping.
Lighting/mood: primordial atmosphere, subtle volumetric light and mist, solemn and ancient.
Color palette: charcoal black, weathered umber, mineral jade, oxidized bronze green, bone ivory, with restrained cinnabar or gold accents where appropriate.
Constraints: follow every physical trait and narrative detail in the supplied description; no invented extra heads, limbs, horns, wings, or human figures unless explicitly described; no blood or gore; no armor or modern objects; no text, labels, border, logo, or watermark.
Avoid: generic dragon anatomy, modern horror tropes, cartoon styling, glossy 3D render, excessive saturation, decorative pseudo-Chinese symbols.`;

export function buildShanhaijingPrompt(entry) {
  const subject = entry.name?.zh ?? entry.title?.zh ?? entry.id;
  const subjectDirection = {
    "fenghuang-shanhaijing": "Render a colossal sacred phoenix with a long S-curved neck, swept-back feather crown, broad wings, and immense layered tail. Retain only a distant galliform ancestry: absolutely no fleshy comb, wattle, chicken face, squat poultry proportions, or domestic rooster stance. Encode the five virtues as abstract archaic patterns in the plumage, never as literal printed characters.",
    "nanshan-shen": "Depict exactly three collective mountain-god forms across three successive Southern Mountain ranges. First: an unmistakably complete bird body with two wings, two bird legs, and a feathered tail, bearing a Chinese dragon head; no serpentine torso. Second: a long, wingless Chinese dragon body with four small dragon limbs and a coiling tail, bearing a raptor-like bird head; no griffin body. Third: a long, wingless Chinese dragon body with four limbs and a coiling tail, bearing a solemn human face directly at the neck; no human torso, arms, or robes. Keep all three head-and-body pairings clearly legible and anatomically distinct."
  }[entry.id];
  const typeDirection = {
    creature: "Show the complete creature in its native habitat, with the described anatomy clearly readable in a poised three-quarter view.",
    deity: "Present the deity as an overwhelming sacred presence in the domain named by the text, with attributes clearly readable and no generic imperial costume unless described.",
    spirit: "Present the spirit as an uncanny numinous presence within the landscape or waters named by the text, faithful to every bodily attribute.",
    hero: "Create a narrative portrait at the defining mythic moment, preserving human scale against a vast primordial world.",
    place: "Create an environmental portrait in which the mythic geography itself is the protagonist; use inhabitants or wonders only when they clarify the description.",
    tale: "Create a single coherent narrative tableau centered on the decisive action, with layered depth rather than a collage."
  }[entry.type];

  return `${sharedArtDirection}\nSubject: ${subject}\nCanonical description: ${entry.summary.zh}\nType-specific direction: ${typeDirection}${subjectDirection ? `\nSubject-specific direction: ${subjectDirection}` : ""}`;
}
