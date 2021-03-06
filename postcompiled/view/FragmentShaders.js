
function _multiline(f) {
  return f.toString().split('\n').slice(1, -1).join('\n');
}

var fragmentShaders = {};

fragmentShaders.realistic = `
//REALISTIC.GLSL.C GOES HERE

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_mod;

const vec4 NONE = vec4(0.0,0.0,0.0,0.0);
const vec4 OCEAN = vec4(0.04,0.04,0.2,1.0);
const vec4 SHALLOW = vec4(0.04,0.58,0.54,1.0);

const vec4 MAFIC  = vec4(50,45,50,255)/255.			// observed on lunar maria 
                  * vec4(1,1,1,1);					// aesthetic correction 
const vec4 FELSIC = vec4(190,180,185,255)/255.		// observed on lunar highlands
				  * vec4(0.6 * vec3(1,1,.66), 1);	// aesthetic correction;
//const vec4 SAND = vec4(255,230,155,255)/255.;
const vec4 SAND = vec4(245,215,145,255)/255.;
const vec4 PEAT = vec4(100,85,60,255)/255.;
const vec4 SNOW  = vec4(0.9, 0.9, 0.9, 0.9); 
const vec4 JUNGLE = vec4(30,50,10,255)/255.;
//const vec4 JUNGLE = vec4(20,45,5,255)/255.;

void main() {
	float epipelagic = sealevel - 200.0;
	float mesopelagic = sealevel - 1000.0;
	float abyssopelagic = sealevel - 4000.0;
	float maxheight = sealevel + 15000.0; 

	float lat = (asin(abs(vPosition.y)));
	
	float felsic_coverage 	= smoothstep(abyssopelagic, maxheight, vDisplacement);
	float mineral_coverage 	= vDisplacement > sealevel? smoothstep(maxheight, sealevel, vDisplacement) : 0.;
	float organic_coverage 	= degrees(lat)/90.; // smoothstep(30., -30., temp); 
	float ice_coverage 		= vIceCoverage;
	float plant_coverage 	= vPlantCoverage;
	float ocean_coverage 	= smoothstep(epipelagic * sealevel_mod, sealevel * sealevel_mod, vDisplacement);

	vec4 ocean 		= mix(OCEAN, SHALLOW, ocean_coverage);
	vec4 bedrock	= mix(MAFIC, FELSIC, felsic_coverage);
	vec4 soil		= mix(bedrock, mix(SAND, PEAT, organic_coverage), mineral_coverage);
	vec4 canopy 	= mix(soil, JUNGLE, plant_coverage);

	vec4 uncovered = @UNCOVERED;
	vec4 sea_covered = vDisplacement < sealevel * sealevel_mod? ocean : uncovered;
	vec4 ice_covered = mix(sea_covered, SNOW, ice_coverage);
	gl_FragColor = ice_covered;
}
`;

fragmentShaders.generic = `
//GENERIC.GLSL.C GOES HERE

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float sealevel_mod;

float cosh (float x){
	return exp(x)+exp(-x)/2.;
}

//converts float from 0-1 to a heat map visualtion
//credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
vec4 heat (float v) {
	float value = 1.-v;
	return (0.5+0.5*smoothstep(0.0, 0.1, value))*vec4(
		smoothstep(0.5, 0.3, value),
		value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
		smoothstep(0.4, 0.6, value),
		1
	);
}

void main() {
	float epipelagic = sealevel - 200.0;
	float mesopelagic = sealevel - 1000.0;
	float abyssopelagic = sealevel - 4000.0;
	float maxheight = sealevel + 15000.0; 
	
	@OUTPUT
}
`;

fragmentShaders.debug = `
//DEBUG.GLSL.C GOES HERE
varying float vDisplacement;
varying vec4 vPosition;

uniform  float sealevel;
uniform  vec3 color;

const vec4 BOTTOM = vec4(0.0,0.0,0.0,1.0);//rgba
const vec4 TOP = vec4(1.0,1.0,1.0,1.0);

void main() {
	float mountainMinHeight = sealevel + 5000.;
	float mountainMaxHeight = sealevel + 15000.0;
	if(vDisplacement > sealevel){
		float x = smoothstep(mountainMinHeight, mountainMaxHeight, vDisplacement);
		gl_FragColor =  mix(vec4(color, 1.0), TOP, x);
	} else if (vDisplacement > 1.){
		float x = smoothstep(-sealevel, sealevel, vDisplacement);
		gl_FragColor =  mix(BOTTOM, vec4(color*.75, 1.0), x);
	} else {
		gl_FragColor =  vec4(0,0,0,1);
	}
}
`;

fragmentShaders.vectorField = `
//VECTOR_FIELD.GLSL.C GOES HERE
void main() {
	gl_FragColor = vec4(1);
}
`;