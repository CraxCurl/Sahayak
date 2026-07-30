/**
 * Tracks original HTML snippets and hidden states before DOM mutations
 * so revertAll() can restore 100% untouched DOM.
 */
export class OriginalContentMap {
  private map = new Map<HTMLElement, { innerHTML: string; originalDisplay: string }>();

  public save(el: HTMLElement): void {
    if (!this.map.has(el)) {
      this.map.set(el, {
        innerHTML: el.innerHTML,
        originalDisplay: el.style.display,
      });
    }
  }

  public revertAll(): void {
    this.map.forEach(({ innerHTML, originalDisplay }, el) => {
      if (document.body.contains(el)) {
        el.innerHTML = innerHTML;
        el.style.display = originalDisplay;
        el.style.outline = '';
        el.style.boxShadow = '';
        el.classList.remove('sahayak-highlighted-element');
      }
    });
    this.map.clear();
  }
}
