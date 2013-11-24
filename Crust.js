
function Crust(world){
	this.world = world;
}

Crust.prototype.create = function(vertex, template){
	vertex.content = new RockColumn(this.world,
		template.elevation, template.thickness, template.density);
}

Crust.prototype.isContinental = function(vertex){
	return vertex.content && vertex.content.isContinental()
}

Crust.prototype._canSubduct = function(top, bottom){
	if(top.plate.densityOffset > bottom.plate.densityOffset){
		return false;
	} else {
		return true;
	}
}

Crust.prototype.collide = function(vertex1, vertex2){
	var top, bottom;
	if(this._canSubduct(vertex1, vertex2)){
		top = vertex1;
		bottom = vertex2;
	} else {
		bottom = vertex1;
		top = vertex2;
	}
	if (true){//subducted.distanceTo(subducting) > this.world.mountainWidth / this.world.radius){
		if(this.isContinental(bottom) && this.isContinental(top)){
			this.dock(top, bottom);
		} else {
			top.content.accrete(bottom.content);
			this.destroy(bottom);
		}
	}
}

Crust.prototype._canDock = function(dockingContinent, dockedToContinent){
	if(dockedToContinent.plate.densityOffset < dockingContinent.plate.densityOffset){
		return true;
	} else {
		return false;
	}
}

Crust.prototype.dock = function(top, bottom){
	var subjugating, subjugated;
	if(this._canDock(bottom, top)){
		subjugating = top;
		subjugated = bottom;
	} else {
		subjugating = bottom;
		subjugated = top;
	}
	subjugating.plate.dock(subjugated);
}

Crust.prototype.replace = function(replaced, replacement){
	replaced.content = replacement.content;
	replaced.subductedBy = void 0;
}

Crust.prototype.destroy = function(vertex){
	vertex.content = void 0;
	vertex.subductedBy = void 0;
}