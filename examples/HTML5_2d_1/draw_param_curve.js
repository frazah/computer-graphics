    var n=100;
    var canvas, canvas_context;
    var view = {
      vxmin: 0,
      vxmax: 0,
      vymin: 0,
      vymax: 0 }
    var win = {
      wxmin: -1.0,
      wxmax: 1.0,
      wymin: -1.0,
      wymax: 1.0 }
    var scx, scy;
 
//alcune curve  in forma parametrica di esempio
//circonferenza
//var a=0; b=2*Math.PI;
// var radius=1.0;
// fx=radius*Math.cos(t);
// fy=radius*Math.sin(t);

//folium of Descartes
//var a=0; b=2*Math.PI;
// fx=3*aa*t/(1+Math.pow(t,3));
// fy=3*aa*Math.pow(t,2)/(1+Math.pow(t,3));

//cardiode
//var a=0; b=2*Math.PI;
// fx = 2*Math.cos(t)-Math.cos(2*t);
// fy = 2*Math.sin(t)-Math.sin(2*t);

//astroid
var a=0; b=2*Math.PI;
// var bb=1.0, aa=(6-1)*bb;
// fx = aa*Math.pow(Math.cos(t),3);
// fy = aa*Math.pow(Math.sin(t),3);

//epicicloide
//var a=0; b=2*Math.PI;
// var bb=1.0, aa=(6-1)*bb;
// fx = (aa+bb)*Math.cos(t)-bb*Math.cos((aa/bb+1.0)*t);
// fy = (aa+bb)*Math.sin(t)-bb*Math.sin((aa/bb+1.0)*t);

    function param_curv(t){
    var fx,fy;
    var bb=1.0, aa=(6-1)*bb;
    fx = aa*Math.pow(Math.cos(t),3);
    fy = aa*Math.pow(Math.sin(t),3);
    return{x: fx, y: fy};
    }
     
    function init() {
     canvas = document.getElementById('mycanvas'); 
     canvas_context = canvas.getContext("2d");
     
     view.vxmin=0;
     view.vxmax=canvas.width;
     view.vymin=0;
     view.vymax=canvas.height;
    
     win.wxmin=-3.0;
     win.wxmax=3.0;
     win.wymin=-3.0;
     win.wymax=3.0;

     scx=(view.vxmax-view.vxmin)/(win.wxmax-win.wxmin);
     scy=(view.vymax-view.vymin)/(win.wymax-win.wymin);
    }

    function myFunction() {
     var x = document.getElementById("myNumber").value;
     n = Number(x);
    }

    function set_square_win(xp,yp){
    var dx,dy,diff;
      win.wxmin=xp[0];
      win.wxmax=xp[0];
      for (var i=0; i<=xp.length; i++){
        if (xp[i] > win.wxmax)
          win.wxmax=xp[i];
        else
          if (xp[i] < win.wxmin)
            win.wxmin=xp[i];
      }

      win.wymin=yp[0];
      win.wymax=yp[0];
      for (var i=0; i<=yp.length; i++){
        if (yp[i] > win.wymax)
          win.wymax=yp[i];
        else
          if (yp[i] < win.wymin)
            win.wymin=yp[i];
      }

      dx=win.wxmax-win.wxmin;
      dy=win.wymax-win.wymin;
      if (dy > dx){
         diff=(dy-dx)/2;
         win.wxmin=win.wxmin-diff;
         win.wxmax=win.wxmax+diff;
      }
      else {
         diff=(dx-dy)/2;
         win.wymin=win.wymin-diff;
         win.wymax=win.wymax+diff;        
      }
      scx=(view.vxmax-view.vxmin)/(win.wxmax-win.wxmin);
      scy=(view.vymax-view.vymin)/(win.wymax-win.wymin);
    }

    function win_view(px,py,scx,scy,view,win) {
      ixp = scx * (px - win.wxmin) + view.vxmin;
      iyp = scy * (win.wymin - py) + view.vymax;
      return {ixp: ixp,iyp: iyp};
    }

    function drawOnCanvas() {
       var fxp=[],fyp=[];
       var h,t,ff;
       var ixp=[], iyp=[];

       h=(b-a)/n;
       for(var j=0; j<=n; j++){
          t = a + j*h;
          ff=param_curv(t);
          fxp[j]=ff.x;
          fyp[j]=ff.y;
       }
       set_square_win(fxp,fyp);
       for(var j=0; j<=n; j++){
        ip=win_view(fxp[j],fyp[j],scx,scy,view,win);
        ixp[j]=ip.ixp;
        iyp[j]=ip.iyp;
      }
      canvas_context.beginPath();
      canvas_context.strokeStyle = 'rgb(0,0,255)';
      canvas_context.moveTo(ixp[0], iyp[0]);
      for(var i=1; i<=n; i++){
           canvas_context.lineTo(ixp[i], iyp[i]);
      }
      canvas_context.stroke();
    }

    function cancelCanvas() {
      canvas_context.clearRect(0,0,canvas.width,canvas.height);
    }

    init();