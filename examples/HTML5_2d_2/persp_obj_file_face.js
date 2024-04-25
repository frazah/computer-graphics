var canvas;
var ctx;

/* Dati per visualizzare un oggetto definito da vertici e facce*/
var   x=[],y=[],z=[];                         /* coordinate vertici */
var   face=new Array();                       /* lista facce */
var   nvert,nedge,nface;                      /* numero vertici, lati e facce */
var   csx,csy,csz;                            /* centro oggetto */
var   D, teta = 20,fi = 20,di;
var   steta,cteta,cfi,sfi;
var   xs=[],ys=[];                            /* coordinate schermo */
var   salpha=0.025;                            /* zoomin e zoomout */
/* modifica parametri vista */
var   Dstep=2.5, alpha, s;                     /* passo di incremento D e apertura angolare frustum */
var   change_teta_fi=1,change_alpha_D=1;
var dr = 5.0 * Math.PI/180.0;
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

// buttons to change viewing parameters
    // document.getElementById("Button1").onclick = function(){alpha  *= 0.9; change_alpha_D=1;render()};
    // document.getElementById("Button2").onclick = function(){alpha *= 1.1; change_alpha_D=1;render()};
    document.getElementById("Button1").onclick = function(){alpha += salpha; change_alpha_D=1;render()};
    document.getElementById("Button2").onclick = function(){alpha -= salpha; change_alpha_D=1;render()};
    document.getElementById("Button3").onclick = function(){D *= 1.1; change_alpha_D=1;render()};
    document.getElementById("Button4").onclick = function(){D *= 0.9; change_alpha_D=1;render()};
    // document.getElementById("Button3").onclick = function(){D -= Dstep; change_alpha_D=1;render()};
    // document.getElementById("Button4").onclick = function(){D += Dstep; change_alpha_D=1;render()};
    document.getElementById("Button5").onclick = function(){teta += dr; change_teta_fi=1;render()};
    document.getElementById("Button6").onclick = function(){teta -= dr; change_teta_fi=1;render()};
    document.getElementById("Button7").onclick = function(){fi += dr; change_teta_fi=1;render()};
    document.getElementById("Button8").onclick = function(){fi -= dr; change_teta_fi=1;render()};
}

function gc_openFile(event) {
     event.preventDefault();
     var input = event.target;
     var reader = new FileReader();
     reader.onload = function(){
        var mesh = new subd_mesh();
        var response = reader.result;
//ReadOBJ nella libreria glm_light.js
            var data = glmReadOBJ(response,mesh);
            mesh=data.mesh;
//disegnando le facce non serve chhiamare la LoadSubdivMesh
//            mesh=LoadSubdivMesh(mesh);

            Unitize(mesh);   
                    
            nvert=mesh.nvert;
            nedge=mesh.nedge;
            nface=mesh.nface;

            for (var i=0; i<nvert; i++)
            {
              x[i]=mesh.vert[i+1].x;
              y[i]=mesh.vert[i+1].y;
              z[i]=mesh.vert[i+1].z;         
            }

           for (var i=0; i<nface;  i++)
             face[i]=new Array();
           for (var i=0; i<nface; i++)
            for (var j=0; j<3; j++)
              face[i][j]=mesh.face[i+1].vert[j]-1;

            define_view();
            render();
  }
  reader.readAsText(input.files[0]);
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
  D=2*r;
  s = r*D/Math.sqrt(Math.pow(D,2)-Math.pow(r,2));
/* in base al semilato window cosi' calcolato si determina l'apertura
   angolare iniziale */
  alpha=Math.atan(s/D);
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

function render() {
var t,u;
var xe,ye,ze;    /* coord. dell'osservatore */

ctx.clearRect(0,0,canvas.width,canvas.height);

/* ricalcola il semilato della window in base ad alpha e alla 
   distanza D della camera*/
 if (change_alpha_D){
   s=D*Math.tan(alpha);
   win.wxmin = -s ;
   win.wxmax = s;
   win.wymin = -s;
   win.wymax = s;
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
 di=D;

 for (var k=0;k<nvert;k++) {
/* trasformazione prospettica */
    v=trasf_rif_gen(x[k]-csx,y[k]-csy,z[k]-csz);
/* trasformazione window-viwport */
    v=win_view((di * v.xe)/v.ze,(di * v.ye)/v.ze,scx,scy,view,win)
    xs[k]=v.ixp;
    ys[k]=v.iyp;
 }

/* disegno mesh 3D*/
ctx.strokeStyle = 'rgb(255,0,0)';
ctx.beginPath();
  for (var k=0;k<nface;k++) {
    t=face[k][2];
    ctx.moveTo(xs[t],ys[t]);
    for (var j=0; j<3; j++) {
      u=face[k][j];
      ctx.lineTo(xs[u],ys[u])
    }
  }
ctx.stroke();

//window.requestAnimationFrame(render);
}
