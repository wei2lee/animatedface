/**
 * K3D widget demo
 * 
 * Copyright (C) Kevin Roast 2010
 * http://www.kevs3d.co.uk/dev
 * email: kevtoast at yahoo.com
 * twitter: @kevinroast
 * 
 * I place this code in the public domain - because it's not rocket science
 * and it won't make me any money, so do whatever you want with it, go crazy
 */

// bind to window events
window.addEventListener('load', onloadHandler, false);

/**
 * Window onload handler
 */
function onloadHandler()
{
   var CANVASSIZE = 64;
   var OFFSET = 10;
   
   // create canvas element for the k3d render output
   var canvas = document.createElement('canvas');
   if (!canvas) return;
   canvas.width = CANVASSIZE;
   canvas.height = CANVASSIZE;
   canvas.title = "Kevs 3D";
   canvas.style.position = "absolute";
   canvas.style.zIndex = 100;
   canvas.style.cursor = "pointer";
   document.body.appendChild(canvas);
   canvas.style.left = canvas.style.top = OFFSET + "px";
   
   // track scroll position to update widget pos
   var destinationY = positionY = OFFSET;
   
   // bind scrolling event listener - needs reference to the canvas element
   window.addEventListener('scroll', function onscroll()
      {
         destinationY = window.pageYOffset + OFFSET;
      }, false);
   
   // create k3d controller and bind to the canvas
   var k3d = new K3D.Controller(canvas, true);
   k3d.fps = 50;
   
   // generate object
   var obj = new K3D.K3DObject();
   
   // Icosahedron
   var t = (1+Math.sqrt(5))/2,
       tau = t/Math.sqrt(1+t*t),
       one = 1/Math.sqrt(1+t*t);
   with (obj)
   {
      drawmode = "solid";
      shademode = "lightsource";
      fillstroke = false;
      addgamma = 1; addtheta = -0.5; addphi = 0.8;
      scale = 32;
      init(
         [{x:tau,y:one,z:0}, {x:-tau,y:one,z:0}, {x:-tau,y:-one,z:0}, {x:tau,y:-one,z:0}, {x:one,y:0,z:tau}, {x:one,y:0,z:-tau}, {x:-one,y:0,z:-tau}, {x:-one,y:0,z:tau}, {x:0,y:tau,z:one}, {x:0,y:-tau,z:one}, {x:0,y:-tau,z:-one}, {x:0,y:tau,z:-one}],
         [{a:4,b:8}, {a:8,b:7}, {a:7,b:4}, {a:7,b:9}, {a:9,b:4}, {a:5,b:6}, {a:6,b:11}, {a:11,b:5}, {a:5,b:10}, {a:10,b:6}, {a:0,b:4}, {a:4,b:3}, {a:3,b:0}, {a:3,b:5}, {a:5,b:0}, {a:2,b:7}, {a:7,b:1}, {a:1,b:2}, {a:1,b:6}, {a:6,b:2}, {a:8,b:0}, {a:0,b:11}, {a:11,b:8}, {a:11,b:1}, {a:1,b:8}, {a:9,b:10}, {a:10,b:3}, {a:3,b:9}, {a:9,b:2}, {a:2,b:10} ],
         [{color:[255,255,255],vertices:[4, 8, 7]}, {color:[255,255,0],vertices:[4, 7, 9]}, {color:[0,255,255],vertices:[5, 6, 11]}, {color:[128,0,255],vertices:[5, 10, 6]}, {color:[0,0,255],vertices:[0, 4, 3]}, {color:[255,0,0],vertices:[0, 3, 5]}, {color:[0,255,0],vertices:[2, 7, 1]}, {color:[255,0,0],vertices:[2, 1, 6]}, {color:[128,128,128],vertices:[8, 0, 11]}, {color:[255,128,0],vertices:[8, 11, 1]}, {color:[0,128,255],vertices:[9, 10, 3]}, {color:[255,0,128],vertices:[9, 2, 10]}, {color:[0,128,255],vertices:[8, 4, 0]}, {color:[128,255,0],vertices:[11, 0, 5]}, {color:[0,255,128],vertices:[4, 9, 3]}, {color:[128,255,255],vertices:[5, 3, 10]}, {color:[255,128,255],vertices:[7, 8, 1]}, {color:[128,0,255],vertices:[6, 1, 11]}, {color:[0,255,128],vertices:[7, 2, 9]}, {color:[255,0,255],vertices:[6, 10, 2]}]
      );
   }
   k3d.addK3DObject(obj);
   
   // canvas position state
   k3d.callback = function()
   {
      if (positionY != destinationY)
      {
         // track towards new destination Y position
         positionY += (destinationY - positionY) / OFFSET;
         canvas.style.top = Math.floor(positionY) + "px";
      }
   };
   
   canvas.addEventListener('click', function click() {
      window.location.href = INDEX;
      }, false);
   
   // start demo loop
   k3d.paused = false;
   k3d.frame();
}