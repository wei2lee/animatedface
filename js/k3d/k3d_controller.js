/**
 * K3D.BaseController class.
 * 
 * Controller for a number of K3D objects. Maintains and sorts the object list. Provides
 * a function to processes each object during the render loop.
 */
(function()
{
   /**
    * K3D.BaseController constructor
    */
   K3D.BaseController = function()
   {
      this.objects = [];
      this.lights = [];
      this.renderers = [];
      this.renderers["point"] = new K3D.PointRenderer();
      this.renderers["wireframe"] = new K3D.WireframeRenderer();
      this.renderers["solid"] = new K3D.SolidRenderer();
   };
   
   K3D.BaseController.prototype =
   {
      renderers: null,
      objects: null,
      lights: null,
      sort: true,
      clearBackground: true,     // true if the Controller is responsible for clearing the canvas
      clearingStrategy: "all",   // Canvas clearing strategy, one of "all", "eachobject", "combineobjects":
                                 //   "all" - the entire canvas will be cleared
                                 //   "eachobject" - the Controller should clear each object boundry area individually
                                 //   "combineobjects" - the Controller should combine the object boundries and then clear
                                 // clearing each object can improve performance depending on the scene.
      fillStyle: null,           // optional fill style for bg clear - else default clear method is used
      
      /**
       * Add a K3D object to the list of objects for rendering
       */
      addK3DObject: function(obj)
      {
         obj.setController(this);
         this.objects.push(obj);
      },
      
      /**
       * Add a light source to the list of available lights
       */
      addLightSource: function(light)
      {
         this.lights.push(light);
      },
      
      /**
       * @param drawmode {string} drawing mode constant
       * @return the renderer for the given drawing mode
       */
      getRenderer: function(drawmode)
      {
         return this.renderers[drawmode];
      },
      
      /**
       * Reset the background.
       * Depending on options, clear entire background to a specific colour or the default
       * or optionally based on previous object position which can improve performance.
       * 
       * @param ctx {object} Canvas context
       */
      resetBackground: function(ctx)
      {
         if (this.clearBackground)
         {
            if (this.fillStyle) ctx.fillStyle = this.fillStyle;
            
            switch (this.clearingStrategy)
            {
               case "all":
               {
                  if (this.fillStyle)
                  {
                     ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                  }
                  else
                  {
                     ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                  }
               }
               case "eachobject":
               {
                  for (var i = 0, len = this.objects.length, obj, offset; i < len; i++)
                  {
                     obj = this.objects[i];
                     switch (obj.drawmode)
                     {
                        case "point":
                        {
                           offset = (obj.outputlinescale ? obj.outputlinescale : obj.linescale) + 1;
                           if (this.fillStyle)
                           {
                              ctx.fillRect(Floor(obj.rminx) - offset, Floor(obj.rminy) - offset,
                                           (Ceil(obj.rmaxx) - Floor(obj.rminx)) + offset * 2 + 1, (Ceil(obj.rmaxy) - Floor(obj.rminy)) + offset * 2 + 1);
                           }
                           else
                           {
                              ctx.clearRect(Floor(obj.rminx) - offset, Floor(obj.rminy) - offset,
                                            (Ceil(obj.rmaxx) - Floor(obj.rminx)) + offset * 2 + 1, (Ceil(obj.rmaxy) - Floor(obj.rminy)) + offset * 2 + 1);
                           }
                           break;
                        }
                        case "wireframe":
                        {
                           offset = (obj.outputlinescale ? obj.outputlinescale : obj.linescale) * 2;
                           if (this.fillStyle)
                           {
                              ctx.fillRect(Floor(obj.rminx) - offset, Floor(obj.rminy) - offset,
                                           (Ceil(obj.rmaxx) - Floor(obj.rminx)) + offset * 2 + 1, (Ceil(obj.rmaxy) - Floor(obj.rminy)) + offset * 2 + 1);
                           }
                           else
                           {
                              ctx.clearRect(Floor(obj.rminx) - offset, Floor(obj.rminy) - offset,
                                            (Ceil(obj.rmaxx) - Floor(obj.rminx)) + offset * 2 + 1, (Ceil(obj.rmaxy) - Floor(obj.rminy)) + offset * 2 + 1);
                           }
                           break;
                        }
                        case "solid":
                        {
                           if (this.fillStyle)
                           {
                              ctx.fillRect(Floor(obj.rminx) - 1, Floor(obj.rminy) - 1,
                                           (Ceil(obj.rmaxx) - Floor(obj.rminx)) + 1, (Ceil(obj.rmaxy) - Floor(obj.rminy)) + 1);
                           }
                           else
                           {
                              ctx.clearRect(Floor(obj.rminx) - 1, Floor(obj.rminy) - 1,
                                            Ceil(obj.rmaxx) - Floor(obj.rminx) + 1, Ceil(obj.rmaxy) - Floor(obj.rminy) + 1);
                           }
                           break;
                        }
                     }
                  }
               }
               case "combineobjects":
               {
                  // calculate the max offset required as we walk each object
                  var maxoffset = 1, rminx = 4096, rmaxx = -4096, rminy = 4096, rmaxy = -4096;
                  // walk each object, keeping track of max object boundries
                  for (var i = 0, len = this.objects.length, obj, offset; i < len; i++)
                  {
                     obj = this.objects[i];
                     switch (obj.drawmode)
                     {
                        case "point":
                        {
                           offset = (obj.outputlinescale ? obj.outputlinescale : obj.linescale) + 1;
                           if (offset > maxoffset) maxoffset = offset;
                           break;
                        }
                        case "wireframe":
                        {
                           offset = (obj.outputlinescale ? obj.outputlinescale : obj.linescale) * 2;
                           if (offset > maxoffset) maxoffset = offset;
                           break;
                        }
                     }
                     // update min/max rendering boundries
                     if (obj.rminx < rminx) rminx = obj.rminx;
                     if (obj.rmaxx > rmaxx) rmaxx = obj.rmaxx;
                     if (obj.rminy < rminy) rminy = obj.rminy;
                     if (obj.rmaxy > rmaxy) rmaxy = obj.rmaxy;
                  }
                  
                  // perform final clear operation
                  if (this.fillStyle)
                  {
                     ctx.fillRect(Floor(rminx) - maxoffset, Floor(rminy) - maxoffset,
                                  (Ceil(rmaxx) - Floor(rminx)) + maxoffset * 2 + 1, (Ceil(rmaxy) - Floor(rminy)) + maxoffset * 2 + 1);
                  }
                  else
                  {
                     ctx.clearRect(Floor(rminx) - maxoffset, Floor(rminy) - maxoffset,
                                   (Ceil(rmaxx) - Floor(rminx)) + maxoffset * 2 + 1, (Ceil(rmaxy) - Floor(rminy)) + maxoffset * 2 + 1);
                  }
               }
            }
         }
      },
      
      /**
       * Process the 3D pipeline for a single frame
       * 
       * @param ctx {object} Canvas context
       */
      processFrame: function(ctx)
      {
         // execute transformation pipeline for each object and light
         var objects = this.objects;
         for (var i = 0, len = objects.length; i < len; i++)
         {
            objects[i].executePipeline();
         }
         var lights = this.lights;
         for (var i = 0, len = lights.length; i < len; i++)
         {
            lights[i].executePipeline();
         }
         
         // sort objects in average Z order
         if (this.sort)
         {
            objects.forEach(function clearAverageZ(el, i, a)
            {
               el.averagez = null;
            });
            objects.sort(function sortObjects(a, b)
            {
               // ensure we have an average z coord for the objects to test
               if (a.averagez === null)
               {
                  a.calculateAverageZ();
               }
               if (b.averagez === null)
               {
                  b.calculateAverageZ();
               }
               return (a.averagez < b.averagez ? 1 : -1);
            });
         }
         
         // render objects to the canvas context
         for (var i = 0, len = objects.length; i < len; i++)
         {
            ctx.save();
            objects[i].executeRenderer(ctx);
            ctx.restore();
         }
      }
   };
})();


