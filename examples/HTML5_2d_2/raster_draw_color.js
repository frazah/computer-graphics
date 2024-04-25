var canvas = document.getElementById('mycanvas');
var ctx = canvas.getContext('2d');
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var bbox = canvas.getBoundingClientRect();
var x=[],y=[]; 
var r=[],g=[],b=[]; 
var n=3;
var npunti=0;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  var id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

/*colors setting*/
  var  r = [255,255,255];
  var  g = [0,0,0];
  var  b = [0,0,0];

  canvas.onmousedown = myDown;

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

/********************************************/
/*           Function draw_color_triang     */
/********************************************/
function draw_color_triang(id, n, x, y, r, g, b) {
var x0,y0,r0,g0,b0;
var x1,y1,r1,g1,b1;
var x2,y2,r2,g2,b2;
var xmin,xmax,ymin,ymax;
var ir,ig,ib;
var alpha, beta, gamma;

/*initialization */
x0=x[0];y0=y[0];
x1=x[1];y1=y[1];
x2=x[2];y2=y[2];
r0=r[0];g0=g[0];b0=b[0];
r1=r[1];g1=g[1];b1=b[1];
r2=r[2];g2=g[2];b2=b[2];

/* triangle extent */
  //  xmin=min(x0,x1,x2);
  //  xmax=max(x0,x1,x2);
  //  ymin=min(y0,y1,y2);
  //  ymax=max(y0,y1,y2);
   xmin = Math.min(...x);
   xmax = Math.max(...x);
   ymin = Math.min(...y);
   ymax = Math.max(...y);

   /* triangle rasterization */
   for (var ix=xmin; ix<=xmax; ix++)
     for (var iy=ymin; iy<=ymax; iy++) {
/* barycentric coordinates */
             alpha=f01(x1,y1,x2,y2,ix,iy)/f01(x1,y1,x2,y2,x0,y0);
             beta=f01(x2,y2,x0,y0,ix,iy)/f01(x2,y2,x0,y0,x1,y1);
             gamma=f01(x0,y0,x1,y1,ix,iy)/f01(x0,y0,x1,y1,x2,y2);
             if (alpha>=0 && beta>=0 && gamma>=0) {
                     ir=Math.floor(alpha*r0+beta*r1+gamma*r2);
                     ig=Math.floor(alpha*g0+beta*g1+gamma*g2);
                     ib=Math.floor(alpha*b0+beta*b1+gamma*b2);
                     setPixel(id, ix, iy, ir, ig, ib, 255)
             }
     }
   ctx.putImageData(id, 0, 0);
}

function myDown(e){ 

 if (npunti==0){
   ctx.clearRect(0, 0, canvasWidth, canvasHeight);
   id = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
   ctx.putImageData(id, 0, 0); 
 }

 if (npunti<n) {   
    x[npunti]=e.pageX;
    y[npunti]=e.pageY;
    // disegna punto selezionato
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.arc(e.pageX-bbox.left, e.pageY-bbox.top, 3, 0, Math.PI*2, true); 
    ctx.fill();
    npunti++;
  
    if(npunti==n)   {
/* rasterizza un triangolo */
       draw_color_triang(id,n,x,y,r,g,b);
       npunti=0;
       return
    }
  }
}