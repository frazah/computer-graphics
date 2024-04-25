var  xa=[] , dx=[];
var  yymax=[] , yymin=[];
var  edges , startedge , endedge , scandec;
var  scan;
/*                                                                    */
/*                          POLYINSERT                                */
/*                                                                    */
/*  Questa procedura ordina i lati del triangolo e memorizza le infor-*/
/*  mazioni del nuovo lato; e' un ordinamento ad inserzione.          */
/*  DATI IN INGRESSO                                                  */
/*    x21 , y21 , x22 , y22 : coordinate degli estremi del lato.      */
/*                                                                    */
function polyinsert(edges, x21, y21, x22, y22) {
var j1, ym;

   j1=edges;
   if (y21 > y22)
	   ym=y21;
   else
	   ym=y22;
   while ((j1 != 1) && (yymax[j1-1] <ym)) {
         yymax[j1]=yymax[j1-1];
         yymin[j1]=yymin[j1-1];
         dx[j1]=dx[j1-1];
         xa[j1]=xa[j1-1];
         j1=j1-1;
   }
   yymax[j1]=ym;
   dx[j1]=(x22-x21)/(y22-y21);
   if (y21 > y22) {
         yymin[j1]=y22;
         xa[j1]=x21;
   }
   else {
         yymin[j1]=y21;
         xa[j1]=x22;
   }
}/* polyinsert */

/*                                                                    */
/*                             LOADPOL                                */
/*                                                                    */
/* Questa procedura ordina i lati del triangolo secondo il valore del-*/
/*  le ordinate piu' grandi. Inoltre memorizza e recupera delle infor-*/
/*  mazioni relative ai lati eccetto quelli orrizontali.              */
/*                                                                    */
function loadpol(polx, poly) {
      edges=0;
      if (poly[0]!=poly[1]) {
            edges=edges+1;
            polyinsert(edges,polx[0],poly[0],polx[1],poly[1]);
      }
      if (poly[1]!=poly[2]) {
            edges=edges+1;
            polyinsert(edges,polx[1],poly[1],polx[2],poly[2]);
      }
      if (poly[2]!=poly[0]) {
            edges=edges+1;
            polyinsert(edges,polx[2],poly[2],polx[0],poly[0]);
      }
}/* loadpol */

/*                                                                    */
/*                            INCLUDE                                 */
/*                                                                    */
/*  Questa procedura aggiunge nuovi lati al gruppo che si sta conside-*/
/*  rando.                                                            */
/*                                                                    */
function includ() {
   while ((endedge <= edges) && (yymax[endedge] >= scan)) {
         dx[endedge]=dx[endedge]*(-scandec);
         endedge=endedge+1;
   }
}/* includ */

/*                                                                    */
/*                           XSORT                                    */
/*                                                                    */
/*  Questa procedura mette un elemento nella posizione corretta usando*/
/*  un algoritmo a bolla.                                             */
/*                                                                    */
function xsort(kk) {
var l, it;
var ft;

   l=kk;
   while ((l > startedge) && (xa[l] < xa[l-1])) {
         it=yymin[l-1]; yymin[l-1]=yymin[l]; yymin[l]=it;
         ft=xa[l-1];    xa[l-1]=xa[l];       xa[l]=ft;
         ft=dx[l-1];    dx[l-1]=dx[l];       dx[l]=ft;
         l=l-1;
    }
}/* xsort */

/*                                                                    */
/*                        UPDATEXVALUES                               */
/*                                                                    */
/*  Questa procedura rimuove i lati che non devono essere piu' consi- */
/*  derati;inoltre determina i punti di intersezione dei restanti lati*/
/*  con la scanline.                                                  */
/*                                                                    */
function updatexvalues() {
var stopedge, beginedge;

   stopedge=endedge-1;
   beginedge=startedge;
   for (var k=beginedge; k<=stopedge; k++) {
      if (yymin[k] < scan) {
            xa[k]=xa[k]+dx[k];
            xsort(k);
       }
      else {
            startedge=startedge+1;
            if (startedge <= k)
               for (var i=k; i>=startedge; i--) {
                     yymin[i]=yymin[i-1];
                     xa[i]=xa[i-1];
                     dx[i]=dx[i-1];
                }
       }
   }
}/* updatexvalue */

/*                                                                    */
/*                               FILLSCAN                             */
/*                                                                    */
/*  Questa procedura disegna i segmenti individuati dalle intersezioni*/
/*  trovate con la procedura updatexvalues.                           */
/*                                                                    */
function fillscan(id, ir, ig, ib) {
var nx , j , y , x1 , x2;

   nx=Math.floor((endedge-startedge) / 2.0);
   j=startedge;
   y=Math.floor(scan);
   for (var k=1; k<=nx; k++) {
       if (xa[j+1]-xa[j] >= 0.5) {
         x1=Math.floor(xa[j]+0.5);
         x2=Math.floor(xa[j+1]+0.5);
         for (var ix=x1; ix<=x2; ix++)
            setPixel(id, ix, y, ir, ig, ib, 255);
         // moveTo(x1,y);
         // lineTo(x2,y);
        }
       j=j+2;
    }
}/* fillscan */

/*                             SCANCONVTRIANG                         */
/*                                                                    */
/*  Questa procedura fa lo scan conversion di un triangolo.           */
/*  DATI IN INGRESSO                                                  */
/*    polx  : vettori contenenti le ascisse e le ordinate dei vertici */
/*    poly    del triangolo.                                          */
/*                                                                    */
function scanconvtriang(id, polx, poly, ir, ig, ib) {

   scandec=1;
   loadpol(polx,poly);
   if (edges > 1) {
         scan=yymax[1]-0.5;
         startedge=1;
         endedge=1;
         includ();
         updatexvalues();
         while (endedge != startedge) {
               fillscan(id, ir, ig, ib);
               scan=scan-scandec;
               includ();
               updatexvalues();
         }
   }
   ctx.putImageData(id, 0, 0);
}/* scanconvtriang */
