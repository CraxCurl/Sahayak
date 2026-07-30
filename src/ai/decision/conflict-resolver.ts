import { PageAdaptationManifest, UIAction } from '../schemas/page-adaptation.schema';

/**
 * Resolves action conflicts (e.g. two actions targeting the same selector)
 * and ranks actions by priority/confidence.
 */
export class ConflictResolver {
  private confidenceThreshold: number;

  constructor(confidenceThreshold = 0.5) {
    this.confidenceThreshold = confidenceThreshold;
  }

  public processManifest(manifest: PageAdaptationManifest): PageAdaptationManifest {
    const validActions = manifest.actions.filter(a => a.confidence >= this.confidenceThreshold);

    // Deduplicate actions targeting the exact same selector & type
    const seenMap = new Map<string, UIAction>();

    for (const action of validActions) {
      const key = `${action.type}:${action.selector}`;
      if (!seenMap.has(key)) {
        seenMap.set(key, action);
      } else {
        const existing = seenMap.get(key)!;
        if (action.confidence > existing.confidence) {
          seenMap.set(key, action);
        }
      }
    }

    const resolvedActions = Array.from(seenMap.values());

    return {
      ...manifest,
      actions: resolvedActions,
    };
  }
}
