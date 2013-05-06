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

var ctv0 = new THREE.Vector3();    
var ctv1 = new THREE.Vector3();    
var ctv2 = new THREE.Vector3();    

var ctuv0 = new THREE.Vector2();
var ctuv1 = new THREE.Vector2();
var ctuv2 = new THREE.Vector2();

var ctlb = new THREE.Vector2();
var ctub = new THREE.Vector2();

var pj = new THREE.Projector();
function projectWorld2Cvs(vt, rdr, cmr) {
    pj.projectVector(vt, cmr);
    vt.x = (vt.x / 2 + 0.5) * rdr.domElement.width;
    vt.y = (vt.y / -2 + 0.5) * rdr.domElement.height;
    return vt;
}

function projectCvs2World(vt, rdr, cmr) {
    vt.x = (vt.x / rdr.domElement.width - 0.5) * 2;
    vt.y = (vt.y / rdr.domElement.height - 0.5) * 2;
    pj.unprojectVector(vt, cmr);
    return vt;
}

function createTriangleTextureMesh(mh) {
    var ge = mh.geometry;
    var ma = mh.material;
    var data = null;
    
    if(mh.material == null || !(mh.material instanceof THREE.MeshBasicMaterial) || mh.material.map == null) {
        return;
    }
    
    var tma = new THREE.MeshFaceMaterial();
    
    for(i = 0, flen = ge.faces.length ; i < flen ; i++)  {
        var f = ge.faces[i];
        
        if(f instanceof THREE.Face3) {
            var tf31 = f;
            var v0 = ge.vertices[f.a];
            var v1 = ge.vertices[f.b];
            var v2 = ge.vertices[f.c];
            var uv0 = ge.faceVertexUvs[0][i][0];
            var uv1 = ge.faceVertexUvs[0][i][1];
            var uv2 = ge.faceVertexUvs[0][i][2];
            data = createTriangleTextureData(v0, v1, v2, uv0, uv1, uv2, ma.map.image, rdr, cmr);
            tma.materials.push(data.ma);
            tf31.materialIndex = tma.materials.length - 1;
            
            uv0.copy(data.uv0); uv1.copy(data.uv1); uv2.copy(data.uv2);
            
        } else if(f instanceof THREE.Face4) {
            var v0 = ge.vertices[f.a];
            var v1 = ge.vertices[f.b];
            var v2 = ge.vertices[f.c];
            var v3 = ge.vertices[f.d];
            var uv0 = ge.faceVertexUvs[0][i][0];
            var uv1 = ge.faceVertexUvs[0][i][1];
            var uv2 = ge.faceVertexUvs[0][i][2];
            var uv3 = ge.faceVertexUvs[0][i][3];
            
            
            var tf31 = new THREE.Face3(v0, v1, v2);
            data = createTriangleTextureData(v0, v1, v2, uv0, uv1, uv2, ma.map.image, rdr, cmr);
            tma.materials.push(data.ma);
            tf31.materialIndex = tma.materials.length - 1;
            tuv31 = [data.uv0, data.uv1, data.uv2];
            
            var tf32 = new THREE.Face3(v2, v3, v0);
            data = createTriangleTextureData(v2, v3, v0, uv2, uv3, uv0, ma.map.image, rdr, cmr);
            tma.materials.push(data.ma);
            tf32.materialIndex = tma.materials.length - 1;
            tuv32 = [data.uv0, data.uv1, data.uv2];
            
            ge.faces = ge.faces.splice(i, 1, tf31, tf32);
            ge.faceVertexUvs = ge.faceVertexUvs.splice(i, 1, tuv31, tuv32);
            
        }
    }
    mh.material = tma;
    
    
    return mh;
}


function expand( v1, v2 ) {

    var x = v2.x - v1.x, y =  v2.y - v1.y,
    det = x * x + y * y, idet;

    if ( det === 0 ) return;

    idet = 1 / Math.sqrt( det );

    x *= idet; y *= idet;

    v2.x += x; v2.y += y;
    v1.x -= x; v1.y -= y;

}

function createTriangleTextureData(v0, v1, v2, uv0, uv1, uv2, img, rdr, cmr) {
    if(img == null || img.width == 0 || img.height == null) {
        console.log('img is null or width is 0 or height is 0');
    }
    
    ctv0.copy(v0);
    //projectWorld2Cvs(ctv0, rdr, cmr);
    
    ctv1.copy(v1);
    //projectWorld2Cvs(ctv1, rdr, cmr);
    
    ctv2.copy(v2);
    //projectWorld2Cvs(ctv2, rdr, cmr);
    
    ctuv0.copy(uv0);
    ctuv0.y = 1 - ctuv0.y;
    
    ctuv1.copy(uv1);
    ctuv1.y = 1 - ctuv1.y;

    ctuv2.copy(uv2);
    ctuv2.y = 1 - ctuv2.y;
    
    
    var dataimg = new Image();
    var cvs = document.createElement('canvas');
    var ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctlb.x = Math.min(ctv0.x, ctv1.x, ctv2.x);
    ctlb.y = Math.min(ctv0.y, ctv1.y, ctv2.y);
    ctub.x = Math.max(ctv0.x, ctv1.x, ctv2.x);
    ctub.y = Math.max(ctv0.y, ctv1.y, ctv2.y);

    cvs.width = ctub.x - ctlb.x;
    cvs.height = ctub.y - ctlb.y;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    ctv0.x -= ctlb.x;
    ctv0.y -= ctlb.y;
    ctv1.x -= ctlb.x;
    ctv1.y -= ctlb.y;
    ctv2.x -= ctlb.x;
    ctv2.y -= ctlb.y;        
    drawTriangle(ctv0.x, ctv0.y, ctv1.x, ctv1.y, ctv2.x, ctv2.y, ctx);
    clipImage(ctv0.x, ctv0.y, ctv1.x, ctv1.y, ctv2.x, ctv2.y, ctuv0.x, ctuv0.y, ctuv1.x, ctuv1.y, ctuv2.x, ctuv2.y, img, ctx);
    dataimg.src = cvs.toDataURL();
    
    
    ctuv0.set(ctv0.x / cvs.width, 1 - (ctv0.y / cvs.height));
    ctuv1.set(ctv1.x / cvs.width, 1 - (ctv1.y / cvs.height));
    ctuv2.set(ctv2.x / cvs.width, 1 - (ctv2.y / cvs.height));
    
    
    var datatex = new THREE.Texture(dataimg); 
    datatex.needsUpdate = true;
    
    var datama = new THREE.MeshBasicMaterial({map:datatex, useTriangleTexture:true, doubleDraw:true});
    
    return {ma:datama, tex:datatex, imgdom:dataimg, uv0:new THREE.Vector2().copy(ctuv0), uv1:new THREE.Vector2().copy(ctuv1), uv2:new THREE.Vector2().copy(ctuv2)};
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


