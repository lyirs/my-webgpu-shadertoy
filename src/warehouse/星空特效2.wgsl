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
    var mouse = (iMouse.xy / iResolution.xy) - 0.5;
    var gradient = uv.y;

    // var m = Layer(uv * 5.0);
    var m: f32 = 0.0;
    var t = iTime * .1;

    // 旋转效果
    var s = sin(t);
    var c = cos(t);
    var rot = mat2x2(c, -s, s, c);
    uv *= rot;
    mouse *= rot;

    // 3D效果
    for (var i = 0.0 ; i < 1.0; i += 1.0 / 4.0) {
        var z = fract(i + t);  // 重用图层
        var size = mix(10.0, 0.05, z);
        var fade = S(0.0, 0.5, z) * S(1.0, 0.8, z); // 淡入淡出
        m += Layer(uv * size + i * 20. - mouse) * fade;
    }

    // 上色
    var base = sin(t * 5. * vec3(0.345, 0.456, 0.657)) * 0.4 + 0.6;
    var color = m * base;

    // 背景光
    color -= gradient * base;

    return vec4<f32>(color, 1.0);
}

fn S(a: f32, b: f32, t: f32) -> f32 {
    return smoothstep(a, b, t);
}

fn Distline(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    var pa: vec2<f32> = p - a;
    var ba = b - a;
    var t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
}

fn Line(p: vec2<f32>, a: vec2<f32>, b: vec2<f32>) -> f32 {
    var d = Distline(p, a, b);
    var m = S(0.03, 0.01, d);
    var d2 = length(a - b);
    m *= S(1.2, 0.8, d2) * 0.5 + S(0.05, 0.03, abs(d2 - 0.75));  // 两点距离为0.75时，会出现小闪烁
    return m;
}

fn N21(p: vec2<f32>) -> f32 {
    var p0 = fract(p * vec2(233.344, 851.73));
    p0 += dot(p0, p0 + 23.45);
    return fract(p0.x * p0.y);
}

fn N22(p: vec2<f32>) -> vec2<f32> {
    let n = N21(p);
    return vec2<f32>(n, N21(p + n));
}

fn GetPos(id: vec2<f32>, offs: vec2<f32>) -> vec2<f32> {
    var n = N22(id + offs) * iTime;
    return offs + sin(n) * 0.4;
}

fn Layer(uv: vec2<f32>) -> f32 {
    var m: f32 = 0.0;
    var gv: vec2<f32> = fract(uv) - 0.5;
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

        // 点的特效
        var j = (p[i] - gv) * 20.0;
        // var sparkle = 1.0 / length(j);
        var sparkle = 1.0 / dot(j, j);
        m += sparkle * (sin(t + fract(p[i].x) * 10.0) * 0.5 + 0.5);
    }
    m += Line(gv, p[1], p[3]);  // 1、3、5、7格子的点也要连线
    m += Line(gv, p[1], p[5]);
    m += Line(gv, p[7], p[3]);
    m += Line(gv, p[7], p[5]);

    return m;
}