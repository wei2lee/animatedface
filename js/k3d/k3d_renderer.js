
/**
 * K3D.Renderer class
 * 
 * Interface for K3D object renderers.
 */
(function()
{
   /**
    * K3D.Renderer Constructor
    */
   K3D.Renderer = function()
   {
   };
   
   /**
    * K3D.Renderer prototype
    */
   K3D.Renderer.prototype =
   {
      /**
       * Sort an object by Z distance in preparation for rendering
       * 
       * @method sortByDistance
       * @param obj {K3D.K3DObject} The object to sort by Z distance
       */
      sortByDistance: function(obj)
      {
      },
      
      /**
       * Render the object artifacts to the given canvas context
       * 
       * @method renderObject
       * @param obj {K3D.K3DObject} The object to render
       * @param ctx {Object} Canvas context
       */
      renderObject: function(obj, ctx)
      {
      }
   };
})();


/**
 * K3D.PointRenderer class
 */
(function()
{
   /**
    * K3D.PointRenderer Constructor
    */
   K3D.PointRenderer = function()
   {
      K3D.PointRenderer.superclass.constructor.call(this);
      
      return this;
   };
   
   extend(K3D.PointRenderer, K3D.Renderer,
   {
      /**
       * Sort an object by Z distance in preparation for rendering
       * 
       * @method sortByDistance
       * @param obj {K3D.K3DObject} The object to sort by Z distance
       */
      sortByDistance: function(obj)
      {
         // quick sort the edges
         if (obj.shademode !== "plain" && obj.sortmode === "sorted")
         {
            // Using a manual quicksort may seem strange, but performance profiling
            // in Chrome has shown this method is x3 faster than the built-in Array
            // sort with the appropriate sorting function applied.
            this.quickSortObject(obj.screencoords, obj.worldcoords, 0, obj.points.length - 1);
         }
      },
      
      /**
       * Reverse quicksort implementation - the points are sorted by Z coordinates
       * 
       * @method quickSortObject
       * @param screencoords {Array} screencoords
       * @param a {Array} array to sort
       * @param left {int} leftindex
       * @param right {int} rightindex
       */
      quickSortObject: function(screencoords, a, left, right)
      {
         var leftIndex = left, rightIndex = right, partionElement;
         var tempP;
         
         if (right > left)
         {
            // get midpoint of the array
            partionElement = a[(left + right) >> 1].z / 2;
            
            // loop through the array until indices cross
            while (leftIndex <= rightIndex)
            {
               // find the first element that is < the partionElement starting
               // from the leftIndex (Z coord of point)
               while (leftIndex < right && a[leftIndex].z > partionElement)
                  leftIndex++;
               
               // find an element that is greater than the
               // partionElement starting from the rightIndex
               while (rightIndex > left && a[rightIndex].z < partionElement)
                  rightIndex--;
               
               // if the indexes have not crossed, swap
               if (leftIndex <= rightIndex)
               {
                  // swap world and screen objects
                  // this is required as points are not an index into worldcoords like
                  // edges and faces - so if worldcoords are swapped, so must be screencoords
                  tempP = screencoords[leftIndex];
                  screencoords[leftIndex] = screencoords[rightIndex];
                  screencoords[rightIndex] = tempP;
                  tempP = a[leftIndex];
                  a[leftIndex] = a[rightIndex];
                  a[rightIndex] = tempP;
                  leftIndex++;
                  rightIndex--;
               }
            }
            
            // if the right index has not reached the left side of the array then
            // must sort the left partition.
            if (left < rightIndex)
            {
               this.quickSortObject(screencoords, a, left, rightIndex);
            }
            
            // if the left index has not reached the left side of the array then 
            // must sort the left partition. 
            if (leftIndex < right)
            {
               this.quickSortObject(screencoords, a, leftIndex, right);
            }
         }
      },
      
      /**
       * Render the object points to the given canvas context
       * 
       * @method renderObject
       * @param obj {K3D.K3DObject} The object to render
       * @param ctx {Object} Canvas context
       */
      renderObject: function(obj, ctx)
      {
         var zdist, c, w;
         var screencoords = obj.screencoords, worldcoords = obj.worldcoords,
             dscale = obj.depthscale, dscalefactor = dscale / 128, linescale = obj.linescale / 255;
         
         for (var i=0, len=obj.points.length; i<len; i++)
         {
            // calculate colour/size to use for shading - based on z distance
            c = worldcoords[i].z + dscale;
            c = c / dscalefactor;
            
            switch (obj.shademode)
            {
               case "lightsource":  // not supported by points, so fallback to plain
               case "plain":
               {
                  ctx.fillStyle = "rgb(" + obj.color[0] + "," + obj.color[1] + "," + obj.color[2] + ")";
                  break;
               }
               
               case "depthcue":
               {
                  if (c < 0) c = 0;
                  else if (c > 255) c = 255;
                  c = 255 - Ceil(c);
                  ctx.fillStyle = obj.depthcueColors[c];
                  break;
               }
            }
            
            // size of point dependant on z distance
            w = linescale * c;
            if (w < 0.1) w = 0.1;
            obj.outputlinescale = w;
            
            // draw a point
            //ctx.fillRect(screencoords[i].x - w, screencoords[i].y - w, w, w);
            ctx.beginPath();
            ctx.arc(screencoords[i].x, screencoords[i].y, w, 0, TWOPI, true);
            ctx.closePath();
            ctx.fill();
         }
      }
   });
})();


