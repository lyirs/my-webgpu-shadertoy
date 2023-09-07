@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> iResolution: vec2<f32>;
@group(0) @binding(2) var<uniform> iMouse: vec4<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    var pos = 0.5 - fragUv;
    var dist = 1.0 / length(pos);
    dist *= 0.1;
    dist *= iTime / 10.0;
    dist = pow(dist, 0.8);
    var col = dist * vec3(1.0, 0.5, 0.25);
    return vec4<f32>(col, 1.0);
}