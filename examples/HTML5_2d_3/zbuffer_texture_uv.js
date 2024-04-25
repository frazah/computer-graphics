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

function getPixel(imageData, x, y) {
    var index = (x + y * imageData.width) * 4;
    r = imageData.data[index+0];
    g = imageData.data[index+1];
    b = imageData.data[index+2];
    a = imageData.data[index+3];
    return {r :r, g :g, b :b, a :a};
}

/********************************************/
/*           Function draw_image                  */
/********************************************/
function draw_image(id, imgData, x, y, z, w, vtx, vty) {
var x0,y0,z0;
var x1,y1,z1;
var x2,y2,z2;
var xmin,xmax,ymin,ymax;
var ix,iy,iz,fz;
var ir,ig,ib,ia;
var alpha, beta, gamma;
var xim0,yim0,xim1,yim1,xim2,yim2;
var fx,fy,fz,aa,bb;
var i,j,pix1,pix2,pix3,pix4;

/*triangolo immagine con cui texturare il triangolo schermo */
   xim0=vtx[0]; yim0=vty[0];
   xim1=vtx[1]; yim1=vty[1];
   xim2=vtx[2]; yim2=vty[2];
/*triangolo schermo */
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
/*corregge il parametro per il triangolo 3D con il quale si puo' risalire
 all'immagine; se commentiamo queste 4 linee si avra' un problema sull'
 immagine proiettata */
/**/
                 fz=alpha/w[0]+beta/w[1]+gamma/w[2];
                 alpha=alpha/(w[0]*fz);
                 beta=beta/(w[1]*fz);
                 gamma=gamma/(w[2]*fz);
/**/
                 fx=alpha*xim0+beta*xim1+gamma*xim2;
                 fy=alpha*yim0+beta*yim1+gamma*yim2;
                 j=Math.floor(fx);
                 i=Math.floor(fy);
                 aa=fx-j;
                 bb=fy-i;

/*bilinear interpolation */
                 pix1=getPixel(id, j, i);
                 pix2=getPixel(id, j+1, i);
                 pix3=getPixel(id, j, i+1);
                 pix4=getPixel(id, j+1, i+1);

                 ir=Math.floor((1-aa)*(1-bb)*pix1.r+aa*(1-bb)*pix2.r+bb*(1-aa)*pix3.r+aa*bb*pix4.r);
                 ig=Math.floor((1-aa)*(1-bb)*pix1.g+aa*(1-bb)*pix2.g+bb*(1-aa)*pix3.g+aa*bb*pix4.g);
                 ib=Math.floor((1-aa)*(1-bb)*pix1.b+aa*(1-bb)*pix2.b+bb*(1-aa)*pix3.b+aa*bb*pix4.b);
                 ia=Math.floor((1-aa)*(1-bb)*pix1.a+aa*(1-bb)*pix2.a+bb*(1-aa)*pix3.a+aa*bb*pix4.a);

                 setPixel(imgData, ix, iy, ir, ig, ib, ia);
             }
            }
     }
     ctx.putImageData(imgData, 0, 0);
}

//trasformazione coordinate texture in coordinate immagine
function text_map(tx,ty,vtx,vty,wim,him) {
   for (var i=0; i<tx.length; i++){
     vtx[i] = Math.round(wim * tx[i]);
     vty[i] = Math.round(him * ty[i]);
   }
}

/* algoritmo ZBuffer */
function zbuffer_texture(id, imgData,){
var xx=[],yy=[],zz=[],ww=[];
var vtx=[], vty=[];
var vvx=[], vvy=[];
var i0,i1,i2;

//inizializza lo Z-buffer
   for (var i=0; i<canvas.height; i++){
     ZB[i]=new Array;
     for (var j=0; j<canvas.width; j++)
       ZB[i][j]=B;
   }

/* disegno mesh 3D*/
   for (var nf=0;nf<nface;nf++){
     n=face[nf].length;
     text_map(tx[nf],ty[nf],vtx,vty,wim,him);

/*ogni faccia quadrata viene divisa in due triangoli */
     for (var k=0; k<n-2; k++){
        i0=face[nf][0];i1=face[nf][k+1];i2=face[nf][k+2];
        xx[0]=xs[i0];yy[0]=ys[i0];zz[0]=zs[i0]; ww[0]=ws[i0];
        xx[1]=xs[i1];yy[1]=ys[i1];zz[1]=zs[i1]; ww[1]=ws[i1];
        xx[2]=xs[i2];yy[2]=ys[i2];zz[2]=zs[i2]; ww[2]=ws[i2];
        vvx[0]=vtx[0]; vvy[0]=vty[0];
        vvx[1]=vtx[k+1]; vvy[1]=vty[k+1];
        vvx[2]=vtx[k+2]; vvy[2]=vty[k+2];
/*rasterizza triangolo schermo*/
        draw_image(id, imgData, xx, yy, zz, ww, vvx, vvy);
     }
  }
}