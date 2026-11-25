// SVG overlays drawn over the building: tree garlands, chimney smoke, the Lviv lamp,
// the gift, icicles, the wreath, the first star and the door light.
//
// The body of buildOverlaySvg() is copied verbatim from the prototype (lines 242–305 of
// "Gentle December — сайт/index.html"). Do not reformat or edit it: the shapes are
// hand-placed on the illustration and use a seeded random generator, so any change
// moves them. tests/houseOverlays.test.js checks the output against the prototype.
//
// Coordinates use viewBox "0 0 614 516", which covers the 1400×1177 illustration.
// Each light is a <g class="dg" id="w-<LIGHT_ID>"> that is shown when its day is done.

export const OVERLAY_VIEWBOX = "0 0 614 516";

/** @returns {string} inner markup for <svg viewBox="0 0 614 516"> */
export function buildOverlaySvg() {
let sd=5;const rr=()=>(sd=sd*16807%2147483647)/2147483647;
const f1=n=>n.toFixed(1);
let s='<defs>'+
'<radialGradient id="gw"><stop offset="0" stop-color="#fff2c2" stop-opacity="1"/><stop offset=".35" stop-color="#ffcf6e" stop-opacity=".55"/><stop offset="1" stop-color="#ffbf5a" stop-opacity="0"/></radialGradient>'+
'<radialGradient id="gc"><stop offset="0" stop-color="#ffffff" stop-opacity="1"/><stop offset=".4" stop-color="#d9ecff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient>'+
'<radialGradient id="gs"><stop offset="0" stop-color="#fffbe8"/><stop offset=".25" stop-color="#ffe7a0" stop-opacity=".7"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>'+
'<filter id="wc" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>'+
'<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter>'+
'<filter id="bl1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>'+
'</defs>';
const bulb=(x,y,c,r)=>'<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+(r*3.4).toFixed(1)+'" fill="url(#gw)"/><circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+r+'" fill="'+c+'"/>';
const COLS=["#fff4c8","#ffd36b","#ffb347","#fff4c8","#ff8f6b","#ffd36b"];
function tree(id,cx,top,base,half){
  let g='<g class="dg" id="w-'+id+'">',wire='',b='';
  [.26,.45,.64,.84].forEach((f,row)=>{
    const y0=top+(base-top)*f,hw=half*f*.95,n=Math.max(3,Math.round(hw/6.5)),tilt=(row%2?1:-1)*hw*.18;
    let pts=[];for(let i=0;i<=n;i++){const t=i/n,x=cx-hw+2*hw*t,y=y0+tilt*(t-.5)*2+Math.sin(Math.PI*t)*hw*.12;pts.push([x,y])}
    wire+='<path d="M'+pts.map(p=>f1(p[0])+' '+f1(p[1])).join(' L')+'" fill="none" stroke="#6b4a2a" stroke-opacity=".35" stroke-width=".6"/>';
    pts.forEach((p,i)=>{b+=bulb(p[0]+(rr()-.5)*1.5,p[1]+(rr()-.5)*1.5,COLS[(i+row)%COLS.length],half>30?1.7:1.4)});
  });
  return g+wire+b+'<g>'+bulb(cx,top+3,"#fff6d0",2.2)+'</g></g>';
}
function smoke(id,cx,ty,dir){
  let g='<g class="dg" id="w-'+id+'" filter="url(#bl)">';
  for(let i=0;i<8;i++){const x=cx+dir*(i*5+Math.sin(i*1.3)*4),y=ty-4-i*8.5,r=4+i*2.1;
    g+='<circle cx="'+f1(x)+'" cy="'+f1(y)+'" r="'+f1(r)+'" fill="'+(i%2?"#f3efea":"#e2ddd8")+'" opacity="'+(0.85-i*.09).toFixed(2)+'"/>'}
  return g+'</g>';
}
// Lviv lantern base (always visible)
const LX=578,LT=372;
s+='<g filter="url(#wc)"><rect x="'+(LX-1.8)+'" y="'+(LT+28)+'" width="3.6" height="'+(490-LT-28)+'" fill="#2b2a33"/><path d="M'+(LX-7)+' 492 L'+(LX+7)+' 492 L'+(LX+4)+' 478 L'+(LX-4)+' 478Z" fill="#2b2a33"/>'+
 '<path d="M'+(LX-9)+' '+(LT+6)+' L'+(LX+9)+' '+(LT+6)+' L'+(LX+6)+' '+(LT+27)+' L'+(LX-6)+' '+(LT+27)+'Z" fill="#3d4560" stroke="#2b2a33" stroke-width="2"/>'+
 '<path d="M'+(LX-11)+' '+(LT+6)+' L'+LX+' '+(LT-6)+' L'+(LX+11)+' '+(LT+6)+'Z" fill="#2b2a33"/><circle cx="'+LX+'" cy="'+(LT-8)+'" r="2.2" fill="#2b2a33"/>'+
 '<rect x="'+(LX-7)+'" y="'+(LT+27)+'" width="14" height="3" fill="#2b2a33"/><path d="M'+(LX-6)+' '+(LT+40)+' q-8 4 -6 12 M'+(LX+6)+' '+(LT+40)+' q8 4 6 12" stroke="#2b2a33" stroke-width="1.6" fill="none"/></g>';
s+='<g class="dg" id="w-LAMP"><circle cx="'+LX+'" cy="'+(LT+16)+'" r="46" fill="url(#gw)"/><path d="M'+(LX-7.5)+' '+(LT+8)+' L'+(LX+7.5)+' '+(LT+8)+' L'+(LX+5)+' '+(LT+25.5)+' L'+(LX-5)+' '+(LT+25.5)+'Z" fill="#ffe08a"/><path d="M'+LX+' '+(LT+8)+' V'+(LT+25.5)+'" stroke="#2b2a33" stroke-width="1.2"/></g>';
// trees
s+=tree("T1",164,345,488,44)+tree("T2",452,350,488,40)+tree("T3",217,392,488,21)+tree("T4",509,384,490,28);
// smoke
s+=smoke("SMOKE1",270,14,1)+smoke("SMOKE2",504,38,-1);
// gift
s+='<g class="dg" id="w-GIFT"><ellipse cx="102" cy="486" rx="26" ry="9" fill="url(#gw)"/><g filter="url(#wc)">'+
 '<rect x="89" y="465" width="26" height="20" rx="1.5" fill="#c9343c"/><rect x="87" y="460" width="30" height="7" rx="1.5" fill="#b02a33"/>'+
 '<rect x="100" y="460" width="4" height="25" fill="#f2c94c"/><ellipse cx="97" cy="457" rx="5" ry="3.4" fill="#f2c94c" transform="rotate(-20 97 457)"/><ellipse cx="107" cy="457" rx="5" ry="3.4" fill="#f2c94c" transform="rotate(20 107 457)"/><circle cx="102" cy="459" r="2" fill="#e0ad2e"/></g></g>';
// icicles
{let g='<g class="dg" id="w-ICE"><g filter="url(#bl1)" opacity=".7">',c='',L=[6,11,15,9,13,7,16,10];
 [[32,281,100],[441,583,99]].forEach(([a,b,y])=>{let k=0;for(let x=a;x<=b;x+=7.5,k++){const l=L[k%L.length];
   g+='<line x1="'+f1(x)+'" y1="'+y+'" x2="'+f1(x)+'" y2="'+f1(y+l)+'" stroke="#d6ecff" stroke-width="3.2" stroke-linecap="round"/>';
   c+='<line x1="'+f1(x)+'" y1="'+y+'" x2="'+f1(x)+'" y2="'+f1(y+l)+'" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/><circle cx="'+f1(x)+'" cy="'+f1(y+l+.5)+'" r="1.3" fill="#ffffff"/>'}
   c+='<line x1="'+a+'" y1="'+y+'" x2="'+b+'" y2="'+y+'" stroke="#e8f4ff" stroke-width=".8"/>'});
 s+=g+'</g>'+c+'</g>';}
// wreath
{const cx=385.5,cy=352;let g='<g class="dg" id="w-WREATH"><circle cx="'+cx+'" cy="'+cy+'" r="30" fill="url(#gw)" opacity=".7"/><g filter="url(#wc)">';
 const G=["#2f5a3a","#3f7048","#25472e","#4b7d50"];
 for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=13+(rr()-.5)*2;g+='<circle cx="'+f1(cx+Math.cos(a)*r)+'" cy="'+f1(cy+Math.sin(a)*r)+'" r="'+f1(4.2+rr()*1.4)+'" fill="'+G[i%4]+'"/>'}
 for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;g+='<circle cx="'+f1(cx+Math.cos(a)*13)+'" cy="'+f1(cy+Math.sin(a)*13)+'" r="1.7" fill="#d7262e"/>'}
 g+='<path d="M'+cx+' '+(cy+13)+' l-8 -5 l0 10 Z M'+cx+' '+(cy+13)+' l8 -5 l0 10 Z" fill="#d7262e"/><path d="M'+(cx-1.5)+' '+(cy+14)+' l-4 12 M'+(cx+1.5)+' '+(cy+14)+' l4 12" stroke="#d7262e" stroke-width="2.4" stroke-linecap="round"/></g>';
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.8;g+=bulb(cx+Math.cos(a)*13,cy+Math.sin(a)*13,"#fff1b8",1.1)}
 s+=g+'</g>';}
