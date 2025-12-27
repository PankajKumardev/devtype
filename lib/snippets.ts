import snippetsData from '@/data/snippets.json';

export type Language = 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'java' | 'csharp' | 'cpp';

export const languages: Language[] = ['typescript', 'javascript', 'python', 'rust', 'go', 'java', 'csharp', 'cpp'];

const snippets: Record<Language, string[]> = snippetsData as Record<Language, string[]>;

export function getRandomSnippet(language: Language): { code: string; language: Language } {
  const langSnippets = snippets[language];
  
  if (!langSnippets || langSnippets.length === 0) {
    // Fallback
    return { code: 'const hello = "world";', language: 'typescript' };
  }
  
  const code = langSnippets[Math.floor(Math.random() * langSnippets.length)];
  
  return { code, language };
}

export function getAllSnippets(): Record<Language, string[]> {
  return snippets;
}

export function getSnippetCount(): number {
  return Object.values(snippets).reduce((acc, arr) => acc + arr.length, 0);
}
