@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> size: vec2<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    let uv = fragUv - 0.5;
    let color = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3<f32>(0.0, 2.0, 4.0));
    return vec4<f32>(color, 1.0);
}
