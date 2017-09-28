'use strict';

var scalarDisplays = {};


function RealisticDisplay(shader_return_value) {
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 ocean 				= mix(OCEAN, SHALLOW, smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement));
			vec4 bedrock			= mix(MAFIC, FELSIC, felsic_fraction);
			vec4 soil				= mix(bedrock, mix(SAND, PEAT, organic_fraction), mineral_fraction);
			vec4 canopy 			= mix(soil, JUNGLE, npp);
			
			vec4 uncovered = @UNCOVERED;
			vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			vec4 ice_covered = mix(sea_covered, SNOW, ice_fraction);
			gl_FragColor = ice_covered;
			**/}))
		.replace('@UNCOVERED', shader_return_value);
}
RealisticDisplay.prototype.addTo = function(mesh) {
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
RealisticDisplay.prototype.removeFrom = function(mesh) {
	
};
RealisticDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		displacement[j] = displacement_model[buffer_array_index]; 
	}
	geometry.attributes.displacement.needsUpdate = true;
}
scalarDisplays.satellite = new RealisticDisplay('canopy');
scalarDisplays.soil = new RealisticDisplay('soil');
scalarDisplays.bedrock = new RealisticDisplay('bedrock');



function ScalarDisplay(options) {
	var color = options['color'] || 0x000000;
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scalar = options['scalar'] || 'vScalar';
	this.field = void 0;
	this.scratch = void 0;
	this.getField = options['getField'];
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(OCEAN, uncovered, 0.5);
			vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			gl_FragColor = sea_covered;
			**/}))
		.replace('@UNCOVERED', 'mix( vec4(1), vec4(color,1.), smoothstep(@MIN, @MAX, @SCALAR) )')
		.replace('@MIN', min)
		.replace('@MAX', max)
		.replace('@SCALAR', scalar);
	this._color = new THREE.Color(color);
}
ScalarDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;

	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;

	mesh.material.uniforms.color.value = this._color;
	mesh.material.uniforms.color.needsUpdate = true;
};
ScalarDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	scalar = geometry.attributes.scalar.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
	this.field = this.field || Float32Raster(plate.grid);
	this.scratch = this.scratch || Float32Raster(plate.grid);

	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	try{
		var scalar_model = this.getField(plate, this.field, this.scratch);
	} catch(ex){
		throw_once(ex);
	}
	if (scalar_model === void 0) {
		log_once("ScalarDisplay.getField() returned undefined.");
		return;
	}
	if (!(INPUT instanceof Float32Array || INPUT instanceof Uint16Array || INPUT instanceof Uint8Array)) { 
		log_once("ScalarDisplay.getField() did not return a TypedArray.");
		return;
	}

	for(var j=0, lj = displacement.length; j<lj; j++){ 
		buffer_array_index = buffer_array_to_cell[j];
		displacement[j] = displacement_model[buffer_array_index]; 
		if (scalar_model !== void 0) {
			scalar[j] = scalar_model[buffer_array_index]; 
		}
	}
	geometry.attributes.displacement.needsUpdate = true;
	if (scalar_model !== void 0) {
		geometry.attributes.scalar.needsUpdate = true;
	}
}
scalarDisplays.npp 	= new ScalarDisplay( {color: 0x00ff00, scalar: 'npp'} );
scalarDisplays.alt 	= new ScalarDisplay( {color: 0x000000, min:'sealevel', max:'maxheight', scalar: 'alt'} );



function ScalarHeatDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	var scaling = options['scaling'] || false;
	var scalar = options['scalar'] || 'vScalar';
	this.getField = options['getField'];
	this.scaling = scaling;
	this.field = void 0;
	this.scratch = void 0;
	this._fragmentShader = fragmentShaders.template
		.replace('@OUTPUT',
			_multiline(function() {/**   
			vec4 uncovered 		= @UNCOVERED;
			vec4 ocean 			= mix(OCEAN, uncovered, 0.5);
			vec4 sea_covered 	= vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
			gl_FragColor = sea_covered;
			**/}))
		.replace('@UNCOVERED', 'heat( smoothstep(@MIN, @MAX, @SCALAR) )')
		.replace('@MIN', min)
		.replace('@MAX', max)
		.replace('@SCALAR', scalar);
}
ScalarHeatDisplay.prototype.addTo = function(mesh) {
	this.field = void 0;
	this.scratch = void 0;
	mesh.material.fragmentShader = this._fragmentShader;
	mesh.material.needsUpdate = true;
};
ScalarHeatDisplay.prototype.removeFrom = function(mesh) {
	
};
ScalarHeatDisplay.prototype.updateAttributes = function(geometry, plate) {
	var geometry, displacement, scalar;
	displacement = geometry.attributes.displacement.array;
	scalar = geometry.attributes.scalar.array;
	var buffer_array_to_cell = view.grid.buffer_array_to_cell;
	var buffer_array_index; 
	var displacement_model = plate.displacement; 
	this.field = this.field || Float32Raster(plate.grid);
	this.scratch = this.scratch || Float32Raster(plate.grid);
	
	// run getField()
	if (this.getField === void 0) {
		log_once("ScalarDisplay.getField is undefined.");
		return;
	}
	try{
		var scalar_model = this.getField(plate, this.field, this.scratch);
	} catch(ex){
		throw_once(ex);
	}
	if (scalar_model === void 0) {
		log_once("ScalarDisplay.getField() returned undefined.");
		return;
	}
	if (!(INPUT instanceof Float32Array || INPUT instanceof Uint16Array || INPUT instanceof Uint8Array)) { 
		log_once("ScalarDisplay.getField() did not return a TypedArray.");
		return;
	}
	
	var max = this.scaling? Math.max.apply(null, scalar_model) || 1 : 1;
	if (scalar_model !== void 0) {
		for(var j=0, lj = displacement.length; j<lj; j++){ 
			buffer_array_index = buffer_array_to_cell[j];
			displacement[j] = displacement_model[buffer_array_index]; 
				scalar[j] = scalar_model[buffer_array_index] / max; 
		}
	}
	geometry.attributes.displacement.needsUpdate = true;
	if (scalar_model !== void 0) {
		geometry.attributes.scalar.needsUpdate = true;
	}
}
scalarDisplays.plates 	= new ScalarHeatDisplay( { min: '0.', max: '7.', 
		getField: function (world) {
			return world.plate_map;
		} 	
	} );
scalarDisplays.plate_count 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: function (world) {
			return world.plate_count;
		} 
	} );

scalarDisplays.temp 	= new ScalarHeatDisplay( { min: '-25.', max: '30.', scalar: 'temp', } );
scalarDisplays.precip = new ScalarHeatDisplay( { min: '2000.', max: '0.', scalar: 'precip', } );
scalarDisplays.age 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		getField: function (crust) {
			return crust.age;
		} 
	} );
scalarDisplays.sima 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (crust) {
			return crust.sima;
		} 
	} );
scalarDisplays.sial 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (crust) {
			return crust.sial;
		} 
	} );
scalarDisplays.thickness 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (crust) {
			return crust.thickness;
		} 
	} );
scalarDisplays.density 	= new ScalarHeatDisplay( { min: '2700.', max: '3300.',  
		getField: function (crust) {
			return crust.density;
		} 
	} );
scalarDisplays.displacement 	= new ScalarHeatDisplay( { min: '3682.', max: '12000.',  
		getField: function (crust) {
			return crust.displacement;
		}
	} );
scalarDisplays.subductability = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust) {
			return crust.subductability;
		}
	} );
scalarDisplays.pressure = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, output, scratch, iterations) {
			return TectonicsModeling.get_asthenosphere_pressure(crust.subductability, output, scratch);
		}
	} );
