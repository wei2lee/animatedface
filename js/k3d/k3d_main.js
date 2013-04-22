/**
 * Canvas K3D library.
 * 
 * Software rendering of 3D objects using the 2D canvas context.
 * 
 * Copyright (C) Kevin Roast 2010
 * http://www.kevs3d.co.uk/dev
 * email: kevtoast at yahoo.com
 * twitter: @kevinroast
 * 
 * 26/11/09 First version
 * 26/05/10 Added code to maintain framerate
 * 01/06/10 Updated with additional features for UltraLight demo
 * 09/06/10 Implemented texture mapping for polygons
 * 01/03/11 Various refactoring and minor features, fixes
 * 01/11/11 Various fixes and texturing improvements for triangles and quads
 * 
 * Basic and advanced demo examples are provided in this bundle.
 * 
 * Project and documentation for the API is online:
 * http://en.wikibooks.org/wiki/K3D_JavaScript_Canvas_Library
 * https://launchpad.net/canvask3d
 * 
 * View the demos page:
 * http://www.kevs3d.co.uk/dev/canvask3d
 * 
 * Find the latest code bundle:
 * http://www.kevs3d.co.uk/dev/canvask3d/canvask3d-src.zip
 */

var DEBUG = {};

/**
 * K3D root namespace.
 *
 * @namespace K3D
 */
if (typeof K3D == "undefined" || !K3D)
{
   var K3D = {};
}
