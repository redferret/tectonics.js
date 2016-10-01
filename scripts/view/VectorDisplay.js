'use strict';

var vectorDisplays = {};

function ThreeJsVectorDisplay(options) {
	var min = options['min'] || '0.';
	var max = options['max'] || '1.';
	this.getField = options['getField'];
}
ThreeJsVectorDisplay.prototype.addTo = function(mesh) {};
ThreeJsVectorDisplay.prototype.removeFrom = function(mesh) {};
ThreeJsVectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement;
	var vector = material.attributes.vector.value;
	var is_member_model = plate.is_member; 

	var vector_model = this.getField(plate);
	var is_member_model = plate.is_member;
	for(var i=0, li = is_member_model.length; i<li; i++){
		var vector_i = 2*i+1;
		vector[vector_i] = is_member_model[i] === 1?  
			vector_model[i] : 
			new THREE.Vector3(0.00,0.00,0.00); 
	}
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.angularVelocity	= new ThreeJsVectorDisplay( { 
	getField: function (plate) {
		var field = [];
		var pos = plate.pos;
		var vector = plate.eulerPole.clone().multiplyScalar(1/17);
		for (var i=0, li=pos.length; i<li; ++i) {
		    field.push(vector);
		}
		return field;
	}
} );
vectorDisplays.velocity	= new ThreeJsVectorDisplay( { 
	getField: function (plate) {
		var field = [];
		var positions_model = plate.pos;
		var is_member_model = plate.is_member;
		for (var i=0, li=positions_model.length; i<li; ++i) {
			var velocity = plate.eulerPole
				.clone()
				.cross(positions_model[i])
				.normalize()
				.multiplyScalar(0.17) 
		    field.push(velocity);
		}
		return field;
	}
} );


function DataFrameVectorDisplay(options) {
	this.max = options['max'];
	this.getField = options['getField'];
}
DataFrameVectorDisplay.prototype.addTo = function(mesh) {};
DataFrameVectorDisplay.prototype.removeFrom = function(mesh) {};
DataFrameVectorDisplay.prototype.updateAttributes = function(material, plate) {
	var material, displacement;
	var vector = material.attributes.vector.value;
	var is_member_model = plate.is_member; 

	var vector_model = this.getField(plate);
	var max = this.max ||  Math.max.apply(null, VectorField.magnitude(vector_model));
	var is_member_model = plate.is_member;
	for(var i=0, li = is_member_model.length; i<li; i++){
		var start = vector[2*i];
		var end = vector[2*i+1];
		if (is_member_model[i]) {
			end.x = vector_model.x[i];
			end.y = vector_model.y[i];
			end.z = vector_model.z[i];
			end.divideScalar(10*max);
			// start.x = -end.x;
			// start.y = -end.y;
			// start.z = -end.z;
		} else {
			end.x = 0;
			end.y = 0;
			end.z = 0;
		}
	}
	material.attributes.vector.needsUpdate = true;
}
vectorDisplays.pos	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var pos = plate.grid.pos;
		return pos;
	}
} );
vectorDisplays.pos2	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationAxis( plate.eulerPole, 1 );
		var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
		return pos;
	}
} );
vectorDisplays.displacement_gradient	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var displacement = plate.displacement;
		var gradient = ScalarField.vertex_gradient(displacement, plate.grid);
		return gradient;
	}
} );
vectorDisplays.age_gradient	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var age = plate.age;
		var gradient = ScalarField.vertex_gradient(age, plate.grid);
		return gradient;
	}
} );
vectorDisplays.density_gradient	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var density = plate.density;
		var gradient = ScalarField.vertex_gradient(density, plate.grid);
		return gradient;
	}
} );
vectorDisplays.subductability_gradient	= new DataFrameVectorDisplay( { 
	getField: function (plate) {
		var subductability = getSubductability(plate);
		var gradient = ScalarField.vertex_gradient(subductability, plate.grid);
		return gradient;
	}
} );
vectorDisplays.subductability_smoothed = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			return gradient;
		} 
	} );

function DisabledVectorDisplay(options) {}
DisabledVectorDisplay.prototype.addTo = function(mesh) {
	var vector = mesh.material.attributes.vector.value;
	for(var i=0, li = vector.length; i<li; i++){
		vector[i] = new THREE.Vector3(); 
	}
};
DisabledVectorDisplay.prototype.removeFrom = function(mesh) {};
DisabledVectorDisplay.prototype.updateAttributes = function(material, plate) {}
vectorDisplays.disabled	= new DisabledVectorDisplay( {  } );
