const float PI = 3.14;
const float OCEAN = 0.0;
const float LAND = 0.005;
const float NONE = 0.0;
const float INDEX_SPACING = PI * 0.75; // anything from 0.0 to 2.*PI

attribute float displacement;
attribute float plant_coverage;
attribute float ice_coverage;
attribute float scalar;
attribute vec3 vector;

varying float vDisplacement;
varying float vPlantCoverage;
varying float vIceCoverage;
varying float vScalar;
varying vec4 vPosition;

uniform float sealevel;
uniform float index;
