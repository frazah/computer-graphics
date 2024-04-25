var canvas;
var ctx;

/* Dati per visualizzare un oggetto definito da vertici e lati*/
var   x=[],y=[],z=[];                         /* coordinate vertici */
var   face=new Array();                       /* lista facce */
var   nvert,nface,nobj=1;                     /* numero vertici, facce e oggetti */
var   csx,csy,csz;                            /* centro scena */
var   D=25, teta = 20,fi = 20, di;
var   steta,cteta,cfi,sfi;
var   xs=[],ys=[];                            /* coordinate schermo */
var   salpha=0.025;                           /* zoomin e zoomout */
/* modifica parametri vista */
var   Dstep=25, alpha, s;                     /* passo di incremento D e apertura angolare frustum*/
var   change_teta_fi=1,change_alpha_D=1;
var   dr = 5.0 * Math.PI/180.0;
//struttura viewport
var view = {
    vxmin: 0,
    vxmax: 0,
    vymin: 0,
    vymax: 0 }
//struttura window
var win = {
    wxmin: -1.0,
    wxmax: 1.0,
    wymin: -1.0,
    wymax: 1.0 }
//fattori di scala
var scx, scy;

window.onload = function init() {
  canvas = document.getElementById('mycanvas'); 
  ctx = canvas.getContext("2d");
  view.vxmin = 0;
  view.vymin = 0;
  view.vxmax = canvas.width;
  view.vymax = canvas.height;  

  define_object();   /* definizione oggetto/scena mesh 3D*/
  define_view();     /* calcolo parametri di vista */

// buttons to change viewing parameters
  // // document.getElementById("Button1").onclick = function(){alpha  *= 0.9; change_alpha_D=1;};
  // // document.getElementById("Button2").onclick = function(){alpha *= 1.1; change_alpha_D=1;};
  // document.getElementById("Button1").onclick = function(){alpha += salpha; change_alpha_D=1;};
  // document.getElementById("Button2").onclick = function(){alpha -= salpha; change_alpha_D=1;};
  // document.getElementById("Button3").onclick = function(){D *= 1.1; change_alpha_D=1;};
  // document.getElementById("Button4").onclick = function(){D *= 0.9; change_alpha_D=1;};
  // // document.getElementById("Button3").onclick = function(){D -= Dstep; change_alpha_D=1;};
  // // document.getElementById("Button4").onclick = function(){D += Dstep; change_alpha_D=1;};
  // document.getElementById("Button5").onclick = function(){teta += dr; change_teta_fi=1;};
  // document.getElementById("Button6").onclick = function(){teta -= dr; change_teta_fi=1;};
  // document.getElementById("Button7").onclick = function(){fi += dr; change_teta_fi=1;};
  // document.getElementById("Button8").onclick = function(){fi -= dr; change_teta_fi=1;};

  // document.getElementById("Button1").onclick = function(){alpha  *= 0.9;c hange_alpha_D=1;render();};
  // document.getElementById("Button2").onclick = function(){alpha *= 1.1; change_alpha_D=1; render();};
  document.getElementById("Button1").onclick = function(){alpha += salpha; change_alpha_D=1; render();};
  document.getElementById("Button2").onclick = function(){alpha -= salpha; change_alpha_D=1; render();};
  document.getElementById("Button3").onclick = function(){D *= 1.1; change_alpha_D=1; render();};
  document.getElementById("Button4").onclick = function(){D *= 0.9; change_alpha_D=1; render()};
  // document.getElementById("Button3").onclick = function(){D -= Dstep; change_alpha_D=1; render();};
  // document.getElementById("Button4").onclick = function(){D += Dstep; change_alpha_D=1; render();};
  document.getElementById("Button5").onclick = function(){teta += dr; change_teta_fi=1; render();};
  document.getElementById("Button6").onclick = function(){teta -= dr; change_teta_fi=1; render();};
  document.getElementById("Button7").onclick = function(){fi += dr; change_teta_fi=1; render();};
  document.getElementById("Button8").onclick = function(){fi -= dr; change_teta_fi=1; render();};
     
  render();
}

function copy_trasl(nv, dx, dy, dz) {
 for (var i=0; i<nv; i++) {
   x[i+nvert]=x[i]+dx;
   y[i+nvert]=y[i]+dy;
   z[i+nvert]=z[i]+dz;
 }
 nobj++;
 nvert+=nv;
}

