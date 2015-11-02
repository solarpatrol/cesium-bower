//This file is automatically rebuilt by the Cesium build process.
/*global define*/
define(function() {
    "use strict";
    return "attribute vec4 position3DAndHeight;\n\
attribute vec3 textureCoordAndEncodedNormals;\n\
uniform vec3 u_center3D;\n\
uniform mat4 u_modifiedModelView;\n\
uniform vec4 u_tileRectangle;\n\
uniform vec2 u_southAndNorthLatitude;\n\
uniform vec2 u_southMercatorYAndOneOverHeight;\n\
varying vec3 v_positionMC;\n\
varying vec3 v_positionEC;\n\
varying vec2 v_textureCoordinates;\n\
varying vec3 v_normalMC;\n\
varying vec3 v_normalEC;\n\
vec4 getPosition(vec3 position3DWC);\n\
float get2DYPositionFraction();\n\
vec4 getPosition3DMode(vec3 position3DWC)\n\
{\n\
return czm_projection * (u_modifiedModelView * vec4(position3DAndHeight.xyz, 1.0));\n\
}\n\
float get2DMercatorYPositionFraction()\n\
{\n\
const float maxTileWidth = 0.003068;\n\
float positionFraction = textureCoordAndEncodedNormals.y;\n\
float southLatitude = u_southAndNorthLatitude.x;\n\
float northLatitude = u_southAndNorthLatitude.y;\n\
if (northLatitude - southLatitude > maxTileWidth)\n\
{\n\
float southMercatorY = u_southMercatorYAndOneOverHeight.x;\n\
float oneOverMercatorHeight = u_southMercatorYAndOneOverHeight.y;\n\
float currentLatitude = mix(southLatitude, northLatitude, textureCoordAndEncodedNormals.y);\n\
currentLatitude = clamp(currentLatitude, -czm_webMercatorMaxLatitude, czm_webMercatorMaxLatitude);\n\
positionFraction = czm_latitudeToWebMercatorFraction(currentLatitude, southMercatorY, oneOverMercatorHeight);\n\
}\n\
return positionFraction;\n\
}\n\
float get2DGeographicYPositionFraction()\n\
{\n\
return textureCoordAndEncodedNormals.y;\n\
}\n\
vec4 getPositionPlanarEarth(vec3 position3DWC, float height2D)\n\
{\n\
float yPositionFraction = get2DYPositionFraction();\n\
vec4 rtcPosition2D = vec4(height2D, mix(u_tileRectangle.st, u_tileRectangle.pq, vec2(textureCoordAndEncodedNormals.x, yPositionFraction)), 1.0);\n\
return czm_projection * (u_modifiedModelView * rtcPosition2D);\n\
}\n\
vec4 getPosition2DMode(vec3 position3DWC)\n\
{\n\
return getPositionPlanarEarth(position3DWC, 0.0);\n\
}\n\
vec4 getPositionColumbusViewMode(vec3 position3DWC)\n\
{\n\
return getPositionPlanarEarth(position3DWC, position3DAndHeight.w);\n\
}\n\
vec4 getPositionMorphingMode(vec3 position3DWC)\n\
{\n\
float yPositionFraction = get2DYPositionFraction();\n\
vec4 position2DWC = vec4(0.0, mix(u_tileRectangle.st, u_tileRectangle.pq, vec2(textureCoordAndEncodedNormals.x, yPositionFraction)), 1.0);\n\
vec4 morphPosition = czm_columbusViewMorph(position2DWC, vec4(position3DWC, 1.0), czm_morphTime);\n\
return czm_modelViewProjection * morphPosition;\n\
}\n\
void main()\n\
{\n\
vec3 position3DWC = position3DAndHeight.xyz + u_center3D;\n\
gl_Position = getPosition(position3DWC);\n\
#if defined(ENABLE_VERTEX_LIGHTING)\n\
v_positionEC = (czm_modelView3D * vec4(position3DWC, 1.0)).xyz;\n\
v_positionMC = position3DWC;\n\
float encodedNormal = textureCoordAndEncodedNormals.z;\n\
v_normalMC = czm_octDecode(encodedNormal);\n\
v_normalEC = czm_normal3D * v_normalMC;\n\
#elif defined(SHOW_REFLECTIVE_OCEAN) || defined(ENABLE_DAYNIGHT_SHADING)\n\
v_positionEC = (czm_modelView3D * vec4(position3DWC, 1.0)).xyz;\n\
v_positionMC = position3DWC;\n\
#endif\n\
v_textureCoordinates = textureCoordAndEncodedNormals.xy;\n\
}\n\
";
});