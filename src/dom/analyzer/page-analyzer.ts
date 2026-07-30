export interface PageSummaryResult {
  pageUrl: string;
  title: string;
  textSummary: string;
  formCount: number;
  interactiveSelectors: string[];
}

export class PageAnalyzer {
  public analyzeCurrentPage(): PageSummaryResult {
    const title = document.title || 'Untitled Page';
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent?.trim())
      .filter(Boolean)
      .slice(0, 10)
      .join(' | ');

    const paragraphText = Array.from(document.querySelectorAll('p'))
      .map(p => p.textContent?.trim())
      .filter(Boolean)
      .slice(0, 8)
      .join(' ');

    const textSummary = `Title: ${title}\nHeadings: ${headings}\nParagraph Extract: ${paragraphText.slice(0, 1500)}`;

    const formCount = document.querySelectorAll('form').length;

    const interactiveSelectors = Array.from(
      document.querySelectorAll('button, a[href], input[type="submit"]')
    )
      .slice(0, 15)
      .map(el => {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
          const firstClass = el.className.trim().split(/\s+/)[0];
          if (firstClass) return `.${firstClass}`;
        }
        return el.tagName.toLowerCase();
      });

    return {
      pageUrl: window.location.href,
      title,
      textSummary,
      formCount,
      interactiveSelectors,
    };
  }
}
