// https://www.shadertoy.com/view/XsXXDn

@binding(0) @group(0) var<uniform> iTime: f32;

fn modGLSL(a: vec2<f32>, b: f32) -> vec2<f32> {
    return a - b * floor(a / b);
}

@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    var c: vec3<f32>;
    var l: f32;
    var z = iTime;
    for (var i = 0u; i < 3u; i++) {
        var uv: vec2<f32>;
        var p = fragUv;
        uv = p;
        p -= 0.5;
        z += 0.07;
        l = length(p);
        uv += p / l * (sin(z) + 1.0) * abs(sin(l * 9.0 - z - z));
        let val = 0.01 / length(modGLSL(uv, 1.0) - 0.5);
        c[i] = val;
    }
    return vec4<f32>(c / l, iTime);
}