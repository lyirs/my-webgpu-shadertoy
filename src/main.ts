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

// 表示一个包含四个顶点的正方形的位置信息，每个顶点都由一个二维坐标（x，y）组成
// prettier-ignore
const squareVertices = new Float32Array([
  -1, -1, 0, 0,
  1, -1, 1, 0,
  -1, 1, 0, 1,
  -1, 1, 0, 1,
  1, -1, 1, 0,
  1, 1, 1, 1,
]);

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

const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
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
  ],
});

updatePipeline(fragWGSL, bindGroupLayout);

let startTime = Date.now();

// 渲染
const render = () => {
  const currentTime = (Date.now() - startTime) / 1000.0;
  const timeArray = new Float32Array([currentTime]);
  device.queue.writeBuffer(timeBuffer, 0, timeArray);
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

  requestAnimationFrame(render);
};
requestAnimationFrame(render);

// 编辑器
import { EditorState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { wgsl } from "@iizukak/codemirror-lang-wgsl";

let myTheme = EditorView.theme({
  "&": {
    color: "white",
    backgroundColor: "#1a1a1a",
  },
  ".cm-gutter": {
    backgroundColor: "#000",
  },
  ".cm-foldGutter": {
    backgroundColor: "#000",
  },
  ".cm-activeLineGutter": {
    // 当前行 边框
    backgroundColor: "#fff",
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
});

let state = EditorState.create({
  extensions: [
    basicSetup,
    EditorState.changeFilter.of((tr) => {
      if (tr.docChanged) {
        const newFragWGSL = tr.newDoc.toString();
        updatePipeline(newFragWGSL, bindGroupLayout);
      }
      return true;
    }),
    wgsl(),
    myTheme,
  ],
  doc: fragWGSL,
});

let view = new EditorView({
  state,
  // 编辑器 挂载的dom
  parent: document.querySelector("#editor")!,
});

// let transaction = view.state.update({ changes: { from: 0, insert: "0" } });
// view.dispatch(transaction);
