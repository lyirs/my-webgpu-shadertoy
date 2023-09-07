@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> iResolution: vec2<f32>;
@group(0) @binding(2) var<uniform> iMouse: vec4<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    var uv = fragUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    var d = length(uv);
    d -= 0.5;
    return vec4<f32>(d, d, d, 1.0);
}
