/// <reference types="@webgpu/types" />
/// <reference types="vite/client" />
import "./style.css";
import { InitGPU } from "./helper/init";
import vertWGSL from "./shader/vert.wgsl?raw";
import fragWGSL from "./shader/frag.wgsl?raw";
import { CreateGPUBuffer } from "./helper/gpuBuffer";

const gpu = await InitGPU();
const device = gpu.device;
const canvas = gpu.canvas;
const format = gpu.format;
const context = gpu.context;

import Stats from "stats.js";
const stats = new Stats();
stats.showPanel(0);
stats.dom.style.top = "360px";
stats.dom.style.right = "0";
stats.dom.style.left = "560px";
stats.dom.style.position = "absolute";
const div = document.querySelector("#left") as HTMLElement;
div.appendChild(stats.dom);

// 表示一个包含四个顶点的正方形的位置信息，每个顶点都由一个二维坐标（x，y）组成
// prettier-ignore
const squareVertices = new Float32Array([
  // vec2 pos, vec2 uv
  -1, -1, 0, 0,
  1, -1, 1, 0,
  -1, 1, 0, 1,
  -1, 1, 0, 1,
  1, -1, 1, 0,
  1, 1, 1, 1,
]);

const resolution = new Float32Array([canvas.width, canvas.height]);

let pipeline: GPURenderPipeline;

const updatePipeline = (fragWGSL: string, bindGroup: GPUBindGroupLayout) => {
  pipeline = device.createRenderPipeline({
    // 布局
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroup],
    }),
    // 顶点着色器
    vertex: {
      module: device.createShaderModule({
        code: vertWGSL,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 4 * 4,
          attributes: [
            // pos
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x2",
            },
            // uv
            {
              shaderLocation: 1,
              offset: 2 * 4,
              format: "float32x2",
            },
          ],
        },
      ],
    },
    // 片元着色器
    fragment: {
      module: device.createShaderModule({
        code: fragWGSL,
      }),
      entryPoint: "main",
      // 输出颜色
      targets: [
        {
          format: format,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add",
            },
          },
        },
      ],
    },
    // 图元类型
    primitive: {
      topology: "triangle-list",
    },
  });
};

const squareBuffer = CreateGPUBuffer(
  device,
  squareVertices,
  GPUBufferUsage.VERTEX
);

const timeBuffer = device.createBuffer({
  size: 4, // sizeof(float)
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const sizeBuffer = device.createBuffer({
  size: 8,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const mouseBuffer = device.createBuffer({
  size: 16,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: "uniform" },
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: "uniform" },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: "uniform" },
    },
  ],
});

const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: {
        buffer: timeBuffer,
      },
    },
    {
      binding: 1,
      resource: {
        buffer: sizeBuffer,
      },
    },
    {
      binding: 2,
      resource: {
        buffer: mouseBuffer,
      },
    },
  ],
});

updatePipeline(fragWGSL, bindGroupLayout);

device.queue.writeBuffer(sizeBuffer, 0, resolution);

let mouseX = 0,
  mouseY = 0,
  mouseW = 0,
  mouseZ = 0;
gpu.canvas.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});
gpu.canvas.addEventListener("mousedown", (event) => {
  mouseW = event.clientX;
  mouseZ = event.clientY;
});

gpu.canvas.addEventListener("mouseup", () => {
  mouseW = 0;
  mouseZ = 0;
});

let startTime = Date.now();
// 渲染
const render = () => {
  stats.begin();
  const currentTime = (Date.now() - startTime) / 1000.0;
  const timeArray = new Float32Array([currentTime]);
  device.queue.writeBuffer(timeBuffer, 0, timeArray);

  const mouseArray = new Float32Array([mouseX, mouseY, mouseW, mouseZ]);
  device.queue.writeBuffer(mouseBuffer, 0, mouseArray);
  // 开始命令编码
  const commandEncoder = device.createCommandEncoder();

  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  // 设置渲染管线
  renderPass.setPipeline(pipeline);
  //
  renderPass.setVertexBuffer(0, squareBuffer);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(6, 1);
  // 结束渲染通道
  renderPass.end();
  // 提交命令
  device.queue.submit([commandEncoder.finish()]);
  stats.end();
  requestAnimationFrame(render);
};
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  const canvas = gpu.canvas as HTMLCanvasElement;
  canvas.width = 640;
  canvas.height = 360;
  const size = new Float32Array([canvas.width, canvas.height]);
  device.queue.writeBuffer(sizeBuffer, 0, size);
  updatePipeline(fragWGSL, bindGroupLayout);
});

/* =================================================================
 * 编辑器
 * =================================================================
 */
import { autocompletion } from "@codemirror/autocomplete";
import { EditorState, Line, Transaction } from "@codemirror/state";
import { KeyBinding, keymap } from "@codemirror/view";
import { wgsl } from "@iizukak/codemirror-lang-wgsl";
import { basicSetup, EditorView } from "codemirror";
import {
  myTheme,
  preventEditOnLines,
  myCompletions,
  keywordDecorationField,
  keywordDecorationTheme,
  decorateKeywords,
  myIndentation,
  myFold,
} from "./codemirror";
import { foldEffect, foldService, indentService } from "@codemirror/language";

const customTabIndent: KeyBinding = {
  key: "Tab",
  run: (view) => {
    const { from } = view.state.selection.main;
    const spacesToAdd = 4; // 您希望添加的空格数量
    const spaces = " ".repeat(spacesToAdd);
    view.dispatch({
      changes: { from, to: from, insert: spaces },
      scrollIntoView: true,
      selection: { anchor: from + spacesToAdd }, // 更新光标位置
    });
    return true;
  },
};

let state = EditorState.create({
  extensions: [
    basicSetup,
    wgsl(), // wgsl 语言支持
    myTheme, // 主题
    keymap.of([customTabIndent]), // tab 支持
    preventEditOnLines(
      updatePipeline,
      bindGroupLayout,
      [1, 2, 3, 4, 5, 6, 7, 8]
    ), // 禁止编辑
    autocompletion({ override: [myCompletions] }), // 自动补全
    keywordDecorationField, // 关键词状态字段
    keywordDecorationTheme, // 关键词主题
    indentService.of(myIndentation),
    foldService.of(myFold),
  ],
  doc: fragWGSL,
});

let view = new EditorView({
  state,
  // 编辑器 挂载的dom
  parent: document.querySelector("#editor")!,
});

// 初始化时调用
decorateKeywords(view);

const foldTransaction = view.state.update({
  effects: foldEffect.of({ from: 0, to: view.state.doc.line(3).to }),
});
view.dispatch(foldTransaction);
