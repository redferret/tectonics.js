'use strict';



function World(parameters) {
	this.grid = parameters['grid'] || stop('missing parameter: "grid"');

	this.material_viscosity = parameters['material_viscosity'] || {
		mantle: 1.57e17, // m/s per kiloPascal
	};

	// all densities in T/m^3
	this.material_density = parameters['material_density'] || {
		// most values are estimates from looking around wolfram alpha
		fine_sediment: 1.500,
		coarse_sediment: 1.500,
		sediment: 1.500,
		sedimentary: 2.600,
		metamorphic: 2.800,
		felsic_plutonic: 2.600,
		felsic_volcanic: 2.600,
		mafic_volcanic_min: 2.890, // Carlson & Raskin 1984
		mafic_volcanic_max: 3.300,
		mantle: 3.075, // derived empirically using isostatic model
		ocean: 1.026,
	};

	this.material_reflectivity = parameters['material_reflectivity'] || {
	    ocean:  	0.06,
	    felsic:  	0.27,
	    forest:  	0.1,
	    ice:  		0.8,
	};

	this.surface_gravity = parameters['surface_gravity'] || 9.8; // m/s^2

	this.radius = parameters['radius'] || 6367e3; // meters

	this.age = parameters['age'] || 0; // megayears

	this.orbit = new Orbit(parameters);
	this.lithosphere = new Lithosphere(parameters);
	this.hydrosphere = new Hydrosphere(parameters);
	this.atmosphere = new Atmosphere(parameters);
	this.biosphere = new Biosphere(parameters);

	this.lithosphere.setDependencies({
		'surface_gravity'		: this.surface_gravity,
		'sealevel'				: this.hydrosphere.sealevel,
		'material_density'		: this.material_density,
		'material_viscosity'	: this.material_viscosity,
	});
	this.hydrosphere.setDependencies({
		'surface_temp'			: this.atmosphere.surface_temp,
		'displacement'			: this.lithosphere.displacement,
		'material_density'		: this.material_density,
	});
	this.atmosphere.setDependencies({
		'material_reflectivity'	: this.material_reflectivity,
		'displacement' 			: this.lithosphere.displacement, //TODO: convert this to elevation
		'sealevel' 				: this.hydrosphere.sealevel,
		'ice_coverage' 			: this.hydrosphere.ice_coverage,
		'ocean_coverage'		: this.hydrosphere.ocean_coverage,
		'plant_coverage'		: this.biosphere.plant_coverage,
		'mean_anomaly' 			: this.orbit.mean_anomaly,
		'axial_tilt' 			: this.orbit.axial_tilt,
		'angular_speed' 		: this.orbit.angular_speed,
		'incident_radiation' 	: this.orbit.incident_radiation,
	});
	this.biosphere.setDependencies({
		'surface_temp'	: this.atmosphere.surface_temp,
		'precip'		: this.atmosphere.precip,
	});

	this.initialize = function() {
		// WARNING: order matters! (sorry, I'm working on it!)
		this.lithosphere.initialize();
		this.hydrosphere.initialize();
		this.atmosphere.initialize();
		this.biosphere.initialize();
	}
	this.update = function(timestep){
		if (timestep === 0) {
			return;
		};

		this.orbit.invalidate();
		this.lithosphere.invalidate();
		this.hydrosphere.invalidate();
		this.atmosphere.invalidate();
		this.biosphere.invalidate();

		// NOTE: update all non-constant, non-spatial dependencies
		this.atmosphere.setDependencies({
			'mean_anomaly' 	: this.orbit.mean_anomaly,
			'axial_tilt' 	: this.orbit.axial_tilt,
			'angular_speed' : this.orbit.angular_speed,
		});

		this.orbit.calcChanges(timestep);
		this.lithosphere.calcChanges(timestep);
		this.hydrosphere.calcChanges(timestep);
		this.atmosphere.calcChanges(timestep);
		this.biosphere.calcChanges(timestep);

		this.orbit.applyChanges(timestep);
		this.lithosphere.applyChanges(timestep);
		this.hydrosphere.applyChanges(timestep);
		this.atmosphere.applyChanges(timestep);
		this.biosphere.applyChanges(timestep);
	};
	return this;
}