/**
 * K3D.WireframeRenderer class
 */
(function()
{
   /**
    * K3D.WireframeRenderer Constructor
    */
   K3D.WireframeRenderer = function()
   {
      K3D.WireframeRenderer.superclass.constructor.call(this);
      
      return this;
   };
   
   extend(K3D.WireframeRenderer, K3D.Renderer,
   {
      /**
       * Sort an object by Z distance in preparation for rendering
       * 
       * @method sortByDistance
       * @param obj {K3D.K3DObject} The object to sort by Z distance
       */
      sortByDistance: function(obj)
      {
         // quick sort the edges
         // TODO: will need sort if take wireframe colours from face edges or similar
         if (obj.shademode !== "plain" && obj.sortmode === "sorted")
         {
            this.quickSortObject(obj.worldcoords, obj.edges, 0, obj.edges.length - 1);
         }
      },
      
      /**
       * Reverse quicksort implementation - the Z coordinates of the edges points are averaged.
       * 
       * @method quickSortObject
       * @param worldcoords {Array} World coordinate list for the object
       * @param a {Array} array to sort
       * @param left {int} leftindex
       * @param right {int} rightindex
       */
      quickSortObject: function(worldcoords, a, left, right)
      {
         var leftIndex = left, rightIndex = right, partionElement;
         var tempEdge;
         
         if (right > left)
         {
            // get midpoint of the array (use as reference to Z coord!)
            partionElement = ((worldcoords[ (a[(left + right) >> 1].a) ].z) +
                              (worldcoords[ (a[(left + right) >> 1].b) ].z)) / 2;
            
            // loop through the array until indices cross
            while (leftIndex <= rightIndex)
            {
               // find the first element that is < the partionElement starting
               // from the leftIndex (average Z coords of edge for element)
               while ((leftIndex < right) &&
                      ((worldcoords[ (a[leftIndex].a) ].z +
                        worldcoords[ (a[leftIndex].b) ].z) / 2 > partionElement))
                  leftIndex++;
               
               // find an element that is greater than the
               // partionElement starting from the rightIndex
               while ((rightIndex > left) &&
                      ((worldcoords[ (a[rightIndex].a) ].z +
                        worldcoords[ (a[rightIndex].b) ].z) / 2 < partionElement))
                  rightIndex--;
               
               // if the indexes have not crossed, swap
               if (leftIndex <= rightIndex)
               {
                  // swap edges objects
                  tempEdge = a[leftIndex];
                  a[leftIndex] = a[rightIndex];
                  a[rightIndex] = tempEdge;
                  leftIndex++;
                  rightIndex--;
               }
            }
            
            // if the right index has not reached the left side of the array then
            // must sort the left partition.
            if (left < rightIndex)
            {
               this.quickSortObject(worldcoords, a, left, rightIndex);
            }
            
            // if the left index has not reached the left side of the array then 
            // must sort the left partition. 
            if (leftIndex < right)
            {
               this.quickSortObject(worldcoords, a, leftIndex, right);
            }
         }
      },
      
      /**
       * Render the edges to the given canvas context
       * 
       * @method renderObject
       * @param obj {K3D.K3DObject} The object to render
       * @param ctx {Object} Canvas context
       */
      renderObject: function(obj, ctx)
      {
         var c, a, b, w;
         var edges = obj.edges, screencoords = obj.screencoords, worldcoords = obj.worldcoords;
         var dscale = obj.depthscale, dscalefactor = dscale / 128, linescale = obj.linescale / 255;
         
         ctx.lineWidth = obj.linescale;
         
         for (var i=0, len=edges.length; i<len; i++)
         {
            a = edges[i].a;
            b = edges[i].b;
            
            switch (obj.shademode)
            {
               case "lightsource":  // not supported by wireframe, so fallback to plain
               case "plain":
               {
                  c = obj.color;
                  ctx.strokeStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
                  break;
               }
               
               case "depthcue":
               {
                  // calculate colour to use for shading
                  c = ((worldcoords[a].z + worldcoords[b].z) / 2) + dscale;
                  c = c / dscalefactor;
                  if (c < 0) c = 0;
                  else if (c > 255) c = 255;
                  c = 255 - Ceil(c);
                  ctx.strokeStyle = obj.depthcueColors[c];
                  w = linescale * c;
                  if (w < 0.1) w = 0.1;
                  obj.outputlinescale = w;
                  ctx.lineWidth = w;
                  break;
               }
            }
            
            // draw an edge
            ctx.beginPath();
            ctx.moveTo(screencoords[a].x, screencoords[a].y);
            ctx.lineTo(screencoords[b].x, screencoords[b].y);
            ctx.closePath();
            ctx.stroke();
         }
      }
   });
})();


