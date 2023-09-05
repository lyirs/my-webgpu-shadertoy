@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> size: vec2<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    // https://www.shadertoy.com/view/Mss3Wf
    const maxIterations = 6.0;
    var circleSize = 1.0 / (3.0 * pow(2.0, maxIterations));
    var uv = fragUv - 0.5;
    uv = rot(uv, iTime);
    uv *= sin(iTime) * 0.5 + 1.5;

    var s = 0.3;
    for (var i = 0.0; i < maxIterations; i += 1.0) {
        uv = abs(uv) - s;
        uv = rot(uv, iTime);
        s = s / 2.1;
    }
    var c: f32;
    if length(uv) > circleSize {
        c = 0.0;
    } else {
        c = 1.0;
    }
    return vec4<f32>(c, c, c, 1.0);
}

fn rot(uv: vec2<f32>, a: f32) -> vec2<f32> {
    return vec2(uv.x * cos(a) - uv.y * sin(a), uv.y * cos(a) + uv.x * sin(a));
}
