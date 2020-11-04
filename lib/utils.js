function addVersionToShaderSource(source) {
	return "#version 300 es\n" + source;
}
function createShader(gl, type, source) {
	source = addVersionToShaderSource(source);
	let shader = gl.createShader(type); // type is 'gl.VERTEX_SHADER' or 'gl.FRAGMENT_SHADER'
	gl.shaderSource(shader, source); // specify the shader source
	gl.compileShader(shader); // compile the shader
	let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}
function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}
	console.log(gl.getProgramInfoLog(program)); // eslint-disable-line
	gl.deleteProgram(program);
	return undefined;
}