// first star
{const x=118,y=24;s+='<g class="dg" id="w-STAR"><circle cx="'+x+'" cy="'+y+'" r="42" fill="url(#gs)"/>'+
 '<path d="M'+x+' '+(y-19)+' Q'+(x+2.2)+' '+(y-2.2)+' '+(x+19)+' '+y+' Q'+(x+2.2)+' '+(y+2.2)+' '+x+' '+(y+19)+' Q'+(x-2.2)+' '+(y+2.2)+' '+(x-19)+' '+y+' Q'+(x-2.2)+' '+(y-2.2)+' '+x+' '+(y-19)+'Z" fill="#fff8dc"/>'+
 '<path d="M'+x+' '+(y-9)+' Q'+(x+1.2)+' '+(y-1.2)+' '+(x+9)+' '+y+' Q'+(x+1.2)+' '+(y+1.2)+' '+x+' '+(y+9)+' Q'+(x-1.2)+' '+(y+1.2)+' '+(x-9)+' '+y+' Q'+(x-1.2)+' '+(y-1.2)+' '+x+' '+(y-9)+'Z" fill="#ffe9a6" transform="rotate(45 '+x+' '+y+')"/></g>';}
// door light
s+='<g class="dg" id="w-DOOR"><ellipse cx="385.5" cy="372" rx="52" ry="74" fill="url(#gw)"/><rect x="363" y="320" width="45" height="101" rx="2" fill="#ffcf6e" opacity=".32" style="mix-blend-mode:screen"/><circle cx="381" cy="307" r="16" fill="url(#gw)"/><circle cx="381" cy="307" r="2.4" fill="#fff6d0"/><path d="M362 422 L409 422 L430 432 L341 432Z" fill="#ffd98a" opacity=".45" filter="url(#bl1)"/></g>';
return s;
}
