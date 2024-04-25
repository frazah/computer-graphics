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
  // r[0]=255; g[0]=0;   b[0]=0;
  // r[1]=0;   g[1]=255; b[1]=0;
  // r[2]=0;   g[2]=0;   b[2]=255;
  var ir=255, ig=0, ib=0;

  canvas.onmousedown = myDown;

function setPixel(imageData, x, y, r, g, b, a) {
    var index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r;
    imageData.data[index+1] = g;
    imageData.data[index+2] = b;
    imageData.data[index+3] = a;
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
       scanconvtriang(id,x,y,ir,ig,ib);
       npunti=0;
       return
    }
  }
}