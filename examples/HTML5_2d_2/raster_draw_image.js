var canvas1 = document.getElementById('mycanvas1');
var ctx1 = canvas1.getContext('2d');
var canvas2 = document.getElementById('mycanvas2');
var ctx2 = canvas2.getContext('2d');

var bbox1 = canvas1.getBoundingClientRect();
var bbox2 = canvas2.getBoundingClientRect();

var x=[], y=[]; 
var xt=[], yt=[];

var n=3;
var npunti1=0, npunti2=0;
var imgT;

var image = new Image();
image.src = "images/ganesha.png";

image.onload = function() {
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx1.drawImage(image, 0, 0);
  imgT = ctx1.getImageData(0, 0, image.width, image.height);

  canvas1.onmousedown = myDown1;
  canvas2.onmousedown = myDown2;
}

// function max(a, b, c) {
// var m;
//         m=a;
//         if (b>m) m=b;
//         if (c>m) m=c;
//         return m;
// }

// function min(a, b, c) {
// var m;
//         m=a;
//         if (b<m) m=b;
//         if (c<m) m=c;
//         return m;
// }

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
function draw_image(id, x, y, vtx, vty) {
var x0,y0;
var x1,y1;
var x2,y2;
var xmin,xmax,ymin,ymax;
var alpha, beta, gamma;
var xim0,yim0,xim1,yim1,xim2,yim2;
var fx,fy,aa,bb;
var i,j,pix1,pix2,pix3,pix4;
var ir, ig, ib;

/*triangolo immagine con cui texturare il triangolo schermo */
    xim0=vtx[0]; yim0=vty[0];
    xim1=vtx[1]; yim1=vty[1];
    xim2=vtx[2]; yim2=vty[2];
/*triangolo schermo */
    x0=x[0];y0=y[0];
    x1=x[1];y1=y[1];
    x2=x[2];y2=y[2];
/* triangle extent */
    // xmin=min(x0,x1,x2);
    // xmax=max(x0,x1,x2);
    // ymin=min(y0,y1,y2);
    // ymax=max(y0,y1,y2);
    xmin = Math.min(...x);
    xmax = Math.max(...x);
    ymin = Math.min(...y);
    ymax = Math.max(...y);
    
    var imgData=ctx2.createImageData(canvas2.width,canvas2.height);

/* triangle rasterization */
   for (var ix=xmin; ix<=xmax; ix++)
     for (var iy=ymin; iy<=ymax; iy++) {
/* barycentric coordinates */
             alpha=f01(x1,y1,x2,y2,ix,iy)/f01(x1,y1,x2,y2,x0,y0);
             beta=f01(x2,y2,x0,y0,ix,iy)/f01(x2,y2,x0,y0,x1,y1);
             gamma=f01(x0,y0,x1,y1,ix,iy)/f01(x0,y0,x1,y1,x2,y2);
             if (alpha>0 && beta>0 && gamma>0) {
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
//printf("%d %d %d %d\n",pix1[0],pix1[1],pix1[2],pix1[3]);
                 ir=Math.floor((1-aa)*(1-bb)*pix1.r+aa*(1-bb)*pix2.r+bb*(1-aa)*pix3.r+aa*bb*pix4.r);
                 ig=Math.floor((1-aa)*(1-bb)*pix1.g+aa*(1-bb)*pix2.g+bb*(1-aa)*pix3.g+aa*bb*pix4.g);
                 ib=Math.floor((1-aa)*(1-bb)*pix1.b+aa*(1-bb)*pix2.b+bb*(1-aa)*pix3.b+aa*bb*pix4.b);
/*nearest neighbour */
                 setPixel(imgData, ix, iy, ir, ig, ib, 255);
             }
     }
     ctx2.putImageData(imgData, 0, 0);
}

function clearAll(){  
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  ctx1.drawImage(image, 0, 0);
  imgT = ctx1.getImageData(0, 0, image.width, image.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
}

function myDown1(e){ 
 if (npunti1==0 && npunti2==0){
     clearAll();
 }

 if (npunti1<n) {   
    xt[npunti1]=Math.round(e.pageX-bbox1.left);
    yt[npunti1]=Math.round(e.pageY-bbox1.top);
    // disegna punto selezionato
    ctx1.beginPath();
    ctx1.fillStyle = 'red';
    ctx1.arc(xt[npunti1], yt[npunti1], 3, 0, Math.PI*2, true); 
    ctx1.fill();
    npunti1++;

    if(npunti2==n && npunti1==n)   {
/* rasterizza un triangolo */
       draw_image(imgT,x,y,xt,yt);
       npunti1=0;
       npunti2=0;
//       return
    }
  }
}

function myDown2(e){ 
 if (npunti1==0 && npunti2==0){
     clearAll();
 }

 if (npunti2<n) {  
    x[npunti2]=Math.round(e.pageX-bbox2.left);
    y[npunti2]=Math.round(e.pageY-bbox2.top);
    // disegna punto selezionato
    ctx2.beginPath();
    ctx2.fillStyle = 'blue';
    ctx2.arc(x[npunti2], y[npunti2], 3, 0, Math.PI*2, true); 
    ctx2.fill();
    npunti2++;

    if(npunti2==n && npunti1==n)   {
/* rasterizza un triangolo */
       draw_image(imgT,x,y,xt,yt);
       npunti1=0;
       npunti2=0;
//       return
    }
  }
}