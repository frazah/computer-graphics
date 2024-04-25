function f01(x0, y0, x1, y1, x, y) {
        return (y0-y1)*x+(x1-x0)*y+x0*y1-x1*y0;
}

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
}

/********************************************/
/*           Function draw_color_triang     */
/********************************************/
function draw_color_triang(id, x, y, z, r, g, b) {
var x0,y0,z0;
var x1,y1,z1;
var x2,y2,z2;
var xmin,xmax,ymin,ymax;
var ix,iy,iz,fz;
var ir,ig,ib;
var alpha, beta, gamma;

/*initialization */
x0=x[0];y0=y[0];z0=z[0];
x1=x[1];y1=y[1];z1=z[1];
x2=x[2];y2=y[2];z2=z[2];

/* triangle extent */
   xmin = Math.min(...x);
   xmax = Math.max(...x);
   ymin = Math.min(...y);
   ymax = Math.max(...y);

/* triangle rasterization */
   for (var ix=Math.max(1,xmin); ix<=Math.min(canvas.width-1,xmax); ix++)
     for (var iy=Math.max(1,ymin); iy<=Math.min(canvas.height-1,ymax); iy++) {
/* barycentric coordinates */
             alpha=f01(x1,y1,x2,y2,ix,iy)/f01(x1,y1,x2,y2,x0,y0);
             beta=f01(x2,y2,x0,y0,ix,iy)/f01(x2,y2,x0,y0,x1,y1);
             gamma=f01(x0,y0,x1,y1,ix,iy)/f01(x0,y0,x1,y1,x2,y2);
             if (alpha>=0 && beta>=0 && gamma>=0) {
                     iz=alpha*z0+beta*z1+gamma*z2;
                     if (iz < ZB[iy][ix]) {
                        ZB[iy][ix]=iz;
                        fz=alpha/z0+beta/z1+gamma/z2;
                        alpha=alpha/(z0*fz);
                        beta=beta/(z1*fz);
                        gamma=gamma/(z2*fz);
                        ir=Math.floor(alpha*r[0]+beta*r[1]+gamma*r[2]);
                        ig=Math.floor(alpha*g[0]+beta*g[1]+gamma*g[2]);
                        ib=Math.floor(alpha*b[0]+beta*b[1]+gamma*b[2]);
                        setPixel(id, ix, iy, ir, ig, ib, 255)
                    }
             }
     }
   ctx.putImageData(id, 0, 0);
}

/* algoritmo ZBuffer */
function zbuffer_color(id){
var xx=[], yy=[], zz=[];
var r=[],g=[],b=[];
var i0,i1,i2;
        
 /* inizializza lo ZBuffer al valore del back plane */
   for (var i=0; i<canvas.height; i++){
        ZB[i]=new Array;
        for (var j=0; j<canvas.width; j++)
          ZB[i][j]=B;
      }
    
/* disegno mesh 3D*/
   for (var nf=0;nf<nface;nf++){
      n=face[nf].length;

/*ogni faccia quadrata viene divisa in due triangoli */
     for (var k=0; k<n-2; k++)
       {
        i0=face[nf][0];i1=face[nf][k+1];i2=face[nf][k+2];
        xx[0]=xs[i0];yy[0]=ys[i0];zz[0]=zs[i0];
        xx[1]=xs[i1];yy[1]=ys[i1];zz[1]=zs[i1];
        xx[2]=xs[i2];yy[2]=ys[i2];zz[2]=zs[i2];
        r[0]=red[nf][0];g[0]=green[nf][0];b[0]=blue[nf][0];
        r[1]=red[nf][k+1];g[1]=green[nf][k+1];b[1]=blue[nf][k+1];
        r[2]=red[nf][k+2];g[2]=green[nf][k+2];b[2]=blue[nf][k+2];

/*rasterizza triangolo schermo*/
        draw_color_triang(id, xx, yy, zz, r, g, b)
      }
  }
}