@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> size: vec2<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    var uv = fragUv * 2.0 - 1.0;
    uv.x *= size.x / size.y;
    var d = length(uv);
    var color = palette(d + iTime);
    d = sin(d * 8.0 + iTime) / 8.0;
    d = abs(d);
    // d = smoothstep(0.0, 0.1, d);
    d = 0.02 / d;
    color *= d;
    return vec4<f32>(color, 1.0);
}

fn palette(t: f32) -> vec3<f32> {
    let a = vec3(0.5, 0.5, 0.5);
    let b = vec3(0.5, 0.5, 0.5);
    let c = vec3(1.0, 1.0, 1.0);
    let d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
}
