@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> iResolution: vec2<f32>;
@group(0) @binding(2) var<uniform> iMouse: vec4<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    // https://www.shadertoy.com/view/DtXfDr
    var uv = fragUv - 0.5;
    var color = vec4<f32>(0.0);
    for (var i = 0.0; i <= 5.0; i += 1.0) {
        let t = i / 5.0;
        color += line(uv, 1.0 + t, 4.0 + t, vec3<f32>(0.2 + t * 0.7, 0.2 + t * 0.4, 0.3));
    }
    return color;
}

fn line(uv: vec2<f32>, speed: f32, height: f32, col: vec3<f32>) -> vec4<f32> {
    let modified_uv = vec2<f32>(uv.x, uv.y + smoothstep(1.0, 0.0, abs(uv.x)) * sin(iTime * speed + uv.x * height) * 0.2);
    return vec4<f32>(smoothstep(0.06 * smoothstep(0.2, 0.9, abs(modified_uv.x)), 0.0, abs(modified_uv.y) - 0.004) * col, 1.0 * smoothstep(1.0, 0.3, abs(modified_uv.x)));
}