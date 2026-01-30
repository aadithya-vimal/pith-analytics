// src/components/sql/CodeEditor.tsx
import Editor, { useMonaco } from "@monaco-editor/react";
import { useTheme } from "@/components/theme-provider";
import { useEffect } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
}

export function CodeEditor({ value, onChange, onRun }: CodeEditorProps) {
  const { theme } = useTheme();
  const monaco = useMonaco();

  // Configure Monaco specifically for SQL
  useEffect(() => {
    if (monaco) {
      // Define a custom theme if needed, or just use 'vs-dark' / 'light'
      monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: () => {
          var suggestions: any[] = [
            {
              label: "SELECT",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "SELECT",
            },
            {
              label: "FROM",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "FROM",
            },
            {
              label: "WHERE",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "WHERE",
            },
            {
              label: "GROUP BY",
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: "GROUP BY",
            },
          ];
          return { suggestions: suggestions };
        },
      });
    }
  }, [monaco]);

  // Handle Ctrl+Enter to Run
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div className="h-full w-full border rounded-md overflow-hidden shadow-sm">
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme={theme === "dark" ? "vs-dark" : "light"}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "all",
        }}
      />
    </div>
  );
}