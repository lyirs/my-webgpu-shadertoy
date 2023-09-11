import {
  EditorState,
  StateEffect,
  StateField,
  Transaction,
} from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { Completion } from "@codemirror/autocomplete";
import { IndentContext } from "@codemirror/language";

/*
 * =================================================================
 * 自定义主题
 * =================================================================
 */
export const myTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#1a1a1a",
  },
  ".cm-gutter": {
    backgroundColor: "#000",
  },
  ".cm-activeLineGutter": {
    // 当前行 边框
    backgroundColor: "#4169E1",
    color: "#fff",
  },
  ".cm-selectionBackground": {
    background: "#808080 !important",
  },
  ".cm-foldGutter": {
    backgroundColor: "#000",
    width: "15px",
    color: "#fff",
  },
  ".ͼd": {
    // 数字
    color: "#ff0",
  },
  ".ͼb": {
    // 关键词
    color: "#1E90FF",
  },
  ".ͼk": {
    // 变量
    color: "#ADD8FF",
  },
  ".cm-line:nth-child(1)": {
    color: "#F0E68C",
  },
  ".cm-line:nth-child(1) .ͼd": {
    color: "#FF4500",
  },
  ".cm-line:nth-child(1) .ͼb": {
    color: "#FFA500",
  },
  ".cm-line:nth-child(1) .ͼi": {
    color: "#085",
  },
  // ".cm-line:nth-child(1) .ͼk": {
  //   color: "#FF4500",
  // },
  ".cm-line:nth-child(2)": {
    color: "#F0E68C",
  },
  ".cm-line:nth-child(2) .ͼd": {
    color: "#FF4500",
  },
  ".cm-line:nth-child(2) .ͼb": {
    color: "#FFA500",
  },
  ".cm-line:nth-child(2) .ͼi": {
    color: "#085",
  },
  // ".cm-line:nth-child(2) .ͼk": {
  //   color: "#FF4500",
  // },
  ".cm-line:nth-child(3)": {
    color: "#F0E68C",
  },
  ".cm-line:nth-child(3) .ͼd": {
    color: "#FF4500",
  },
  ".cm-line:nth-child(3) .ͼb": {
    color: "#FFA500",
  },
  ".cm-line:nth-child(3) .ͼi": {
    color: "#085",
  },
  // ".cm-line:nth-child(3) .ͼk": {
  //   color: "#FF4500",
  // },
  ".cm-tooltip-autocomplete": {
    backgroundColor: "#282c34",
  },
});

/*
 * =================================================================
 * 禁用某行编辑
 * =================================================================
 */
export const preventEditOnLines = (
  updatePipeline: (fragWGSL: string, bindGroup: GPUBindGroupLayout) => void,
  bindGroupLayout: GPUBindGroupLayout,
  lineNumbers: number[]
) => {
  return EditorState.changeFilter.of((tr: Transaction) => {
    let isChangeAllowed = true;
    tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
      let startLine = tr.startState.doc.lineAt(fromA).number;
      let endLine = tr.startState.doc.lineAt(toA).number;
      for (let lineNumber of lineNumbers) {
        if (startLine <= lineNumber && endLine >= lineNumber) {
          isChangeAllowed = false; // Cancel the change if it affects the specified line
          break;
        }
      }
    });
    if (isChangeAllowed && tr.docChanged) {
      const newFragWGSL = tr.newDoc.toString();
      updatePipeline(newFragWGSL, bindGroupLayout);
    }
    return isChangeAllowed; // Allow other changes
  });
};
/*
 * =================================================================
 * 缩进设置
 * =================================================================
 */
export const myIndentation = (context: IndentContext, pos: number) => {
  const prevLine = context.lineAt(pos - 1);
  const match = prevLine.text.match(/^(\s*)/); // 匹配行开始的空白字符
  const prevIndent = match ? match[0].length : 0;

  if (prevLine.text.trimEnd().endsWith("{")) {
    return prevIndent + 4; // 在上一行的缩进基础上增加4个空格
  }

  return null; // 返回 null 表示使用默认的缩进逻辑
};

/*
 * =================================================================
 * 折叠设置
 * =================================================================
 */
export const myFold = (
  state: EditorState,
  lineStart: number,
  lineEnd: number
) => {
  if (lineStart === 0) {
    // 如果是第一行
    const endPos = state.doc.line(3).to; // 获取第8行的结束位置
    return { from: 0, to: endPos }; // 返回折叠的范围
  }
  return null; // 对于其他行，不返回折叠范围
};

