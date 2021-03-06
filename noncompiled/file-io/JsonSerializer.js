var JsonSerializer 	= {};
JsonSerializer.model = function (model, options) {
	options = options || {};
	var _seed = options['seed'] || '';
	var _random = options['random'] || new Random(parseSeed(_seed));

	var world_json = JsonSerializer.world(model._world, options);

	var model_json = {
		version: '2.0',
		random: {
		    seed: _seed,
			mt: _random.mt,
			mti: _random.mti
		},
		age: model.age,
		world: world_json,
	};

	return model_json;
}
JsonSerializer.world = function (world, options) {
	options = options || {};

	var supercontinentCycle = world.supercontinentCycle;

	var world_json = {
		plates: [],
		grid: undefined,
		supercontinentCycle: {
			duration: supercontinentCycle.duration,
			age: supercontinentCycle.age,
		},
	};

	for (var i = 0, li = world.plates.length; i < li; i++) {
		var plate = world.plates[i];
		var plate_json = JsonSerializer.plate(plate, options);
		world_json.plates.push(plate_json);
	};
	return world_json;
}
JsonSerializer.plate = function (plate, options) {
	options = options || {};
	
	// serialize non-field values to json
	var plate_json = {
		eulerPole: 				plate.eulerPole,
		angularSpeed: 			plate.angularSpeed,
		local_to_global_matrix: Base64.encode(plate.local_to_global_matrix.buffer),
	};

	// encode in base64
	plate_json.mask = Base64.encode(plate.mask.buffer);
	plate_json.crust = Base64.encode(plate.crust.buffer);

	return plate_json;
}

var JsonDeserializer = {};
JsonDeserializer.plate = function (plate_json, world, options) {
	options = options || {};

	var plate = new Plate({
		world: world,
		angularSpeed: plate_json.angularSpeed,
		eulerPole: plate_json.eulerPole,
		local_to_global_matrix: new Float32Array(Base64.decode(plate_json.local_to_global_matrix)),
		mask: Uint8Raster.FromBuffer(Base64.decode(plate_json.mask), world.grid),
		crust: new Crust({
			grid: world.grid, 
			buffer: Base64.decode(plate_json.crust)
		})
	});

	return plate;
}
JsonDeserializer.world = function (world_json, grid, options) {
	options = options || {};

	var _world = new World(
	{
		grid: grid,
		supercontinentCycle: undefined,
		plates: [],
	});

	for (var i = 0; i < world_json.plates.length; i++) {
		var plate_json = world_json.plates[i];
		var plate = JsonDeserializer.plate(plate_json, _world, options);
		_world.plates.push(plate);
	};

	_world.supercontinentCycle = new SupercontinentCycle(_world, world_json.supercontinentCycle);

	return _world;
}
JsonDeserializer.model = function (model_json, grid, options) {
	options = options || {};

	var _model = new Model();
	_model._world = JsonDeserializer.world(model_json.world, grid, options);
	_model.age = model_json.age;

	var _seed = model_json.random.seed;
	var _random = new Random(parseSeed(seed));
	_random.mt  = model_json.random.mt;
	_random.mti  = model_json.random.mti;
	return {
		model: _model,
		seed: _seed,
		random: _random
	};
}