define([
        '../Core/Check',
        '../Renderer/PixelDatatype'
    ], function(
        Check,
        PixelDatatype) {
    'use strict';

    /**
     * Gets the GLSL functions needed to retrieve clipping planes from a ClippingPlaneCollection's texture.
     *
     * @param {ClippingPlaneCollection} clippingPlaneCollection ClippingPlaneCollection with a defined texture.
     * @returns {String} A string containing GLSL functions for retrieving clipping planes.
     * @private
     */
    function getClippingFunction(clippingPlaneCollection) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('clippingPlaneCollection', clippingPlaneCollection);
        //>>includeEnd('debug');
        var unionClippingRegions = clippingPlaneCollection.unionClippingRegions;
        var clippingPlanesLength = clippingPlaneCollection.length;
        var texture = clippingPlaneCollection.texture;
        var usingFloatTexture = texture.pixelDatatype === PixelDatatype.FLOAT;
        var width = texture.width;
        var height = texture.height;

        var functions = usingFloatTexture ? getClippingPlaneFloat(width, height) : getClippingPlaneUint8(width, height);
        functions += '\n';
        functions += unionClippingRegions ? clippingFunctionUnion(usingFloatTexture, clippingPlanesLength) : clippingFunctionIntersect(usingFloatTexture, clippingPlanesLength);
        return functions;
    }

    function clippingFunctionUnion(usingFloatTexture, clippingPlanesLength) {
        var functionString =
            'float clip(vec4 fragCoord, sampler2D clippingPlanes, mat4 clippingPlanesMatrix)\n' +
            '{\n' +
            '    vec4 position = czm_windowToEyeCoordinates(fragCoord);\n' +
            '    vec3 clipNormal = vec3(0.0);\n' +
            '    vec3 clipPosition = vec3(0.0);\n' +
            '    float clipAmount = 0.0;\n' +
            '    float pixelWidth = czm_metersPerPixel(position);\n' +
            '    bool breakAndDiscard = false;\n' +

            '    for (int i = 0; i < ' + clippingPlanesLength + '; ++i)\n' +
            '    {\n' +
            '        vec4 clippingPlane = getClippingPlane(clippingPlanes, i, clippingPlanesMatrix);\n' +

            '        clipNormal = clippingPlane.xyz;\n' +
            '        clipPosition = -clippingPlane.w * clipNormal;\n' +

            '        float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth;\n' +
            '        clipAmount = max(amount, clipAmount);\n' +

            '        if (amount <= 0.0)\n' +
            '        {\n' +
            '           breakAndDiscard = true;\n' +
            '           break;\n' + // HLSL compiler bug if we discard here: https://bugs.chromium.org/p/angleproject/issues/detail?id=1945#c6
            '        }\n' +
            '    }\n' +

            '    if (breakAndDiscard) {\n' +
            '        discard;\n' +
            '    }\n' +
            '    return clipAmount;\n' +
            '}\n';
        return functionString;
    }

    function clippingFunctionIntersect(usingFloatTexture, clippingPlanesLength) {
        var functionString =
            'float clip(vec4 fragCoord, sampler2D clippingPlanes, mat4 clippingPlanesMatrix)\n' +
            '{\n' +
            '    bool clipped = true;\n' +
            '    vec4 position = czm_windowToEyeCoordinates(fragCoord);\n' +
            '    vec3 clipNormal = vec3(0.0);\n' +
            '    vec3 clipPosition = vec3(0.0);\n' +
            '    float clipAmount = 0.0;\n' +
            '    float pixelWidth = czm_metersPerPixel(position);\n' +

            '    for (int i = 0; i < ' + clippingPlanesLength + '; ++i)\n' +
            '    {\n' +
            '        vec4 clippingPlane = getClippingPlane(clippingPlanes, i, clippingPlanesMatrix);\n' +

            '        clipNormal = clippingPlane.xyz;\n' +
            '        clipPosition = -clippingPlane.w * clipNormal;\n' +

            '        float amount = dot(clipNormal, (position.xyz - clipPosition)) / pixelWidth;\n' +
            '        clipAmount = max(amount, clipAmount);\n' +

            '        clipped = clipped && (amount <= 0.0);\n' +
            '    }\n' +

            '    if (clipped)\n' +
            '    {\n' +
            '        discard;\n' +
            '    }\n' +

            '    return clipAmount;\n' +
            '}\n';
        return functionString;
    }

    function getClippingPlaneFloat(width, height) {
        var pixelWidth = 1.0 / width;
        var pixelHeight = 1.0 / height;

        var pixelWidthString = pixelWidth + '';
        if (pixelWidthString.indexOf('.') === -1) {
            pixelWidthString += '.0';
        }
        var pixelHeightString = pixelHeight + '';
        if (pixelHeightString.indexOf('.') === -1) {
            pixelHeightString += '.0';
        }

        var functionString =
            'vec4 getClippingPlane(sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform)\n' +
            '{\n' +
            '    int pixY = clippingPlaneNumber / ' + width + ';\n' +
            '    int pixX = clippingPlaneNumber - (pixY * ' + width + ');\n' +
            '    float u = (float(pixX) + 0.5) * ' + pixelWidthString + ';\n' + // sample from center of pixel
            '    float v = (float(pixY) + 0.5) * ' + pixelHeightString + ';\n' +
            '    vec4 plane = texture2D(packedClippingPlanes, vec2(u, v));\n' +
            '    return czm_transformPlane(plane, transform);\n' +
            '}\n';
        return functionString;
    }

    function getClippingPlaneUint8(width, height) {
        var pixelWidth = 1.0 / width;
        var pixelHeight = 1.0 / height;

        var pixelWidthString = pixelWidth + '';
        if (pixelWidthString.indexOf('.') === -1) {
            pixelWidthString += '.0';
        }
        var pixelHeightString = pixelHeight + '';
        if (pixelHeightString.indexOf('.') === -1) {
            pixelHeightString += '.0';
        }

        var functionString =
            'vec4 getClippingPlane(sampler2D packedClippingPlanes, int clippingPlaneNumber, mat4 transform)\n' +
            '{\n' +
            '    int clippingPlaneStartIndex = clippingPlaneNumber * 2;\n' + // clipping planes are two pixels each
            '    int pixY = clippingPlaneStartIndex / ' + width + ';\n' +
            '    int pixX = clippingPlaneStartIndex - (pixY * ' + width + ');\n' +
            '    float u = (float(pixX) + 0.5) * ' + pixelWidthString + ';\n' + // sample from center of pixel
            '    float v = (float(pixY) + 0.5) * ' + pixelHeightString + ';\n' +

            '    vec4 oct32 = texture2D(packedClippingPlanes, vec2(u, v)) * 255.0;\n' +
            '    vec2 oct = vec2(oct32.x * 256.0 + oct32.y, oct32.z * 256.0 + oct32.w);\n' +

            '    vec4 plane;\n' +
            '    plane.xyz = czm_octDecode(oct, 65535.0);\n' +
            '    plane.w = czm_unpackFloat(texture2D(packedClippingPlanes, vec2(u + ' + pixelWidthString + ', v)));\n' +

            '    return czm_transformPlane(plane, transform);\n' +
            '}\n';
        return functionString;
    }

    return getClippingFunction;
});
