/**
 * Dimblebot Avatar
 * 
 * Copyright (C) Kevin Roast 2010
 * http://www.kevs3d.co.uk/dev
 * email: kevtoast at yahoo.com
 * twitter: @kevinroast
 * 
 * I place this code in the public domain - because it's not rocket science
 * and it won't make me any money, so do whatever you want with it, go crazy
 */

//window.addEventListener('load', onloadHandler, false);
onloadHandler();

/**
 * Window onload handler
 */
function onloadHandler()
{
   var CANVASSIZE = 128;
   var OFFSET = 10;
   
   var CTRLKey = false;
   var destinationY = ~~(window.pageYOffset + OFFSET);
   
   // create canvas element for the k3d render output
   var canvas = document.createElement('canvas');
   if (!canvas) return;
   canvas.width = CANVASSIZE;
   canvas.height = CANVASSIZE;
   canvas.title = "Dimblebot";
   canvas.style.position = "absolute";
   canvas.style.zIndex = 100;
   document.body.appendChild(canvas);
   canvas.style.left = canvas.style.top = OFFSET + "px";
   canvas.style.top = destinationY + "px";
   
   // create overlay canvas for Dimble RAGE laser effect
   var overlay = document.createElement('canvas');
   overlay.style.position = "absolute";
   overlay.style.zIndex = 101;
   overlay.style.display = "none";
   document.body.appendChild(overlay);
   var overlayInterval = null;
   
   
   // create k3d controller and bind to the canvas
   var k3d = new K3D.Controller(canvas, true);
   k3d.sort = false;
   k3d.fps = 40;
   
   // generate 3D objects
   var objSuit = new K3D.K3DObject(),
       objHead = new K3D.K3DObject(),
       objGlasses = new K3D.K3DObject(),
       objOutlines = new K3D.K3DObject();
   
   // Dimblebot Suit object
   with (objSuit)
   {
      drawmode = "solid";
      shademode = "lightsource";
      fillstroke = false;
      sortmode = "unsorted";
      scale = 2.75;
      abouty = -60;
      init(
         [{x:-20,y:0,z:2}, {x:-20,y:13,z:2}, {x:-7,y:18,z:0}, {x:-3,y:0,z:0}, {x:20,y:0,z:2}, {x:3,y:0,z:0}, {x:7,y:18,z:0}, {x:20,y:13,z:2}, {x:-11,y:8,z:-1}, {x:-9,y:10,z:-1}, {x:-11,y:12,z:-1}, {x:11,y:8,z:-1}, {x:9,y:10,z:-1}, {x:11,y:12,z:-1}, {x:-2,y:8,z:-1}, {x:2,y:8,z:-1}, {x:-3,y:11,z:0}, {x:3,y:11,z:0}, {x:0,y:15,z:0}, {x:-5,y:9,z:0}, {x:5,y:9,z:0}],
         [],
         [{color:[50,50,95],vertices:[0,1,2,3,0]},
          {color:[50,50,95],vertices:[4,5,6,7,4]},
          {color:[35,65,110],vertices:[3,8,9,10,2,3]},
          {color:[35,65,110],vertices:[5,6,13,12,11,5]},
          {color:[225,225,225],vertices:[19,2,18]},
          {color:[225,225,225],vertices:[20,18,6]},
          {color:[200,200,200],vertices:[3,19,18,20,5,3]},
          {color:[245,182,30],vertices:[14,16,18,17,15,14]},
          {color:[255,172,40],vertices:[3,14,15,5,3]}
         ]
      );
   }
   
   // Dimblebot Head object
   with (objHead)
   {
      drawmode = "solid";
      shademode = "lightsource";
      fillstroke = false;
      sortmode = "unsorted";
      scale = 2.75;
      abouty = -60;
      init(
         [
         {x:-7.5,y:19,z:-1}, {x:-9,y:28,z:-1}, {x:-6.5,y:38,z:-1}, {x:6.5,y:38.5,z:-1}, {x:9,y:28,z:-1}, {x:7.5,y:19,z:-1}, {x:4,y:17,z:-1}, {x:-4,y:17,z:-1}, {x:-3.5,y:22,z:-1}, {x:3.5,y:22,z:-1}, {x:0,y:21,z:-1},
         {x:-10.5,y:30,z:-1}, {x:-9,y:41,z:-1}, {x:-4,y:43,z:-1}, {x:7,y:42,z:-1}, {x:11,y:31,z:-1},
         {x:2,y:14,z:-1}, {x:-2,y:14,z:-1},
         {x:-6.5,y:31,z:-1}, {x:-1.5,y:31,z:-1}, {x:-1.5,y:28,z:-1}, {x:-6.5,y:28,z:-1}, {x:1.5,y:31,z:-1}, {x:6.5,y:31,z:-1}, {x:6.5,y:28,z:-1}, {x:1.5,y:28,z:-1}
         ],
         [],
         [
         {color:[239,226,210],vertices:[0,1,2,3,4,5,16,17,0]},
         {color:[198,190,179],vertices:[1,11,12,13,14,15,4,3,2,1]},
         {color:[64,64,64],vertices:[8,9,10]},
         {color:[150,214,118],vertices:[18,19,20,21,18]},
         {color:[150,214,118],vertices:[22,23,24,25,22]}
         ]
      );
   }
   
   // Dimblebot wire outlines
   with (objOutlines)
   {
      drawmode = "wireframe";
      shademode = "plain";
      scale = 2.75;
      abouty = -60;
      linescale = 0.33;
      color = [64,64,64];
      init(
         [
         {x:-0.5,y:31,z:-1}, {x:0.5,y:31,z:-1}, {x:2,y:25,z:-1}, {x:0.5,y:25,z:-2.5}, {x:-0.5,y:25,z:-2.5}, {x:-2,y:25,z:-1},
         {x:4,y:17,z:-1}, {x:-4,y:17,z:-1}, {x:-3.5,y:22,z:-1}, {x:3.5,y:22,z:-1},
         {x:-5.5,y:30,z:-1}, {x:-3,y:30,z:-1}, {x:-2.5,y:29,z:-1}, {x:-5.5,y:29,z:-1}, {x:3,y:30,z:-1}, {x:5.5,y:30,z:-1}, {x:5.5,y:29,z:-1}, {x:2.5,y:29,z:-1}
         ],
         [
         {a:1,b:2}, {a:2,b:3}, {a:3,b:4}, {a:4,b:5}, {a:5,b:0}, {a:3,b:1}, {a:4,b:0}, {a:7,b:8}, {a:6,b:9},
         {a:10,b:11}, {a:11,b:12}, {a:12,b:13}, {a:13,b:10}, {a:14,b:15}, {a:15,b:16}, {a:16,b:17}, {a:17,b:14}
         ],
         []
      );
   }
   
   // Dimblebot glasses
   with (objGlasses)
   {
      drawmode = "wireframe";
      shademode = "plain";
      scale = 2.75;
      abouty = -60;
      linescale = 0.5;
      color = [32,32,32];
      init(
         [
         {x:-7,y:31.5,z:-1}, {x:-1,y:31.5,z:-1}, {x:-1,y:27.5,z:-1}, {x:-7,y:27.5,z:-1}, {x:1,y:31.5,z:-1}, {x:7,y:31.5,z:-1}, {x:7,y:27.5,z:-1}, {x:1,y:27.5,z:-1},
         {x:-10,y:30,z:-1}, {x:-7,y:30.5,z:-1}, {x:7.5,y:30.5,z:-1}, {x:10,y:30,z:-1}, {x:-1,y:30.5,z:-1}, {x:1,y:30.5,z:-1}
         ],
         [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:8,b:9}, {a:10,b:11}, {a:12,b:13}],
         []
      );
   }
   
   // add objects to k3d scene
   k3d.addK3DObject(objSuit);
   k3d.addK3DObject(objHead);
   k3d.addK3DObject(objOutlines);
   k3d.addK3DObject(objGlasses);
   
   
   var rotation = 0;
   var rotoffset = 1;
   // canvas position state
   k3d.callback = function()
   {
      // page scrolled?
      if (positionY != destinationY)
      {
         // track towards new destination Y position
         positionY += (destinationY - positionY) / OFFSET;
         canvas.style.top = ~~(positionY) + "px";
      }
      
      if (!overlayInterval)
      {
         // update rotation
         rotation += rotoffset;
         if (rotation > 35 || rotation < -35)
         {
            rotoffset = -rotoffset;
         }
      }
      else
      {
         rotation = 0;
      }
      objSuit.ophi = rotation;
      objHead.ophi = rotation;
      objOutlines.ophi = rotation;
      objGlasses.ophi = rotation;
   };
   
   
   // track scroll position to update widget pos
   var positionY = OFFSET;
   
   // bind scrolling event listener - needs reference to the canvas element
   window.addEventListener('scroll', function onscroll()
   {
      destinationY = window.pageYOffset + OFFSET;
   }, false);
   
   var mousex = 0, mousey = 0;
   var mouseMoveHandler = function(e)
   {
      mousex = e.clientX;
      mousey = e.clientY;
   };
   window.addEventListener("mousemove", mouseMoveHandler, false);
   
   var mouseDownHandler = function(e)
   {
      if (e.button == 0 && CTRLKey)
      {
         // show overlay canvas - sized to show a laser from dimblebot to the mouse location
         var width = window.innerWidth,
             height = window.innerHeight - OFFSET;
         //document.body.style.overflow = "hidden";
         overlay.style.top = canvas.style.top;
         overlay.style.left = 0;
         overlay.width = width;
         overlay.height = height;
         overlay.style.display = "block";
         //overlay.style.cursor = "crosshair";    // not working...
         var ctx = overlay.getContext('2d');
         ctx.lineCap = "round";
         ctx.lineJoin = "round";
         
         var rotation = 0;
         
         var renderer = function() {
            ctx.clearRect(0,0,width,height);
            // render lasers
            ctx.strokeStyle = ctx.shadowColor =
               "rgb(" + ~~(Rnd() * 32 + 64) + "," + ~~(Rnd() * 64 + 196) + ",64)";
            ctx.lineWidth = Rnd() * 2 + 4;
            ctx.shadowBlur = Rnd() * 2 + 6;
            ctx.beginPath();
            ctx.moveTo(64, OFFSET + 34);
            ctx.lineTo(mousex, mousey - OFFSET); // eye vertical point
            ctx.moveTo(84, OFFSET + 34);
            ctx.lineTo(mousex, mousey - OFFSET); // eye vertical point
            ctx.closePath();
            ctx.stroke();
            
            // render laser attack point
            ctx.fillStyle = ctx.shadowColor =
               "rgb(" + ~~(Rnd() * 64 + 64) + "," + ~~(Rnd() * 64 + 196) + ",64)";
            var rad = Rnd() * 4 + 4;
            ctx.save();
            ctx.translate(mousex, mousey - OFFSET);
            ctx.rotate(rotation);
            rotation += 0.1;
            ctx.beginPath()
            ctx.moveTo(rad * 2, 0);
            for (var i=0; i<15; i++)
            {
               ctx.rotate(PI/8);
               if (i%2 === 0)
               {
                  ctx.lineTo((rad * 2 / 0.5) * 0.2, 0);
               }
               else
               {
                  ctx.lineTo(rad * 2, 0);
               }
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
         };
         overlayInterval = setInterval(renderer, 1000/60);
      }
   };
   window.addEventListener("mousedown", mouseDownHandler, false);
   
   var mouseUpHandler = function(e)
   {
      if (e.button == 0)
      {
         if (overlayInterval)
         {
            // clean up
            overlay.style.display = "none";
            //document.body.style.overflow = "auto";
            clearInterval(overlayInterval);
            overlayInterval = null;
            var ctx = overlay.getContext('2d');
            ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
            
            // locate element under the mouse
            var el = document.elementFromPoint(mousex, mousey);
            // if it's not the html/body tag and not our canvas, remove it!
            if (el !== null && el !== canvas &&
                el.tagName !== 'HTML' && el.tagName !== 'BODY')
            {
               el.parentNode.removeChild(el);
            }
         }
      }
   };
   window.addEventListener("mouseup", mouseUpHandler, false);
   
   document.onkeydown = function(event)
   {
      var keyCode = (event === null ? window.event.keyCode : event.keyCode);
      switch (keyCode)
      {
         case 17:    // CTRL
            CTRLKey = true;
            break;
         case 27:    // ESC
            // how to unload - remove canvas element completely...?
            k3d.paused = true;
            canvas.style.display = "none";
            window.removeEventListener("mousemove", mouseMoveHandler, false);
            window.removeEventListener("mousedown", mouseDownHandler, false);
            window.removeEventListener("mouseup", mouseUpHandler, false);
            break;
      }
   };
   document.onkeyup = function(event)
   {
      var keyCode = (event === null ? window.event.keyCode : event.keyCode);
      if (keyCode == 17)
      {
         CTRLKey = false;
      }
   }
   
   // start animation loop
   k3d.paused = false;
   k3d.frame();
}