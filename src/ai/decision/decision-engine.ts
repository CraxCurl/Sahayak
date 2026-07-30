import { SahayakActionManifest, SahayakAction } from '@shared/types/ai-actions';

export interface DecisionEngineConfig {
  minConfidenceThreshold: number;
  maxActionsPerPage: number;
  priorityOrder: Array<SahayakAction['type']>;
}

export const DEFAULT_DECISION_CONFIG: DecisionEngineConfig = {
  minConfidenceThreshold: 0.7,
  maxActionsPerPage: 15,
  priorityOrder: [
    'ACCESSIBILITY_ENHANCE',
    'AUTOFILL_FORM',
    'SIMPLIFY_TEXT',
    'INJECT_CSS',
    'HIGHLIGHT_ELEMENT',
    'HIDE_ELEMENT',
  ],
};

export class AIDecisionEngine {
  private config: DecisionEngineConfig;

  constructor(config: Partial<DecisionEngineConfig> = {}) {
    this.config = { ...DEFAULT_DECISION_CONFIG, ...config };
  }

  /**
   * Refines a raw SahayakActionManifest by filtering low-confidence actions,
   * deduplicating selectors, resolving conflicting actions, and ranking by priority.
   */
  public processManifest(manifest: SahayakActionManifest): SahayakActionManifest {
    let actions = manifest.actions || [];

    // 1. Filter out actions below confidence threshold
    actions = actions.filter(action => action.confidence >= this.config.minConfidenceThreshold);

    // 2. Resolve conflicts (e.g., HIDE vs HIGHLIGHT on same selector)
    actions = this.resolveConflicts(actions);

    // 3. Deduplicate actions by type and selector
    actions = this.deduplicateActions(actions);

    // 4. Sort actions by priority order
    actions = this.sortActionsByPriority(actions);

    // 5. Cap to maximum actions allowed
    actions = actions.slice(0, this.config.maxActionsPerPage);

    return {
      ...manifest,
      actions,
    };
  }

  private resolveConflicts(actions: SahayakAction[]): SahayakAction[] {
    const selectorActionTypesMap = new Map<string, Set<string>>();

    // Map out all action types for each selector
    actions.forEach(action => {
      const existing = selectorActionTypesMap.get(action.selector) || new Set();
      existing.add(action.type);
      selectorActionTypesMap.set(action.selector, existing);
    });

    return actions.filter(action => {
      const types = selectorActionTypesMap.get(action.selector);
      if (!types) return true;

      // If an element is set to HIDE, drop HIGHLIGHT or SIMPLIFY on the same element
      if (types.has('HIDE_ELEMENT') && action.type !== 'HIDE_ELEMENT') {
        return false;
      }

      return true;
    });
  }

  private deduplicateActions(actions: SahayakAction[]): SahayakAction[] {
    const seen = new Set<string>();
    return actions.filter(action => {
      const key = `${action.type}:${action.selector}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortActionsByPriority(actions: SahayakAction[]): SahayakAction[] {
    return [...actions].sort((a, b) => {
      const priorityA = this.config.priorityOrder.indexOf(a.type);
      const priorityB = this.config.priorityOrder.indexOf(b.type);
      return (priorityA === -1 ? 99 : priorityA) - (priorityB === -1 ? 99 : priorityB);
    });
  }
}
