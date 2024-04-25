    var radius=1.0, n=7;
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
    
    function init() {
     canvas = document.getElementById('mycanvas'); 
     canvas_context = canvas.getContext("2d");
     
     view.vxmin=0;
     view.vxmax=canvas.width;
     view.vymin=0;
     view.vymax=canvas.height;
    
     win.wxmin=-1.0;
     win.wxmax=1.0;
     win.wymin=-1.0;
     win.wymax=1.0;

     scx=(view.vxmax-view.vxmin)/(win.wxmax-win.wxmin);
     scy=(view.vymax-view.vymin)/(win.wymax-win.wymin);
    }

    function myFunction() {
     var x = document.getElementById("myNumber").value;
     n = Number(x);
    }

    function win_view(px,py,scx,scy,view,win) {
      ixp = Math.round(scx * (px - win.wxmin) + view.vxmin);
      iyp = Math.round(scy * (win.wymin - py) + view.vymax);
      return {ixp: ixp,iyp: iyp};
    }

    function drawOnCanvas() {
       var fxp=[],fyp=[];
       var alfa,step;
       var ixp=[], iyp=[];
       step=6.28/n;
       for(var j=0; j<n; j++){
          alfa=j*step;
          fxp[j]=radius*Math.cos(alfa);
          fyp[j]=radius*Math.sin(alfa);
        }
      fxp[n]=fxp[0];
      fyp[n]=fyp[0];
      for(var j=0; j<=n; j++){
        ip=win_view(fxp[j],fyp[j],scx,scy,view,win);
        ixp[j]=ip.ixp;
        iyp[j]=ip.iyp;
      }
      canvas_context.beginPath();
      canvas_context.strokeStyle = 'rgb(255,0,0)';
       for(var i=0; i<n; i++){
         for(var j=i+1; j<=n; j++){
           canvas_context.moveTo(ixp[i], iyp[i]);
           canvas_context.lineTo(ixp[j], iyp[j]);
         }
       }
       canvas_context.stroke();
//       console.log("stampa di debug");
//       console.log(radius);
    }

    function cancelCanvas() {
      canvas_context.clearRect(0,0,canvas.width,canvas.height);
    }

    init();