/**
 * K3D.SolidRenderer class
 */
(function()
{
   /**
    * K3D.SolidRenderer Constructor
    */
   K3D.SolidRenderer = function()
   {
      K3D.SolidRenderer.superclass.constructor.call(this);
      
      return this;
   };
   
   extend(K3D.SolidRenderer, K3D.Renderer,
   {
      /**
       * Sort an object by Z distance in preparation for rendering
       * 
       * @method sortByDistance
       * @param obj {K3D.K3DObject} The object to sort by Z distance
       */
      sortByDistance: function sortByDistance(obj)
      {
         if (obj.sortmode === "sorted")
         {
            this.quickSortObject(obj.worldcoords, obj.faces, 0, obj.faces.length - 1);
         }
      },
      
      /**
       * Reverse quicksort implementation - the Z coordinates of the face points are averaged.
       * i.e. the painter's algorithm. Unfortunately this has the same problems that this
       * always has - it is possible for polygons to overlay when they shouldn't:
       * http://gamedev.stackexchange.com/questions/14365/how-to-gain-accurate-results-with-painters-algorithm
       * 
       * @method quickSortObject
       * @param worldcoords {Array} World coordinate list for the object
       * @param a {Array} array to sort
       * @param left {int} leftindex
       * @param right {int} rightindex
       */
      quickSortObject: function quickSortObject(worldcoords, faces, left, right)
      {
         // TODO: optimize by remembering avz - would need to clear per frame
         var v1, v2;
         faces.sort(function (f1, f2) {
            // average z of first face
            v1 = f1.vertices;
            for (var i=0, av1=0; i<v1.length; i++)
            {
               av1 += worldcoords[ v1[i] ].z;
            }
            av1 = av1 / v1.length;
            
            // average z of second face
            v2 = f2.vertices;
            for (var i=0, av2=0; i<v2.length; i++)
            {
               av2 += worldcoords[ v2[i] ].z;
            }
            av2 = av2 / v2.length;
            
            return (av1 < av2 ? 1 : -1);
         });
      },
      
      /**
       * Render the object faces to the given canvas context
       * 
       * @method renderObject
       * @param obj {K3D.K3DObject} The object to render
       * @param ctx {Object} Canvas context
       */
      renderObject: function renderObject(obj, ctx)
      {
         var faces = obj.faces, screencoords = obj.screencoords, worldcoords = obj.worldcoords;
         var dscale = obj.depthscale, dscalefactor = dscale / 128;
         var viewerVector = new Vector3D(0, 0, 1);
         var vertices, r,g,b,c, PIDIV2 = PI/2, fillStyle, lights = obj.controller.lights;
         var doublesided = obj.doublesided;
         // calc a value to offset the hidden surface removal calculate based on the perspective
         // transformation level - this ensures surfaces are not removed too early
         var hiddenoffset = (1 / obj.perslevel) * 256;
         
         // ensure lineWidth is set if fill+stroke is used as the poly fill technique
         if (obj.fillmode === "fillstroke")
         {
            ctx.lineWidth = 1.0;
         }
         
         for (var n=0, len=faces.length, face; n<len; n++)
         {
            face = faces[n];
            vertices = face.vertices;
            
            // perform hidden surface removal first - discard non visible faces
            if (doublesided || viewerVector.dot(face.worldnormal) < hiddenoffset)
            {
               switch (obj.shademode)
               {
                  case "plain":
                  {
                     if (face.texture === null)
                     {
                        // apply plain colour directly from poly
                        c = face.color;
                        fillStyle = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
                        this.renderPolygon(ctx, obj, face, fillStyle)
                     }
                     else
                     {
                        this.renderPolygon(ctx, obj, face);
                     }
                     break;
                  }
                  
                  case "depthcue":
                  {
                     // calculate colour to use based on av Z distance of polygon
                     for (var i=0, j=vertices.length, count=0; i<j; i++)
                     {
                        count += worldcoords[ vertices[i] ].z;
                     }
                     var col = ((count / vertices.length) + dscale) / dscalefactor;
                     if (col < 0) col = 0;
                     else if (col > 255) col = 255;
                     if (face.texture === null)
                     {
                        // plain depth cued colour fill
                        col = (255 - col) / 255;
                        c = face.color;
                        r = Ceil(col * c[0]);
                        g = Ceil(col * c[1]);
                        b = Ceil(col * c[2]);
                        fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                     }
                     else
                     {
                        // calculate depth cue overlay fillstyle for texture
                        col = 255 - Ceil(col);
                        fillStyle = "rgba(0,0,0," + (1.0 - (col / 255)) + ")";
                     }
                     this.renderPolygon(ctx, obj, face, fillStyle);
                     break;
                  }
                  
                  case "lightsource":
                  {
                     // are there any lightsources defined?
                     if (lights.length === 0)
                     {
                        // calculate colour to use based on normal vector to default view-point vector
                        var angle = viewerVector.thetaTo2(face.worldnormal);
                        c = face.color;
                        r = Ceil(angle * (c[0] / PI));
                        g = Ceil(angle * (c[1] / PI));
                        b = Ceil(angle * (c[2] / PI));
                        if (face.texture === null)
                        {
                           // lit colour fill
                           fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                        }
                        else
                        {
                           // calculate lit overlay fillstyle for texture
                           fillStyle = "rgba(0,0,0," + (1.0 - angle * ONEOPI) + ")";
                        }
                        this.renderPolygon(ctx, obj, face, fillStyle);
                     }
                     else
                     {
                        // perform a pass for each light - a simple linear-additive lighting model
                        r = g = b = 0;
                        for (var i=0, j=lights.length, light, lit; i<j; i++)
                        {
                           light = lights[i];
                           // TODO: investigate angle inversion
                           angle = PI - light.worldvector.thetaTo2(face.worldnormal);
                           // surface is lit by the current light - apply lighting model based on theta angle
                           // linear distance falloff - each light is additive to the total
                           lit = angle * ((1.0 / light.worldvector.distance(face.worldnormal)) * light.intensity) / PI;
                           // apply each colour component based on light colour (specified as 0.0->1.0 value)
                           r += (lit * light.color[0]);
                           g += (lit * light.color[1]);
                           b += (lit * light.color[2]);
                        }
                        
                        // clamp max lit values
                        if (r > 1.0) r = 1.0;
                        if (g > 1.0) g = 1.0;
                        if (b > 1.0) b = 1.0;
                        
                        // finally multiply into the original face colour - converting to 0-255 range
                        c = face.color;
                        var rgb = Ceil(r*c[0]) + "," + Ceil(g*c[1]) + "," + Ceil(b*c[2]);
                        if (face.texture === null)
                        {
                           // lit colour fill
                           fillStyle = "rgb(" + rgb + ")";
                        }
                        else
                        {
                           // calculate lit overlay fillstyle for texture
                           // TODO: correct this calculation for eye colour perception of r,g,b
                           fillStyle = "rgba(" + rgb + "," + (1.0 - (r + g + b) * 0.33333) + ")";
                        }
                        this.renderPolygon(ctx, obj, face, fillStyle);
                     }
                     break;
                  }
               }
            }
         }
      },
      
      /**
       * Render a polygon faces to the given canvas context.
       * 
       * If a texture is present, it is rendered and the given fillStyle is also applied
       * as an overlay (transparency is assumed in the given fillStyle) to provide a lighting
       * effect on the texture.
       * If no texture is present, the polygon is rendered with the given fillStyle.
       * 
       * @method renderPolygon
       * @param ctx {Object} Canvas context
       * @param obj {K3D.K3DObject} The object to render
       * @param face {Object} The face object representing the polygon to render
       * @param fillStyle {string} To apply as either plain fill or texture overlay,
       *        generally based on rgb lighting and alpha intensity
       */
      
      renderPolygon: function renderPolygon(ctx, obj, face, fillStyle)
      {
         var screencoords = obj.screencoords, vertices = face.vertices;
         var uvs = obj.uvs;
         
         ctx.save();
         if (face.texture === null)
         {
            if (obj.fillmode === "inflate")
            {
               // inflate the polygon screen coords to cover the 0.5 pixel cracks between canvas fill()ed polygons
               // see http://stackoverflow.com/questions/3749678/expand-fill-of-convex-polygon
               // and http://stackoverflow.com/questions/1109536/an-algorithm-for-inflating-deflating-offsetting-buffering-polygons
               var inflatedVertices = this.inflatePolygon(vertices, screencoords);
               
               ctx.beginPath();
               ctx.moveTo(inflatedVertices[0].x, inflatedVertices[0].y);
               for (var i=1, j=vertices.length; i<j; i++)
               {
                  ctx.lineTo(inflatedVertices[i].x, inflatedVertices[i].y);
               }
               ctx.closePath();
            }
            else
            {
               ctx.beginPath();
               // move to first point in the polygon
               ctx.moveTo(screencoords[vertices[0]].x, screencoords[vertices[0]].y);
               for (var i=1, j=vertices.length; i<j; i++)
               {
                  // move to each additional point
                  ctx.lineTo(screencoords[vertices[i]].x, screencoords[vertices[i]].y);
               }
               // no need to plot back to first point - as path closes shape automatically
               ctx.closePath();
            }
            
            switch (obj.fillmode)
            {
               case "fill":
                  // single fill - fastest but leaves edge lines
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  break;
               
               case "filltwice":
                  // double fill causes "overdraw" towards edges - slightly slower
                  // but removes enough of the cracks for dense objects and small faces
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  ctx.fill();
                  break;
               
               case "inflate":
                  // inflate (also called 'buffering') the polygon in 2D by a small ammount
                  // and then a single fill can be used - increase in pre calculation time
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  break;
               
               case "fillstroke":
                  // single fill - followed by a stroke line - perfect edge fill but slower
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  ctx.strokeStyle = fillStyle;
                  ctx.stroke();
                  break;
               
               case "hiddenline":
                  // stroke only - to produce hidden line wire effect
                  ctx.strokeStyle = fillStyle;
                  ctx.stroke();
                  break;
            }
         }
         else
         {
            var bitmap = obj.textures[ face.texture ];
            var fRenderTriangle = function(vs, sx0, sy0, sx1, sy1, sx2, sy2)
            {
               var invecs = this.inflatePolygon(vs, screencoords);
               
               ctx.save();
               ctx.beginPath();
               ctx.moveTo(invecs[0].x, invecs[0].y);
               for (var i=1, j=vs.length; i<j; i++)
               {
                  ctx.lineTo(invecs[i].x, invecs[i].y);
               }
               ctx.closePath();
               ctx.clip();
               
               // Textured triangle transformation code originally by Thatcher Ulrich
               // TODO: figure out if drawImage goes faster if we specify the rectangle that bounds the source coords.
               // TODO: this is far from perfect - due to perspective corrected texture mapping issues see:
               //       http://tulrich.com/geekstuff/canvas/perspective.html
               var x0 = invecs[0].x, y0 = invecs[0].y,
                   x1 = invecs[1].x, y1 = invecs[1].y,
                   x2 = invecs[2].x, y2 = invecs[2].y;
               
               // collapse terms
               var denom = denom = 1.0 / (sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0);
               // calculate context transformation matrix
               var m11 = - (sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) * denom,
                   m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) * denom,
                   m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) * denom,
                   m22 = - (sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) * denom,
                   dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) * denom,
                   dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) * denom;
               
               ctx.transform(m11, m12, m21, m22, dx, dy);
               
               // Draw the whole texture image. Transform and clip will map it onto the correct output polygon.
               ctx.drawImage(bitmap, 0, 0);
               
               // apply optionally fill style to shade and light the texture image
               if (fillStyle)
               {
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
               }
               ctx.restore();
            };
            
            // we can only render triangles - a quad must be split into two triangles
            // unfortunately anything else is not dealt with currently i.e. needs a triangle subdivision algorithm
             
             
            //fRenderTriangle.call(this, vertices.slice(0, 3), 0, 0, bitmap.width, 0, bitmap.width, bitmap.height);
             
            var v = [0,0,0];
            v[0] = vertices[0];
            v[1] = vertices[1];
            v[2] = vertices[2];
            
            if(uvs && uvs.length) {
            fRenderTriangle.call(this, v, 
                                 bitmap.width*uvs[v[0]].u, bitmap.height*(1-uvs[v[0]].v), 
                                 bitmap.width*uvs[v[1]].u, bitmap.height*(1-uvs[v[1]].v),  
                                 bitmap.width*uvs[v[2]].u, bitmap.height*(1-uvs[v[2]].v));
            }else{
            fRenderTriangle.call(this, vertices.slice(0, 3), 0, 0, bitmap.width, 0, bitmap.width, bitmap.height);
            }
             
            if (vertices.length === 4)
            {
               //v = [];
               //v.push(vertices[2]);
               //v.push(vertices[3]);
               //v.push(vertices[0]);
               v[0] = vertices[2];
               v[1] = vertices[3];
               v[2] = vertices[0];
                if(uvs && uvs.length) {
                fRenderTriangle.call(this, v, 
                                     bitmap.width*uvs[v[0]].u, bitmap.height*(1-uvs[v[0]].v), 
                                     bitmap.width*uvs[v[1]].u, bitmap.height*(1-uvs[v[1]].v),  
                                     bitmap.width*uvs[v[2]].u, bitmap.height*(1-uvs[v[2]].v));                    
                    
                }else{
                fRenderTriangle.call(this, v, bitmap.width, bitmap.height, 0, bitmap.height, 0, 0);     
                }
            }
         }
         ctx.restore();
      },
      
      inflatePolygon: function inflatePolygon(vertices, screencoords)
      {
         // generate vertices of parallel edges
         var pedges = [], inflatedVertices = new Array(vertices.length);
         for (var i=0, j=vertices.length, x1,y1,x2,y2,dx,dy,len; i<j; i++)
         {
            // collect an edge
            x1 = screencoords[vertices[i]].x;
            y1 = screencoords[vertices[i]].y;
            if (i < j - 1)
            {
               x2 = screencoords[vertices[i+1]].x;
               y2 = screencoords[vertices[i+1]].y;
            }
            else
            {
               x2 = screencoords[vertices[0]].x;
               y2 = screencoords[vertices[0]].y;
            }
            
            // compute outward facing normal vector - and normalise the length
            dx = y2 - y1;
            dy = -(x2 - x1);
            len = Sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
            
            // multiply by the distance to the parallel edge
            dx *= 0.5;
            dy *= 0.5;
            
            // generate and store parallel edge
            pedges.push({x: x1 + dx, y: y1 + dy});
            pedges.push({x: x2 + dx, y: y2 + dy});
         }
         
         // calculate intersections to build new screen coords for inflated poly
         for (var i=0, j=vertices.length, vec; i<j; i++)
         {
            if (i === 0)
            {
               vec = this.intersection(pedges[(j-1) * 2], pedges[(j-1) * 2 + 1], pedges[0], pedges[1]);
            }
            else
            {
               vec = this.intersection(pedges[(i-1) * 2], pedges[(i-1) * 2 + 1], pedges[i * 2], pedges[i * 2 + 1]);
            }
            // handle edge case where inflated polygon vertex edges jump towards infinity
            if (Abs(vec.x - screencoords[vertices[i]].x) > 1.5 || Abs(vec.y - screencoords[vertices[i]].y) > 1.5)
            {
               // reset to original coordinates
               vec.x = screencoords[vertices[i]].x;
               vec.y = screencoords[vertices[i]].y;
            }
            inflatedVertices[i] = vec;
         }
         
         return inflatedVertices;
      },
      
      intersection: function intersection(line0v0, line0v1, line1v0, line1v1)
      {
         var a1,b1,c1,a2,b2,c2,t;
         
         a1 = line0v1.x - line0v0.x;
         b1 = line1v0.x - line1v1.x;
         c1 = line1v0.x - line0v0.x;
         a2 = line0v1.y - line0v0.y;
         b2 = line1v0.y - line1v1.y;
         c2 = line1v0.y - line0v0.y;
         
         t = (b1*c2 - b2*c1) / (a2*b1 - a1*b2);
         
         return {
            x: line0v0.x + t * (line0v1.x - line0v0.x),
            y: line0v0.y + t * (line0v1.y - line0v0.y)
         };
      }
   });
})();