/* funzione che definisce l'oggetto mesh 3D*/
function define_object() {
/* coordinate dei vertici dell'oggetto */
nvert=8;
x=[-1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0];
y=[-1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0];
z=[1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0];

/* lista delle facce dell'oggetto*/
nface=6;
face=[[3, 2, 1, 0],[0, 1, 5, 4],[6, 5, 1, 2],[3, 7, 6, 2],[4, 7, 3, 0],[4, 5, 6, 7]];

// copy_trasl(8,2.0,0.0,0.0);
// copy_trasl(8,0.0,2.0,0.0);
// copy_trasl(8,0.0,0.0,2.0);
}

function define_view() {
var   r;
var   xmin,xmax,ymin,ymax,zmin,zmax;

//Bounding Box dell'oggetto/scena
  xmin = x[0];
  ymin = y[0];
  zmin = z[0];
  xmax = xmin;
  ymax = ymin;
  zmax = zmin;
  for (var k=1;k<nvert;k++) {
        if (x[k] > xmax) xmax = x[k];
                else if (x[k]<xmin) xmin = x[k];
        if (y[k] > ymax) ymax = y[k];
                else if (y[k]<ymin) ymin = y[k];
        if (z[k] > zmax) zmax = z[k];
                else if (z[k]<zmin) zmin = z[k];
  }
/* centro oggetto/scena iniziale */
  csx = (xmin + xmax)/2;
  csy = (ymin + ymax)/2;
  csz = (zmin + zmax)/2;

/* raggio sfera contenente oggetto/scena */
  r = Math.sqrt(Math.pow(xmax-csx,2)+Math.pow(ymax-csy,2)+Math.pow(zmax-csz,2));
/* semilato window iniziale; il piano di proiezione viene assunto
   ad una distanza D dall'osservatore */
  D = 5*r;
  di=D;
  s = r*di/Math.sqrt(Math.pow(D,2)-Math.pow(r,2));
/* in base al semilato window cosi' calcolato si determina l'apertura
   angolare iniziale */
  alpha=Math.atan(s/di);
}

/* trasformazione prospettica a tre punti di fuga (generico punto di vista) */
function trasf_rif(x, y, z ) {
/* trasformazione in coordinate del sistema osservatore */  
 var xe = -steta*x + y*cteta;
 var ye = -cteta*cfi*x - y*steta*cfi + z*sfi;
 var ze = -x*cteta*sfi - y *steta*sfi - z*cfi + D;
 return {xe: xe, ye: ye, ze: ze}; 
}

/* trasformazione window-viewport */
function win_view(px,py,scx,scy,view,win) {
  ixp = Math.round(scx * (px - win.wxmin) + view.vxmin);
  iyp = Math.round(scy * (win.wymin - py) + view.vymax);
  return {ixp: ixp,iyp: iyp};
}

function render() {
var t,u;
var xe,ye,ze;    /* coord. dell'osservatore */

ctx.clearRect(0,0,canvas.width,canvas.height);

/* ricalcola il semilato della window in base ad alpha e alla 
   distanza D della camera*/
 if (change_alpha_D){
   s=di*Math.tan(alpha);
   win.wxmin = -s ;
   win.wxmax = s;
   win.wymin = -s;
   win.wymax = s;

/* fattori di scala per trasformazione Window-Viewport */
   scx = (view.vxmax - view.vxmin)/(win.wxmax - win.wxmin);
   scy = (view.vymax - view.vymin)/(win.wymax - win.wymin);
   change_alpha_D=0;
 }

/* ricalcola i parametri per la trasformazione prospettica*/
 if (change_teta_fi){
   steta=Math.sin(teta);
   cteta=Math.cos(teta);
   sfi=Math.sin(fi);
   cfi=Math.cos(fi);
   change_teta_fi=0;
 }

 /* il piano di proiezione viene definito a passare per l'origine
 infatti si è posto di=D */

 for (var k=0;k<nvert;k++) {
/* trasformazione prospettica */
    v=trasf_rif(x[k]-csx,y[k]-csy,z[k]-csz);
/* trasformazione window-viwport */
    v=win_view((di * v.xe)/v.ze,(di * v.ye)/v.ze,scx,scy,view,win)
    xs[k]=v.ixp;
    ys[k]=v.iyp;
 }

/* disegno facce della mesh 3D*/
 ctx.strokeStyle = 'rgb(255,0,0)';
 ctx.beginPath();
 for (var i=0; i<nobj; i++){
   offset=i*8;
   for (var k=0;k<nface;k++) {
     t=face[k][3]+offset;
     ctx.moveTo(xs[t],ys[t]);
     for (var j=0; j<4; j++) {
       u=face[k][j]+offset;
       ctx.lineTo(xs[u],ys[u])
     }
   }
 }
 ctx.stroke();
//console.log(D,teta,fi);
           
//window.requestAnimationFrame(render);
}
