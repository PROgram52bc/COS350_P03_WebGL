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
function parsePly(text) {
	// a really dirty and buggy ply parser that does not support anything but some very simple vertex and faces
	let lines = text.split("\n");
	let vertexArray = []; // contains 3d points to be pushed rasterized as triangles
	let header = true;
	let vertices = [];
	let numVertices = 0;
	let numFaces = 0;
	let faceCount = 0;
	for (let line of lines) {
		line = line.trim();
		if (header) {
			// parse header
			if (line == "end_header") {
				header = false;
			} else if (line.startsWith("element vertex")) {
				// parse an element count
				numVertices = parseInt(line.split(" ")[2]);
			} else if (line.startsWith("element face")) {
				// parse an element count
				numFaces = parseInt(line.split(" ")[2]);
			}
			continue;
		} else {
			if (vertices.length < numVertices) {
				let vertex = line.split(/\s+/).map(parseFloat);
				vertices.push(vertex);
			} else if (faceCount < numFaces) {
				// parse faces
				let [count, ...points] = line.split(/\s+/).map(parseFloat);
				if (count == 3) {
					vertexArray.push(...vertices[points[0]]);
					vertexArray.push(...vertices[points[1]]);
					vertexArray.push(...vertices[points[2]]);
				} else if (count == 4) {
					vertexArray.push(...vertices[points[0]]);
					vertexArray.push(...vertices[points[1]]);
					vertexArray.push(...vertices[points[2]]);
					vertexArray.push(...vertices[points[0]]);
					vertexArray.push(...vertices[points[2]]);
					vertexArray.push(...vertices[points[3]]);
				} else {
					console.log(
						`Don't know how to parse face with ${count} points`
					);
				}
			}
		}
	}
	return vertexArray;
}
function lookupLocations(gl, program, locationInfo) {
	const locations = {};
	for (l of locationInfo) {
		switch (l.type) {
			case "uniform":
				locations[l.name] = gl.getUniformLocation(program, l.name);
				break;
			case "attribute":
				locations[l.name] = gl.getAttribLocation(program, l.name);
				break;
			default:
				console.log(
					`don't know how to get address with type ${l.type}`
				);
				return;
		}
	}
	return locations;
}
