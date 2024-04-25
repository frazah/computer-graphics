var canvas = document.getElementById('mycanvas'); 
var ctx = canvas.getContext("2d");
const WH=400; //dimensione canvas WH x WH

/* Dati per visualizzare un oggetto definito da vertici e lati*/
var   x=[],y=[],z=[];                         /* coordinate vertici */
var   face=new Array();                       /* lista facce */
var   red=new Array;
var   green=new Array;
var   blue=new Array;                         /* componenti colori ai vertici */
var   nvert,nface;                            /* numero vertici e facce */
var   csx,csy,csz;                            /* centro scena */
var   D=25, teta = 20,fi = 20, di;
var   steta,cteta,cfi,sfi;
var   xs=[],ys=[],zs=[];                      /* coordinate schermo */
var   salpha=0.025;                           /* zoomin e zoomout */
/* modifica parametri vista */
var   Dstep=25, alpha, s;                      /* passo di incremento D e apertura angolare frustum*/
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
var A=0.125, B;                             /* front plane e back plane */
var ZB=new Array;                           /* ZBuffer array di float  */
var gc_alfa,gc_beta;

function copy_trasl(nv, nf, dx, dy, dz) {

 for (var i=0; i<nv; i++) {
   x[i+nvert]=x[i]+dx;
   y[i+nvert]=y[i]+dy;
   z[i+nvert]=z[i]+dz;
 }
 
 var k=0;
 for (var i=0; i<nf; i++){
    face[i+nface]=new Array();
    red[i+nface]=new Array();
    green[i+nface]=new Array();
    blue[i+nface]=new Array();
    for (var j=0; j<4; j++){
      face[i+nface][j]=face[k][j]+nvert;
      red[i+nface][j]=red[k][j];
      green[i+nface][j]=green[k][j];
      blue[i+nface][j]=blue[k][j];
    }
    k++;
  }
 nvert+=nv;
 nface+=nf;
}

/* funzione che definisce l'oggetto mesh 3D*/
function define_object() {
/* coordinate dei vertici dell'oggetto */
nvert=8;
x=[-1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0];
y=[-1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0];
z=[-1.0, -1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0];

/* lista delle facce dell'oggetto*/
nface=6;
face=[[0, 1, 5, 4],[6, 5, 1, 2],[3, 7, 6, 2],[4, 7, 3, 0],[4, 5, 6, 7],[3, 2, 1, 0]];

/*Definisco componenti colore dei vertici delle facce dell'oggetto */
red=[[255,255,255,255],[255,255,255,255],[0,0,0,0],[0,0,0,0],[255,255,255,255],[0,0,0,0]];
green=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[255,255,255,255],[255,255,255,255],[255,255,255,255]];
blue=[[255,255,255,255],[0,0,0,0],[255,255,255,255],[255,255,255,255],[0,0,0,0],[0,0,0,0]];

// copy_trasl(8,6,2.0,0.0,0.0);
// copy_trasl(8,6,0.0,2.0,0.0);
// copy_trasl(8,6,0.0,0.0,2.0);
}

function define_view() {
var   r;
var   xmin,xmax,ymin,ymax,zmin,zmax;

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
/* centro oggetto iniziale */
  csx = (xmin + xmax)/2;
  csy = (ymin + ymax)/2;
  csz = (zmin + zmax)/2;

/* raggio sfera contenente oggetto */
  r = Math.sqrt(Math.pow(xmax-csx,2)+Math.pow(ymax-csy,2)+Math.pow(zmax-csz,2));
/* semilato window iniziale; il piano di proiezione viene assunto
   ad una distanza D dall'osservatore */
  D = 4*r;
  di=0.5*D;
  s = r*di/Math.sqrt(Math.pow(D,2)-Math.pow(r,2));
/* in base al semilato window cosi' calcolato si determina l'apertura angolare iniziale */
  alpha=Math.atan(s/di);
}

window.onload = function init() {
    canvas.setAttribute('width', WH);
    canvas.setAttribute('height', WH);
    
    view.vxmin = 0;
    view.vymin = 0;
    view.vxmax = canvas.width;
    view.vymax = canvas.height;  

    define_object();   /* definizione oggetto mesh 3D*/
    define_view();     /* calcolo parametri di vista */

// buttons to change viewing parameters
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
       
    render();        /* renderizza l'oggetto/scena */
}

/* trasformazione prospettica a tre punti di fuga (generico punto di vista) */
function trasf_rif_gen(x, y, z ) {
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

/* aggiorna i parametri di vista se sono cambiati  e chiama zbuffer*/
function render() {
var t,u;
var v,w;
var xe,ye,ze;         /* coord. dell'osservatore */

ctx.clearRect(0,0,canvas.width,canvas.height);
var id = ctx.getImageData(0, 0, canvas.width, canvas.height);

/* ricalcola il semilato della window in base ad alpha e alla 
   distanza D della camera*/
 if (change_alpha_D){
   s=di*Math.tan(alpha);
   win.wxmin = -1 ;
   win.wxmax = 1;
   win.wymin = -1;
   win.wymax = 1;

/* A=front plane, B=back plane */
   B=D+4;
/* proiezione prospettica con correzione */
   gc_alfa=B/(B-A);
   gc_beta=-A*B/(B-A);

/* fattori di scala per trasf. Window-Viewport */
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

 /* il piano di proiezione viene definito a passare per l'origine */
 //di=D;

 for (var k=0;k<nvert;k++) {
/* trasformazione prospettica */
    w=trasf_rif_gen(x[k]-csx,y[k]-csy,z[k]-csz);
/* proiezione con profondita' e trasformazione window-viewport */
    v=win_view((di/s * w.xe)/w.ze,(di/s * w.ye)/w.ze,scx,scy,view,win)
    xs[k]=v.ixp;
    ys[k]=v.iyp;
    zs[k] = gc_alfa + gc_beta/w.ze; 
  }

/* disegno mesh 3D*/
  zbuffer_color(id);
}
