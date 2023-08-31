struct Out {
    @builtin(position) pos: vec4<f32>,
    @location(0) fragPosition: vec2<f32>,
    @location(1) fragUv: vec2<f32>,
}
@vertex
fn main(
    @location(0) pos: vec2<f32>,
    @location(1) uv: vec2<f32>
) -> Out {
    var output: Out;
    output.pos = vec4<f32>(pos, 0., 1.);
    output.fragPosition = pos;
    output.fragUv = uv;
    return output;
}
