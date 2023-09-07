@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> iResolution: vec2<f32>;
@group(0) @binding(2) var<uniform> iMouse: vec4<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    // https://www.youtube.com/watch?v=3CycKKJiwis&t=56s
    var uv = fragUv - 0.5 ;
    uv.x *= iResolution.x / iResolution.y;

    // var d = Distline(uv, vec2<f32>(0.0), vec2<f32>(1.0));
    var m = 0.0;

    uv *= 5.0;
    var gv: vec2<f32> = fract(uv) - 0.5;  // uv坐标在一个单位格子中的位置。
    var id: vec2<f32> = floor(uv);

    // var p = GetPos(id);
    // var d = length(gv - p);
    // m = S(0.1, 0.05, d);
    var p: array<vec2<f32>,9>;

    var i = 0u;
    for (var y = -1.0; y <= 1.0; y += 1.0) {
        for (var x = -1.0; x <= 1.0; x += 1.0) {
            p[i] = GetPos(id, vec2<f32>(x, y));
            i++;
        }
    }
    var t = iTime * 10.0;
    for (var i = 0u; i < 9u; i++) {  // 中间格子的点与相邻八个格子的点连线
        m += Line(gv, p[4], p[i]);

        var j = (p[i] - gv) * 20.0;
        // var sparkle = 1.0 / length(j);
        var sparkle = 1.0 / dot(j, j);
        m += sparkle * (sin(t + p[i].x * 10.0) * 0.5 + 0.5);
    }
    m += Line(gv, p[1], p[3]);  // 1、3、5、7格子的点也要连线
    m += Line(gv, p[1], p[5]);
    m += Line(gv, p[7], p[3]);
    m += Line(gv, p[7], p[5]);

    var color = vec3<f32>(m);

    // if gv.x > 0.48 || gv.y > 0.48 {   // 格子框线
    //     color = vec3<f32>(1.0, 0.0, 0.0);
    // }

    return vec4<f32>(color, 1.0);
}

fn S(a: f32, b: f32, t: f32) -> f32 {
    return smoothstep(a, b, t);
}

// 计算一个点到一个线段之间的最短距离
fn Distline(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    var pa: vec2<f32> = p - a;  // 从线段起点a到点p
    var ba = b - a; // 从线段起点a到终点b
    var t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); // 得到线段a到b上的相对位置，该位置表示p到线段ab的垂直交点的位置
    return length(pa - ba * t);
}

// 返回点p到线段a-b的“柔化”（softened）距离, 线的边缘呈现出平滑的渐变
fn Line(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    var d = Distline(p, a, b);
    var m = S(0.03, 0.01, d);
    m *= S(1.2, 0.8, length(a - b)); // 给更长或更短的线段赋予不同的视觉强度
    return m;
}

// 伪随机噪声函数 为给定的 p 产生一个范围在 [0, 1] 之间的随机值
fn N21(p: vec2<f32>) -> f32 {
    var p0 = fract(p * vec2(233.344, 851.73));
    p0 += dot(p0, p0 + 23.45);
    return fract(p0.x * p0.y);
}

// 返回一个基于N21生成的2D随机向量
fn N22(p: vec2<f32>) -> vec2<f32> {
    let n = N21(p);
    return vec2<f32>(n, N21(p + n));
}

// 返回一个基于伪随机噪声的偏移位置
fn GetPos(id: vec2<f32>, offs: vec2<f32>) -> vec2<f32> {
    var n = N22(id + offs) * iTime;
    return offs + sin(n) * 0.4;
}