/**
 * K3D.Controller class.
 * 
 * Default canvas based controller, manages the canvas render context.
 * Provides the default frame() function for the render loop.
 */
(function()
{
   /**
    * K3D.Controller constructor
    * 
    * @param canvas {Object}  The canvas to render the object list into.
    */
   K3D.Controller = function(canvas, nopause)
   {
      K3D.Controller.superclass.constructor.call(this);
      
      this.canvas = canvas;
      
      // bind click event to toggle rendering loop on/off
      var me = this;
      if (!nopause)
      {
         canvas.onclick = function(event)
         {
            me.paused = !me.paused;
            if (!me.paused)
            {
               me.frame();
            }
         };
      }
   };
   
   extend(K3D.Controller, K3D.BaseController,
   {
      canvas: null,
      paused: true,
      callback: null,
      fps: 40,
      lastFrameStart: 0,
      
      /**
       * Add a K3D object to the list of objects for rendering
       */
      addK3DObject: function(obj)
      {
         obj.setController(this, this.canvas.width, this.canvas.height);
         this.objects.push(obj);
      },
      
      /**
       * Leave this method for backward compatability
       */
      tick: function()
      {
         this.frame();
      },
      
      /**
       * Render frame - should be called via a setInterval() function
       */
      frame: function()
      {
         var frameStart = new Date().getTime();
         
         if (this.callback)
         {
            this.callback.call(this);
         }
         
         var ctx = this.canvas.getContext('2d');
         if (this.lastFrameStart)
         {
            this.resetBackground(ctx);
         }
         // execute methods to process rendering pipeline
         this.processFrame(ctx);
         
         // calculate interval required for smooth animation
         var delay = 1000/this.fps;
         var frameTime = (new Date().getTime() - frameStart);
         if (!this.paused)
         {
            var me = this;
            setTimeout(function(){me.frame()}, delay - frameTime <= 0 ? 1 : delay - frameTime);
         }
         if (DEBUG && DEBUG.FPS)
         {
            ctx.fillStyle = "grey";
            ctx.fillText("TPF: " + frameTime, 4, 16);
            var frameFPS = Math.round(1000 / (frameStart - this.lastFrameStart));
            ctx.fillText("FPS: " + frameFPS, 4, 24);
         }
         this.lastFrameStart = frameStart;
      }
   });
})();


