@group(0) @binding(0) var<uniform> iTime: f32;
@group(0) @binding(1) var<uniform> iResolution: vec2<f32>;
@group(0) @binding(2) var<uniform> iMouse: vec4<f32>;
@fragment
fn main(
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
) -> @location(0) vec4<f32> {
    // https://www.shadertoy.com/view/mtyGWy
    var uv = (fragUv - 0.5) * 2.0;
    uv.x *= iResolution.x / iResolution.y;
    var uv0 = uv;
    var finalColor = vec3(0.0);

    for (var i = 0.0; i < 4.0; i += 1.0) {
        uv = fract(uv * 1.5) - 0.5;  // 用于空间重复
        var d = length(uv) * exp(-length(uv0));
        var col: vec3<f32> = palette(length(uv0) + i * 0.4 + iTime * 0.4);
        d = sin(d * 8.0 + iTime) / 8.0;
        d = abs(d);
        d = pow(0.01 / d, 1.2);  // 幂函数增加对比度
        finalColor += col * d;
    }
    return vec4<f32>(finalColor, 1.0);
}

fn palette(t: f32) -> vec3<f32> {
    let a = vec3(0.5, 0.5, 0.5);
    let b = vec3(0.5, 0.5, 0.5);
    let c = vec3(1.0, 1.0, 1.0);
    let d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
}
