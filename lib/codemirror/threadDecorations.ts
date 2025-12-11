import { CodeThread } from '@/lib/types';
import { EditorView, ViewUpdate, Decoration, DecorationSet, WidgetType, ViewPlugin } from '@codemirror/view';
import { EditorState, StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { truncateText } from '@/lib/utils';

// Thread decoration widget
class ThreadWidget extends WidgetType {
  constructor(private color: string, private isActive: boolean) {
    super();
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = `thread-glyph-${this.color}`;
    span.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-right: 4px;
      ${this.isActive ? 'opacity: 1;' : 'opacity: 0.7;'}
    `;
    return span;
  }
}

// Helper to convert 1-indexed line/column to CodeMirror position
function getPosition(state: EditorState, line: number, column: number): number {
  try {
    const lineObj = state.doc.line(line);
    return lineObj.from + column - 1;
  } catch {
    return 0;
  }
}

// Create decoration for thread highlight
function createThreadDecoration(
  thread: CodeThread,
  isActive: boolean,
  state: EditorState
): { decoration: Decoration; from: number; to: number } {
  const from = getPosition(state, thread.startLine, thread.startColumn);
  const to = getPosition(state, thread.endLine, thread.endColumn);

  const className = `thread-highlight-${thread.color}${isActive ? ' thread-highlight-active' : ''}`;

  const decoration = Decoration.mark({
    class: className,
    attributes: {
      title: `Thread: ${truncateText(thread.messages[0]?.content || '', 50)}`,
    },
  });

  return { decoration, from, to };
}

// Create gutter decoration for thread
function createGutterDecoration(
  thread: CodeThread,
  isActive: boolean,
  state: EditorState
): { decoration: Decoration | null; from: number; to: number } {
  try {
    const line = state.doc.line(thread.startLine);
    const decoration = Decoration.widget({
      widget: new ThreadWidget(thread.color, isActive),
      side: -1,
    });

    return { decoration, from: line.from, to: line.from };
  } catch {
    return { decoration: null, from: 0, to: 0 };
  }
}

// Thread decorations state field
const threadDecorations = StateField.define<DecorationSet>({
  create(): DecorationSet {
    return Decoration.none;
  },
  update(decorations: DecorationSet, tr): DecorationSet {
    decorations = decorations.map(tr.changes);
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Effect to update thread decorations
export const setThreadDecorations = StateEffect.define<{
  threads: CodeThread[];
  activeThreadId: string | null;
}>();

// Plugin to handle thread decorations
const threadDecorationsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = Decoration.none;
    }

    update(update: ViewUpdate): void {
      for (const tr of update.transactions) {
        const threadData = tr.effects.find((e) => e.is(setThreadDecorations));
        if (threadData) {
          const { threads, activeThreadId } = threadData.value;
          const builder = new RangeSetBuilder<Decoration>();

          threads.forEach((thread) => {
            const isActive = thread.id === activeThreadId;
            try {
              const { decoration: markDeco, from, to } = createThreadDecoration(
                thread,
                isActive,
                update.state
              );
              builder.add(from, to, markDeco);

              const { decoration: gutterDeco, from: gutterFrom, to: gutterTo } =
                createGutterDecoration(thread, isActive, update.state);
              if (gutterDeco) {
                builder.add(gutterFrom, gutterTo, gutterDeco);
              }
            } catch (e) {
              // Skip invalid ranges
              console.warn('Invalid thread range:', thread, e);
            }
          });

          this.decorations = builder.finish();
        }
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export function createThreadDecorationsExtension() {
  return [threadDecorations, threadDecorationsPlugin];
}