/**
 * K3D.RequestAnimController class.
 * 
 * Canvas controller based around the RequestAnimationFrame API - which means the FPS
 * should be automatically handled by the browser at capped at 60 FPS.
 */
(function()
{
   /**
    * K3D.Controller constructor
    * 
    * @param canvas {Object}  The canvas to render the object list into.
    */
   K3D.RequestAnimController = function(canvas, nopause)
   {
      K3D.Controller.superclass.constructor.call(this);
      
      this.canvas = canvas;
      this.framecount = 1;
      
      // bind click event to toggle rendering loop on/off
      var me = this;
      if (!nopause)
      {
         canvas.onclick = function(event)
         {
            me.paused = !me.paused;
            if (!me.paused)
            {
               me.frame();
            }
         };
      }
   };
   
   extend(K3D.RequestAnimController, K3D.BaseController,
   {
      canvas: null,
      paused: true,
      callback: null,
      totalfps: 0,
      framecount: 0,
      lastFrameStart: 0,
      
      /**
       * Add a K3D object to the list of objects for rendering
       */
      addK3DObject: function(obj)
      {
         obj.setController(this, this.canvas.width, this.canvas.height);
         this.objects.push(obj);
      },
      
      /**
       * Render frame
       */
      frame: function()
      {
         var frameStart = Date.now();
         
         if (this.callback)
         {
            this.callback.call(this);
         }
         
         // clear areas based on the last position of each object boundries
         var ctx = this.canvas.getContext('2d');
         this.resetBackground(ctx);
         
         // execute methods to process rendering pipeline
         this.processFrame(ctx);
         
         // calculate interval required for smooth animation
         var frameTime = (Date.now() - frameStart);
         if (!this.paused)
         {
            // for browsers not supporting requestAnimationFrame natively, we calculate
            // the offset between each frame to attempt to maintain a smooth fps
            var frameOffset = ~~(1000/60 - frameTime),
                me = this;
            // ensure the correct scope is applied to the outer function
            requestAnimFrame(function() {me.frame.call(me)}, frameOffset);
         }
         if (DEBUG && DEBUG.FPS)
         {
            ctx.save();
            var frameFPS = Math.round(1000 / (frameStart - this.lastFrameStart)),
                avgfps = Math.round((this.totalfps += frameFPS) / (this.framecount++));
            ctx.fillStyle = "white";
            ctx.fillRect(4, 4, 128, 10);
            ctx.fillStyle = "black";
            ctx.fillText("TPF: " + frameTime + " FPS: " + frameFPS + " AVF: " + avgfps, 4, 12);
            ctx.restore();
         }
         this.lastFrameStart = frameStart;
      }
   });
})();


// requestAnimFrame shim
window.requestAnimFrame = (function()
{
   return  window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function(callback, frameOffset)
           {
               window.setTimeout(callback, frameOffset);
           };
})();