/*
 * =================================================================
 * 自动补全
 * =================================================================
 */
// 光标设置
export const insertSetting = (
  view: EditorView,
  completion: Completion,
  from: number,
  to: number
) => {
  const insertText = "vec2<f32>(|)";
  const cursorPos = insertText.indexOf("|");
  const actualText = insertText.replace("|", "");
  view.dispatch({
    changes: { from, to, insert: actualText },
    selection: { anchor: from + cursorPos },
  });
};

const completions = [
  { label: "vec2<f32>", type: "keyword" },
  { label: "vec3<f32>", type: "keyword" },
  { label: "vec4<f32>", type: "keyword" },
  { label: "vec2<u32>", type: "keyword" },
  { label: "vec3<u32>", type: "keyword" },
  { label: "vec4<u32>", type: "keyword" },
  { label: "vec2<f32>()", type: "keyword", apply: insertSetting },
  { label: "vec3<f32>()", type: "keyword", apply: insertSetting },
  { label: "vec4<f32>()", type: "keyword", apply: insertSetting },
  { label: "iTime", type: "variable" },
  { label: "iMouse", type: "variable" },
  { label: "iResolution", type: "variable" },
  { label: "fragPosition", type: "variable" },
  { label: "fragUv", type: "variable" },
  { label: "let", type: "keyword" },
  { label: "var", type: "keyword" },
  { label: "const", type: "keyword" },
  { label: "f32", type: "keyword" },
  { label: "i32", type: "keyword" },
  { label: "u32", type: "keyword" },
];

export const myCompletions = (context: {
  matchBefore: (arg0: RegExp) => any;
  explicit: any;
  pos: any;
}) => {
  let before = context.matchBefore(/\w+/);
  if (!context.explicit && !before) return null;
  return {
    from: before ? before.from : context.pos,
    options: completions,
    validFor: /^\w*$/,
  };
};

/*
 * =================================================================
 * 关键词单独主题
 * =================================================================
 */
// 1. 定义装饰效果
const addKeywordDecoration = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});
// 2. 定义状态字段
export const keywordDecorationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    if (tr.docChanged) {
      let effects = [];
      const keywords = [
        { regex: /iTime/g },
        { regex: /iMouse/g },
        { regex: /iResolution/g },
        { regex: /@fragment/g },
      ];
      for (const keyword of keywords) {
        let match;
        while ((match = keyword.regex.exec(tr.newDoc.toString()))) {
          effects.push(
            addKeywordDecoration.of({
              from: match.index,
              to: match.index + match[0].length,
            })
          );
        }
        if (effects.length) {
          for (let e of effects) {
            decorations = decorations.update({
              add: [keywordDecorationMark.range(e.value.from, e.value.to)],
            });
          }
        }
      }
    } else {
      for (let e of tr.effects) {
        if (e.is(addKeywordDecoration)) {
          decorations = decorations.update({
            add: [keywordDecorationMark.range(e.value.from, e.value.to)],
          });
        }
      }
    }

    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});
// 3. 定义装饰样式
const keywordDecorationMark = Decoration.mark({
  class: "cm-keyword-decorated",
});
//
export const keywordDecorationTheme = EditorView.baseTheme({
  ".cm-keyword-decorated .ͼk": { color: "#ff4500" }, // 为关键词设置背景色
  ".cm-keyword-decorated": { color: "#ff0000" },
});

export const decorateKeywords = (view: EditorView) => {
  let effects = [];
  const keywords = [
    { regex: /iTime/g },
    { regex: /iMouse/g },
    { regex: /iResolution/g },
    { regex: /@fragment/g },
  ];
  for (const keyword of keywords) {
    let match;
    while ((match = keyword.regex.exec(view.state.doc.toString()))) {
      effects.push(
        addKeywordDecoration.of({
          from: match.index,
          to: match.index + match[0].length,
        })
      );
    }
    if (!effects.length) return false;
    if (!view.state.field(keywordDecorationField, false))
      effects.push(
        StateEffect.appendConfig.of([
          keywordDecorationField,
          keywordDecorationTheme,
        ])
      );
    view.dispatch({ effects });
  }
  return true;
};

// let transaction = view.state.update({ changes: { from: 0, insert: "0" } });
// view.dispatch(transaction);
// EditorState.readOnly.of(true),
// EditorView.editable.of(false),
