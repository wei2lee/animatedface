THREE.Vector3.prototype.o = {
    x: 0,
    y: 0,
    z: 0,
    d: 0
};

THREE.Face3.prototype.set = function(a,b,c) {
    this.a=a;
    this.b=b;
    this.c=c;
};

THREE.Face4.prototype.set = function(a,b,c,d) {
    this.a=a;
    this.b=b;
    this.c=c;
    this.d=d;
};

THREE.Object3D.prototype.hitTestRect = function(lb, up) {
    return false;   
}

THREE.Object3D.prototype.hitTest = function(p) {
    return false;   
}





var Renderer2d = function(param){
    THREE.CanvasRenderer.call(this, param);
};
Renderer2d.prototype = Object.create( THREE.CanvasRenderer.prototype );




function drawTriangle( x0, y0, x1, y1, x2, y2, _context  ) {

    _context.beginPath();
    _context.moveTo( x0, y0 );
    _context.lineTo( x1, y1 );
    _context.lineTo( x2, y2 );
    _context.closePath();

}
function clipImage( x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2, image, _context ) {

    // http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

    var a, b, c, d, e, f, det, idet,
    width = image.width - 1,
    height = image.height - 1;

    u0 *= width; v0 *= height;
    u1 *= width; v1 *= height;
    u2 *= width; v2 *= height;

    x1 -= x0; y1 -= y0;
    x2 -= x0; y2 -= y0;

    u1 -= u0; v1 -= v0;
    u2 -= u0; v2 -= v0;

    det = u1 * v2 - u2 * v1;

    idet = 1 / det;

    a = ( v2 * x1 - v1 * x2 ) * idet;
    b = ( v2 * y1 - v1 * y2 ) * idet;
    c = ( u1 * x2 - u2 * x1 ) * idet;
    d = ( u1 * y2 - u2 * y1 ) * idet;

    e = x0 - a * u0 - c * v0;
    f = y0 - b * u0 - d * v0;

    _context.save();
    _context.transform( a, b, c, d, e, f );        
    _context.clip();
    _context.drawImage( image, 0, 0 );
    _context.restore();

}
    
    


function rand() { return Math.random(); }
function inrng(val,lb,up) { return lb  <= val && val <= up; }
function calFVUVs(geo) {
    
    if(geo.faceVertexUvs[0].length > 0) {
    
        for (i = 0; i < geo.faceVertexUvs[0].length; i++) {
            for (j = 0; j < geo.faceVertexUvs[0][i].length; j++) {
                uv = geo.faceVertexUvs[0][i][j];
                uv.x = uv.x / f.img.b.w + 0.5;
                uv.y = uv.y / f.img.b.h + 0.5;
            }
        }
            
    } else {
        for (i = 0; i < geo.faces.length ; i++) {
            geo.faceVertexUvs[0].push([]);
            for(j = 0; j < 4; j++) {
                vt = null;
                if(j == 0) vt = geo.vertices[geo.faces[i].a];   
                if(j == 1) vt = geo.vertices[geo.faces[i].b];   
                if(j == 2) vt = geo.vertices[geo.faces[i].c];   
                if(j == 3 && geo.faces[i].hasOwnProperty('d')) vt = geo.vertices[geo.faces[i].d];   
                
                if(vt) {
                    uv = new THREE.Vector2(vt.x / f.img.b.w + 0.5, vt.y / f.img.b.h + 0.5);
                    geo.faceVertexUvs[0][i].push(uv);
                }
            }
        }
    }
}