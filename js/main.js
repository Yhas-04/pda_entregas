const W=1476,H=632,SP=3,MW=369;
let bits;
const walk=(x,y)=>{
  if(x<0||y<0||x>=W||y>=H)return 0;
  const i=((y|0)>>2)*MW+((x|0)>>2);
  return(bits[i>>3]>>(7-(i&7)))&1
};
const TR = [
  // Portas dos restaurantes.
  { s: 'a', x: 1000, y: 296, r: 18, c: 'r', l: 'a' }, // Fresh Kingdom
  { s: 'b', x: 1295, y: 304, r: 18, c: 'r', l: 'b' }, // Restaurante redondo
  { s: 'c', x: 274, y: 276, r: 16, c: 'r', l: 'c' },  // Tomoria
  { s: 'd', x: 815, y: 214, r: 18, c: 'r', l: 'd' },  // Restaurante superior

  // Portas das casas.
  { s: 'a1', x: 595, y: 316, r: 18, c: 'h', l: 'A' },  // Casa verde
  { s: 'b1', x: 955, y: 476, r: 18, c: 'h', l: 'B' },  // Casa vermelha central
  { s: 'c1', x: 1370, y: 442, r: 18, c: 'h', l: 'C' }, // Casa azul
  { s: 'd1', x: 270, y: 478, r: 18, c: 'h', l: 'D' },  // Casa vermelha esquerda

  // Moeda.
  { s: 'm', x: 585, y: 156, r: 18, c: 's', l: 'F' },

  // Pedágio existente.
  { s: 'po', g: [350, 310, 394, 354], c: 'g', o: 'po' },

  // Pedágios nos semáforos amarelos: primeiro e segundo, respectivamente.
  { s: 'pe1', g: [1096, 112, 1140, 156], c: 't', o: 'pe1' },
  { s: 'pe2', g: [1150, 291, 1194, 335], c: 't', o: 'pe2' },
];

/* regras lidas de entregas_corrigido.jff: estado-origem estado-destino leitura topo empilha (λ = vazio) */
const RT=`q0 q0 a V A
q0 q0 a1 A M
q0 q0 d W KD
q0 q0 m M λ
q1 q1 a V A
q1 q1 a1 A M
q1 q1 c U C
q1 q1 c1 C M
q1 q1 d1 D M
q1 q1 m M λ
q2 q2 a V A
q2 q2 a1 A M
q2 q2 d W KD
q2 q2 b T B
q2 q2 b1 B M
q2 q2 m M λ
q3 q3 a V A
q3 q3 a1 A M
q3 q3 d W KD
q3 q3 b T B
q3 q3 b1 B M
q3 q3 m M λ
q4 q4 a V A
q4 q4 a1 A M
q4 q4 b T B
q4 q4 b1 B M
q4 q4 c U C
q4 q4 c1 C M
q4 q4 d1 D M
q4 q4 m M λ
q5 q5 a V A
q5 q5 a1 A M
q5 q5 b T B
q5 q5 b1 B M
q5 q5 c U C
q5 q5 c1 C M
q5 q5 d1 D M
q5 q5 m M λ
q0 q1 po K U
q2 q4 po K U
q3 q5 po K U
q0 q2 pe1 M T
q1 q4 pe1 M T
q2 q3 pe2 M λ
q4 q5 pe2 M λ
q5 q6 λ Z Z
q7 q0 λ Z VWZ
q7 q0 λ Z WVZ`;
const R=RT.split('\n').map(l=>{
  const[f,t,r,p,w]=l.split(' ');return{
    f,t,r,p,w
  }
});
const NM={
  q0:'inicio',
  q1:'portao',
  q2:'pedagio1',
  q3:'pedagio2',
  q4:'poEpe1',
  q5:'tdAberto',
  q6:'poupança',
  q7:'preparo'
};
const SN={
  Z:'Z · fundo',
  V:'V · ficha a',
  W:'W · ficha d',
  U:'U · ficha c',
  K:'K · chave',
  T:'T · ticket b',
  M:'M · moeda',
  A:'A · pedido',
  B:'B · pedido',
  C:'C · pedido',
  D:'D · pedido',
  VW:'V W · ordem livre'
};
const TOK=['pe1','pe2','po','a1','b1','c1','d1','a','b','c','d','m'];
const $=i=>document.getElementById(i),cv=$('cv'),img=new Image();
let ctx=cv.getContext('2d');
let cfgs,dead,done,pos,reason,tm,sym,opened,keys={},soft=false,flash='',ft;
function say(m){
  flash=m;
  clearTimeout(ft);
  ft=setTimeout(()=>{
    flash=''
  },2800)
}
/* configuração = {st, stack}; a pilha é um vetor com o topo no fim. O autômato é não determinístico só no "preparo" (V ou W no topo) */
function apply(c,ru){
  const s=c.stack.slice();
  if(ru.p!=='λ')s.pop();
  const w=ru.w==='λ'?'':ru.w;
  for(let i=w.length-1;i>=0;i--)s.push(w[i]);
  return{
    st:ru.t,
    stack:s
  }
}
const topC=c=>c.stack[c.stack.length-1];
function closure(cs){
  const seen=new Map(),
  q=cs.slice();

  while(q.length){
    const c=q.shift(),
    k=c.st+'|'+c.stack.join('');
    if(seen.has(k))continue;
    seen.set(k,c);

    for(const ru of R)if(ru.r==='λ'&&ru.f===c.st&&(ru.p==='λ'||ru.p===topC(c)))q.push(apply(c,ru))
  }
  const all=[...seen.values()],
  keep=all.filter(c=>c.st==='q6'||R.some(r=>r.f===c.st&&r.r!=='λ'));

  return keep.length?keep:all
}
const cur=()=>cfgs.find(c=>c.st==='q6')||cfgs[0];
const topOf=()=>topC(cur());
const can=s=>cfgs.some(c=>R.some(r=>r.f===c.st&&r.r===s&&(r.p==='λ'||r.p===topC(c))));
/* pilha mostrada na tela: se V e W ainda podem vir em qualquer ordem, vira uma linha só */
function viewStack(){

  if(cfgs.length<2)return cfgs[0].stack;

  const A=cfgs.map(c=>c.stack);
  let n=0;

  while(A.every(s=>s.length>n&&s[n]===A[0][n]))n++;

  const tops=A.map(s=>s.slice(n).sort().join(''));

  return tops.every(t=>t==='VW')?A[0].slice(0,n).concat(['VW']):A[0]
}
function reset(){
  clearInterval(tm);
  tm=0;
  flash='';
  cfgs=closure([{
    st:'q7',stack:['Z']
  }]);
  dead=done=false;
  opened={};
  pos={
    x:541,
    y:178
  };
  reason='';
  sym='—';

  TR.forEach(t=>t.in=false);
  popups=[];
  render()
}
function step(s){

  sym=s;
  const nx=[];

  for(const c of cfgs)for(const ru of R)if(ru.f===c.st&&ru.r===s&&(ru.p==='λ'||ru.p===topC(c)))nx.push(apply(c,ru));

  if(!nx.length){
    dead=true;
    const tops=[...new Set(cfgs.map(topC))].join(' ou '),
    c0=cfgs[0];

    reason=`sem transição em ${c0.st} (${NM[c0.st]}) lendo “${s}” com ${tops==='Z'?'só o fundo Z':tops+' no topo'}.`;
    render();
    return false
  }
  cfgs=closure(nx);
  done=cfgs.some(c=>c.st==='q6');
  render();
  return true
}
function fire(t){

  if(soft&&!can(t.s)){
    say(`Soft: “${t.s}” passou sem efeito (sem transição em ${cur().st} com ${topOf()==='Z'?'só Z':topOf()} no topo).`);
    return
  }
  let ok=step(t.s);
  if(ok&&t.o)opened[t.o]=1;
  if(ok&&/^[a-d]1?$/.test(t.s))spawnChar(t);

  if(t.s==='m')while(ok&&!done&&!dead&&topOf()==='M'&&can('m'))ok=step('m')
}
function render(){
  /* o loop() já desenha a cada quadro; desenhar aqui duplicava o custo justo ao pegar/entregar */
}
const COL={
  r:'#1971c2',
  h:'#2b9348',
  s:'#e64980'
};
function draw(){

  ctx.drawImage(img,0,0,W,H);
  ctx.textAlign='center';
  ctx.textBaseline='middle';

  TR.forEach(t=>{
    const cn=can(t.s),op=t.o&&opened[t.o];
    ctx.globalAlpha=soft&&!cn&&!op?.35:1;
    if(t.g){
      const g=t.g,w=g[2]-g[0],h=g[3]-g[1];ctx.fillStyle=op?'#2b9348':t.c==='g'?'#ffe600':'#ff5a00';ctx.fillRect(g[0],g[1],w,h);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(g[0],g[1],w,h);
      ctx.fillStyle='#000';ctx.font='bold 13px sans-serif';ctx.fillText(op?'✓':t.s,g[0]+w/2,g[1]+h/2)
    }
    else{
      ctx.fillStyle=COL[t.c];ctx.beginPath();ctx.arc(t.x,t.y,20,0,7);ctx.fill();ctx.strokeStyle=soft&&cn?'#ffe600':'#fff';ctx.lineWidth=soft&&cn?6:3;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.fillText(t.l,t.x,t.y+1)
    }
    ctx.globalAlpha=1
  });

  drawActors()
}
const CH=46,PH=0.96,PAL=[[109, 73, 61], [226, 197, 178], [55, 40, 40], [252, 213, 197], [255, 255, 255], [20, 18, 18], [63, 57, 66]];
let face=0,bob=0,was=0;
function mkMesh(V,T,C){
  const nv=V.length/3,
  nt=T.length/3;
  return{
    V,
    T,
    C,
    nv,
    nt,
    wx:new Float32Array(nv),
    wy:new Float32Array(nv),
    wz:new Float32Array(nv),
    sx:new Float32Array(nv),
    sy:new Float32Array(nv),
    dp:new Float32Array(nv),
    dep:new Float32Array(nt),
    sh:new Float32Array(nt),
    ord:new Uint32Array(nt)
  }
}
function parseMTL(text){
  const out={};
  let name='default';
  for(const line of text.split(/\r?\n/)){
    const p=line.trim().split(/\\s+/);
    if(p[0]==='newmtl'){
      name=p[1];
      out[name]=[190,190,190]
    }else if(p[0]==='Kd'&&p.length>=4){
      out[name]=p.slice(1,4).map(v=>Math.max(0,Math.min(255,Math.round(Number(v)*255))))
    }
  }
  return out
}
function parseOBJ(text,materials){
  const verts=[[0,0,0]],
  V=[],
  T=[],
  C=[];
  let mat='default';
  const addFace=ids=>{
    for(let j=1;j<ids.length-1;j++){
      const tri=[ids[0],ids[j],ids[j+1]];
      for(const id of tri)T.push(id-1);
      const col=materials[mat]||[190,190,190];
      C.push(...col)
    }
  };

  for(const line of text.split(/\r?\n/)){
    const p=line.trim().split(/\\s+/);
    if(p[0]==='v'&&p.length>=4)verts.push(p.slice(1,4).map(Number));
    else if(p[0]==='usemtl')mat=p[1];
    else if(p[0]==='f'&&p.length>=4)addFace(p.slice(1).map(x=>Number(x.split('/')[0])))
  }
  for(let i=1;i<verts.length;i++)V.push(...verts[i]);
  return mkMesh(new Float32Array(V),new Uint32Array(T),new Uint8Array(C))
}
let CM,SQ,SW,MESH={},SQW;
const MODEL_FILES=['chopper','duck','tiger','bunny1','bunny2','sk_Chef','sk_Cowboy','sk_Viking','sk_Ninja','sk_King','sk_Pharaoh','key','ticket','coin','pizza','burger','icecream','donut'];
async function loadAssets(){

  const [sqData,shadowData,collisionData]=await Promise.all([
  fetch('./assets/data/squirrel_mesh.json').then(r=>{
    if(!r.ok)throw Error('Falha ao carregar squirrel_mesh.json');return r.json()
  }),
  fetch('./assets/data/shadow_weights.json').then(r=>{
    if(!r.ok)throw Error('Falha ao carregar shadow_weights.json');return r.json()
  }),
  fetch('./assets/data/collision_map.json').then(r=>{
    if(!r.ok)throw Error('Falha ao carregar collision_map.json');return r.json()
  })
  ]);

  bits=new Uint8Array(collisionData);

  CM={
    V:new Float32Array(sqData.vertices),
    T:new Uint32Array(sqData.triangles),
    C:new Uint8Array(sqData.colors),
    nv:sqData.vertices.length/3,
    nt:sqData.colors.length
  };

  const colors=new Uint8Array(CM.nt*3);
  for(let i=0;i<CM.nt;i++){
    const c=PAL[CM.C[i]]||PAL[4];
    colors.set(c,i*3)
  }
  SQ=mkMesh(CM.V,CM.T,colors);
  SQ.P=new Float32Array(CM.V.length);
  SW=new Uint8Array(shadowData);

  SQW=[[],[],[],[],[]];
  for(let i=0;i<SQ.nv;i++)for(let p=0;p<5;p++){
    const w=SW[i*5+p];
    if(w)SQW[p].push(i,w/255)
  }
  await Promise.all(MODEL_FILES.map(async name=>{

    const obj=await fetch(`./assets/models/${name}.obj`).then(r=>{
      if(!r.ok)throw Error(`Falha ao carregar ${name}.obj`);return r.text()
    });
    const mtl=await fetch(`./assets/models/${name}.mtl`).then(r=>r.ok?r.text():'');
    MESH[name]=parseOBJ(obj,parseMTL(mtl));
  }));

  for(const k in IT){
    const m=MESH[IT[k]];
    let h=0;
    for(let i=1;i<m.V.length;i+=3)h=Math.max(h,m.V[i]);
    ITH[IT[k]]=h
  }
}
const IT={
  K:'key',
  T:'ticket',
  M:'coin',
  A:'pizza',
  B:'burger',
  C:'icecream',
  D:'donut'
};
const ITK={
  key:1.0,
  ticket:.95,
  coin:.9,
  pizza:1.0,
  burger:.9,
  icecream:.98,
  donut:.92
};
const ITH={};
const CHARS=['chopper','duck','tiger','bunny1','bunny2','sk_Chef','sk_Cowboy','sk_Viking','sk_Ninja','sk_King','sk_Pharaoh'];
let NOW=performance.now()/1000,ph=0,amp=0,tface=0,popups=[],lastChar='';
const I3=[1,0,0,0,1,0,0,0,1];
const mm=(a,b)=>{
  const r=new Array(9);
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];
  return r
};
const RX=t=>{
  const c=Math.cos(t),
  s=Math.sin(t);
  return[1,0,0,0,c,-s,0,s,c]
},RY=t=>{
  const c=Math.cos(t),
  s=Math.sin(t);
  return[c,0,s,0,1,0,-s,0,c]
},RZ=t=>{
  const c=Math.cos(t),
  s=Math.sin(t);
  return[c,-s,0,s,c,0,0,0,1]
};
const sc3=(a,k)=>a.map(v=>v*k);
const sstep=(a,b,x)=>{
  const t=Math.max(0,Math.min(1,(x-a)/(b-a)));
  return t*t*(3-2*t)
};
/* desenha uma malha: affine local (a,t) -> rotação global (yaw) -> projeção; normais recalculadas por quadro */
function drawMesh(M,src,a,tx,ty,tz,x,y,s,cs,sn){

  const{
    T,
    C,
    nv,
    nt,
    wx,
    wy,
    wz,
    sx,
    sy,
    dp,
    dep,
    sh,
    ord
  }
  =M,
  sp=Math.sin(PH),
  cp=Math.cos(PH);

  for(let i=0;i<nv;i++){
    const vx=src[i*3],
    vy=src[i*3+1],
    vz=src[i*3+2];

    const lx=a[0]*vx+a[1]*vy+a[2]*vz+tx,
    ly=a[3]*vx+a[4]*vy+a[5]*vz+ty,
    lz=a[6]*vx+a[7]*vy+a[8]*vz+tz;

    const X=lx*cs+lz*sn,
    Z=-lx*sn+lz*cs;
    wx[i]=X;
    wy[i]=ly;
    wz[i]=Z;
    sx[i]=x+X*s;
    sy[i]=y-(ly*cp-Z*sp)*s;
    dp[i]=ly*sp+Z*cp
  }
  let n=0;

  for(let i=0;i<nt;i++){
    const p=T[i*3],
    q=T[i*3+1],
    r=T[i*3+2];

    const ux=wx[q]-wx[p],
    uy=wy[q]-wy[p],
    uz=wz[q]-wz[p],
    vx=wx[r]-wx[p],
    vy=wy[r]-wy[p],
    vz=wz[r]-wz[p];

    let nx=uy*vz-uz*vy,
    ny=uz*vx-ux*vz,
    nz=ux*vy-uy*vx;
    const l=Math.hypot(nx,ny,nz);
    if(l<1e-9)continue;
    nx/=l;
    ny/=l;
    nz/=l;

    if(ny*sp+nz*cp<=0)continue;

    sh[i]=.5+.5*Math.max(0,-.35*nx+.75*ny+.55*nz);
    dep[i]=dp[p]+dp[q]+dp[r];
    if(!M.kk)M.kk=new Float64Array(nt);
    M.kk[n++]=Math.round((dep[i]+2000)*32)*4096+i
  }
  const o=M.kk?M.kk.subarray(0,n).sort():[];

  ctx.lineWidth=.6;

  /* mesma ordem de pintura de antes, mas triângulos vizinhos de mesma cor (sombra em 24 níveis) viram um único fill+stroke */
  let cur='',
  open=false;

  for(let k=0;k<n;k++){
    const i=o[k]%4096,
    p=T[i*3],
    q=T[i*3+1],
    r=T[i*3+2],
    col=triCol(C,i,sh[i]);

    if(col!==cur){
      if(open){
        ctx.fill();
        ctx.stroke()
      }
      cur=col;
      ctx.fillStyle=col;
      ctx.strokeStyle=col;
      ctx.beginPath();
      open=true
    }
    ctx.moveTo(sx[p],sy[p]);
    ctx.lineTo(sx[q],sy[q]);
    ctx.lineTo(sx[r],sy[r]);
    ctx.closePath()
  }
  if(open){
    ctx.fill();
    ctx.stroke()
  }
}
const SHQ=24,COLS=new Map();
function triCol(C,i,f){
  const lv=Math.min(SHQ,(f*SHQ)|0),
  key=((C[i*3]<<16)|(C[i*3+1]<<8)|C[i*3+2])*(SHQ+1)+lv;
  let c=COLS.get(key);

  if(c===undefined){
    const m=Math.min(1,(lv+.5)/SHQ);
    c=`rgb(${C[i*3]*m|0},${C[i*3+1]*m|0},${C[i*3+2]*m|0})`;
    COLS.set(key,c)
  }
  return c
}
/* esquilo: braços fechados junto ao corpo + ciclo de caminhada (pernas, braços, cauda, tronco) */
function poseSq(ph,a,item,tt){

  const V=SQ.V,
  P=SQ.P,
  s1=Math.sin(ph),
  c1=Math.cos(ph),
  idle=1-a;

  P.set(V);

  const armT=[];
  for(const side of[1,-1]){

    const sw=(side===1?s1:-s1)*.30*a;

    const R=mm(RX(-.245+sw*.9-.4*item),RZ(-side*1.396)),
    pv=[side*2.15,6.1,2.8];

    armT.push({
      R,pv,off:side*.7
    })
  }
  const legs=[[Math.max(0,c1)*a,s1*1.5*a],[Math.max(0,-c1)*a,-s1*1.5*a]];

  const tay=Math.sin(ph-.9)*.5*a+Math.sin(tt*1.8)*.22*idle,
  tR=RY(tay),
  tyb=Math.sin(2*ph-.5)*.35*a+Math.sin(tt*2.6)*.12*idle;

  for(let p=0;p<5;p++){
    const L=SQW[p];
    for(let k=0;k<L.length;k+=2){
      const i=L[k],
      w=L[k+1],
      i3=i*3,
      x=V[i3],
      y=V[i3+1],
      z=V[i3+2];

      let nx,
      ny,
      nz;

      if(p<2){
        const q=armT[p],
        R=q.R,
        dx=x-q.pv[0],
        dy=y-q.pv[1],
        dz=z-q.pv[2];

        nx=R[0]*dx+R[1]*dy+R[2]*dz+q.pv[0]+q.off;
        ny=R[3]*dx+R[4]*dy+R[5]*dz+q.pv[1];
        nz=R[6]*dx+R[7]*dy+R[8]*dz+q.pv[2]
      }
      else if(p<4){
        const g=legs[p-2];
        nx=x;
        ny=y+g[0];
        nz=z+g[1]
      }
      else{
        const dx=x,
        dy=y-4.1,
        dz=z+2.4;
        nx=tR[0]*dx+tR[1]*dy+tR[2]*dz;
        ny=dy+4.1+tyb;
        nz=tR[6]*dx+tR[7]*dy+tR[8]*dz-2.4
      }
      P[i3]+=w*(nx-x);
      P[i3+1]+=w*(ny-y);
      P[i3+2]+=w*(nz-z)
    }
  }
  const bob=Math.abs(s1)*.35*a,
  R=mm(mm(RZ(s1*.052*a),RY(s1*.087*a)),RX(.07*a)),
  br=1+.016*Math.sin(tt*3)*idle;

  for(let i=0;i<SQ.nv;i++){
    const dx=P[i*3],
    dy=P[i*3+1]*br,
    dz=P[i*3+2]-2.8;

    P[i*3]=R[0]*dx+R[1]*dy+R[2]*dz;
    P[i*3+1]=R[3]*dx+R[4]*dy+R[5]*dz+bob;
    P[i*3+2]=R[6]*dx+R[7]*dy+R[8]*dz+2.8
  }
  return bob
}
function carried(){
  return viewStack().filter(x=>IT[x])
}
/* pilha nas costas: itens "de frente para a câmera" (billboard), empilhados na vertical e sempre por cima do esquilo para ficarem visíveis */
const BILL=Math.PI/2-PH,ITKB={
  key:.78,
  ticket:.7,
  coin:.66,
  pizza:.78,
  burger:.66,
  icecream:.8,
  donut:.7
};
/* camadas em cache: os itens nas costas e o personagem da entrega só precisam ser recalculados ~30x/s;
   nos outros quadros viram um único drawImage (antes eram 1–3 malhas 3D redesenhadas em todo quadro) */
const LW=200,LH=170,LAX=100,LAY=125,LAYER_DT=1/30;
function mkLayer(){
  const c=document.createElement('canvas');
  c.width=LW;
  c.height=LH;
  return{
    c,
    g:c.getContext('2d'),
    t:-9,
    sig:''
  }
}
function layer(L,sig,x,y,paint){

  if(L.sig!==sig||NOW-L.t>=LAYER_DT||NOW<L.t){
    const real=ctx;
    ctx=L.g;
    L.g.clearRect(0,0,LW,LH);
    try{
      paint(LAX,LAY)
    }
    finally{
      ctx=real
    }
    L.t=NOW;
    L.sig=sig
  }
  ctx.drawImage(L.c,Math.round(x)-LAX,Math.round(y)-LAY)
}
const ITEMS_L=mkLayer();
function drawItems(x,y,s,cs,sn,bob,tt){

  const all=carried(),
  vis=all.slice(-3);
  if(!vis.length)return;

  const sp=Math.sin(PH),
  cp=Math.cos(PH),
  lz=-3.0,
  X=lz*sn,
  Z=lz*cs;
  let yy=4.6+bob;

  vis.forEach((c,i)=>{
    const nm=IT[c],M=MESH[nm],k=ITKB[nm];
    const A=mm(RX(BILL),mm(RY(Math.sin(tt*1.6+i*1.7)*.16),sc3(I3,k)));
    drawMesh(M,M.V,A,X,yy+Math.sin(tt*3+i)*.12,Z,x,y,s,1,0);yy+=10*k*.9/cp
  });

  if(all.length>3){
    const bx=x+X*s+17,
    by=y-(4.6*cp-Z*sp)*s;

    const t='×'+all.length;
    ctx.font='bold 11px sans-serif';
    const w=ctx.measureText(t).width+8;
    ctx.fillStyle='rgba(0,0,0,.7)';

    ctx.beginPath();
    ctx.roundRect?ctx.roundRect(bx-w/2,by-8,w,15,7):ctx.rect(bx-w/2,by-8,w,15);
    ctx.fill();
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(t,bx,by)
  }
}
function drawSquirrel(x,y){

  const s=CH/12.87,
  cs=Math.cos(face),
  sn=Math.sin(face);

  ctx.fillStyle='rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(x,y+1,CH*.3,CH*.11,0,0,7);
  ctx.fill();

  const bob=poseSq(ph,amp,0,NOW);

  drawMesh(SQ,SQ.P,I3,0,0,0,x,y,s,cs,sn);

  const all=carried();
  if(all.length)layer(ITEMS_L,all.join(''),x,y,(ax,ay)=>drawItems(ax,ay,s,cs,sn,bob,NOW))
}
/* painel da pilha no canto da tela (topo no alto), com os itens 3D agrupados */
const hudCv=document.createElement('canvas');
hudCv.width=260;
hudCv.height=H;
let hudSig='';
function drawHUD(){
  const sig=viewStack().join('');

  if(sig!==hudSig){
    hudSig=sig;
    const real=ctx,
    hc=hudCv.getContext('2d');
    hc.clearRect(0,0,260,H);
    hc.save();
    hc.translate(-(W-260),0);
    ctx=hc;
    try{
      drawHUDInner()
    }
    finally{
      ctx=real;
      hc.restore()
    }
  }
  ctx.drawImage(hudCv,W-260,0)
}
function drawHUDInner(){

  const rows=[],
  vs=viewStack();
  for(let i=vs.length-1;i>=0;i--){
    const c=vs[i],
    r=rows[rows.length-1];
    if(r&&r.c===c)r.n++;
    else rows.push({
      c,n:1
    })
  }
  const RH=40,
  PW=158,
  show=rows.slice(0,8),
  PHh=30+show.length*RH+(rows.length>8?16:0),
  px=W-PW-12,
  py=12;

  ctx.save();
  ctx.translate(W,0);
  ctx.scale(1.35,1.35);
  ctx.translate(-W,0);
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(24,18,12,.8)';
  ctx.strokeStyle='rgba(255,255,255,.35)';
  ctx.lineWidth=2;

  ctx.beginPath();
  ctx.roundRect?ctx.roundRect(px,py,PW,PHh,12):ctx.rect(px,py,PW,PHh);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle='#ffd8a8';
  ctx.font='bold 12px sans-serif';
  ctx.textAlign='left';
  ctx.textBaseline='middle';
  ctx.fillText('PILHA · topo ↓',px+12,py+15);

  show.forEach((r,i)=>{
    const y0=py+28+i*RH,cy=y0+RH/2;
    ctx.fillStyle=i===0?'rgba(255,146,43,.25)':'rgba(255,255,255,.07)';ctx.beginPath();ctx.roundRect?ctx.roundRect(px+6,y0+2,PW-12,RH-4,8):ctx.rect(px+6,y0+2,PW-12,RH-4);ctx.fill();
    const nm=IT[r.c];
    if(nm){
      const M=MESH[nm];drawMesh(M,M.V,mm(RX(BILL),sc3(I3,.42)),0,0,0,px+30,cy+4,3.2,1,0)
    }
    else{
      ctx.fillStyle=r.c==='Z'?'#9a8a78':'VWU'.includes(r.c[0])?'#74c0fc':'#8ce99a';ctx.font='bold '+(r.c==='VW'?15:18)+'px sans-serif';ctx.textAlign='center';ctx.fillText(r.c==='VW'?'V W':r.c,px+30,cy)
    }
    ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
    const lab=(SN[r.c]||r.c).split(' · ')[1]||r.c;ctx.fillText(r.c==='VW'?'ordem livre':r.c+' · '+lab,px+54,cy-(r.n>1?6:0));
    if(r.n>1){
      ctx.fillStyle='#ffd43b';ctx.font='bold 12px sans-serif';ctx.fillText('×'+r.n,px+54,cy+9)
    }
  });

  if(rows.length>8){
    ctx.fillStyle='#ccc';
    ctx.font='11px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('… +'+(rows.length-8)+' grupos',px+PW/2,py+PHh-10)
  }
  ctx.restore()
}
function spawnChar(t){

  let k;
  do{
    k=CHARS[Math.random()*CHARS.length|0]
  }
  while(k===lastChar);
  lastChar=k;

  let d=Math.random()<.5?-1:1,
  px=t.x+d*44;
  if(px<34||px>W-34){
    d=-d;
    px=t.x+d*44
  }
  popups.push({
    k,x:px,y:t.y+10,t0:NOW,life:1.6,face:-d*.5,seed:Math.random()*6
  });
  if(popups.length>1)popups.shift()
}
function drawPop(p){

  const a=NOW-p.t0,
  M=MESH[p.k],
  life=p.life;
  let k;

  if(a<.38){
    const u=a/.38,
    c=1.70158;
    k=1+(c+1)*Math.pow(u-1,3)+c*Math.pow(u-1,2)
  }else if(a>life-.3)k=Math.max(0,(life-a)/.3);
  else k=1;

  const hop=Math.abs(Math.sin(a*5.5+p.seed))*.9*k,
  st=.05*Math.sin(a*11+p.seed),
  sw=Math.sin(a*5.5+p.seed)*.07;

  const s=3.9,
  A=mm(RZ(sw),[k*(1-st),0,0,0,k*(1+st),0,0,0,k*(1-st)]),
  f=p.face+.2*Math.sin(a*3+p.seed);

  ctx.fillStyle='rgba(0,0,0,.28)';
  ctx.beginPath();
  ctx.ellipse(p.x,p.y+1,CH*.3*k*(1-hop*.08),CH*.11*k,0,0,7);
  ctx.fill();

  layer(p.L||(p.L=mkLayer()),p.k,p.x,p.y,(ax,ay)=>drawMesh(M,M.V,A,0,hop,0,ax,ay,s,Math.cos(f),Math.sin(f)))
}
const rr=(x,y,w,h,r)=>{
  ctx.beginPath();
  ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)
};
function wrapTxt(t,w){
  const out=[];
  let l='';
  for(const p of t.split(' ')){
    const u=l?l+' '+p:p;
    if(ctx.measureText(u).width>w&&l){
      out.push(l);
      l=p
    }else l=u
  }
  if(l)out.push(l);
  return out
}
function drawOverlay(){

  const c=cur();
  ctx.save();
  ctx.textAlign='left';
  ctx.textBaseline='middle';
  ctx.font='bold 20px sans-serif';

  const t1=`${c.st} · ${NM[c.st]}`+(sym!=='—'?'   leu: '+sym:'')+(soft?'   · soft':''),
  w1=ctx.measureText(t1).width+24;

  ctx.fillStyle='rgba(24,18,12,.8)';
  rr(12,12,w1,34,10);
  ctx.fill();
  ctx.fillStyle='#ffd8a8';
  ctx.fillText(t1,24,30);

  if(flash&&!dead&&!done){
    ctx.font='bold 18px sans-serif';
    const w2=ctx.measureText(flash).width+24;
    ctx.fillStyle='rgba(24,18,12,.85)';
    rr(12,54,w2,32,10);
    ctx.fill();
    ctx.fillStyle='#ffe066';
    ctx.fillText(flash,24,71)
  }
  if(dead||done){

    const msg=dead?'REJEITADA — '+reason:'ACEITA — chegou ao estado final q6 (poupança), pilha só com Z.',
    col=dead?'#ff8787':'#69db7c',
    bw=960;

    ctx.font='bold 22px sans-serif';
    const L=wrapTxt((dead?'❌ ':'✅ ')+msg,bw-32),
    bh=L.length*30+16,
    bx=(W-bw)/2-10;

    ctx.fillStyle='rgba(24,18,12,.9)';
    rr(bx,12,bw,bh,12);
    ctx.fill();
    ctx.strokeStyle=col;
    ctx.lineWidth=3;
    ctx.stroke();

    ctx.fillStyle=col;
    L.forEach((l,i)=>ctx.fillText(l,bx+16,12+8+15+i*30))
  }
  ctx.restore()
}
function drawActors(){

  const L=[{
    y:pos.y,f:()=>drawSquirrel(pos.x,pos.y)
  }];
  for(const p of popups)L.push({
    y:p.y,f:()=>drawPop(p)
  });

  L.sort((a,b)=>a.y-b.y);
  for(const o of L)o.f();
  drawHUD();
  drawOverlay()
}
const inside=(t,x,y)=>t.g?x>=t.g[0]&&x<=t.g[2]&&y>=t.g[1]&&y<=t.g[3]:Math.hypot(x-t.x,y-t.y)<t.r;
/* movimento "colado na pista": se a direção pedida bate, escolhe o desvio (até ~80°) com mais caminho livre à frente, em 2 micro-passos */
const FAN=[0,.3,-.3,.6,-.6,.9,-.9,1.2,-1.2,1.45,-1.45];
function slide(dx,dy,k){
  const a0=Math.atan2(dy,dx),
  n=Math.max(2,Math.ceil(2*k)),
  L=Math.hypot(dx,dy)*SP*k/n;

  for(let sub=0;sub<n;sub++){
    let best=null,
    bs=-1e9;

    for(const o of FAN){
      const a=a0+o,
      c=Math.cos(a),
      s=Math.sin(a),
      nx=pos.x+c*L,
      ny=pos.y+s*L;

      if(!walk(nx,ny)||!walk((pos.x+nx)/2,(pos.y+ny)/2))continue;

      let free=0;
      for(let d=6;d<=30;d+=6)if(walk(pos.x+c*d,pos.y+s*d))free++;
      else break;

      const sc=free*2-Math.abs(o)*1.5+(o===0?1.5:0);
      if(sc>bs){
        bs=sc;
        best=[nx,ny]
      }
    }
    if(best){
      pos.x=best[0];
      pos.y=best[1]
    }
    else{
      if(!walk(pos.x,pos.y)){
        for(let r=2;r<=24;r+=2){
          let f=false;
          for(let k=0;k<16;k++){
            const q=k*Math.PI/8,
            nx=pos.x+Math.cos(q)*r,
            ny=pos.y+Math.sin(q)*r;
            if(walk(nx,ny)){
              pos.x=nx;
              pos.y=ny;
              f=true;
              break
            }
          }
          if(f)break
        }
      }
      break
    }
  }
}
let lastT=0;
function loop(){

  NOW=performance.now()/1000;
  let moving=false,
  dist=0;

  /* k = quantos "quadros de 60 fps" se passaram: a velocidade fica igual mesmo se o FPS cair (teto 4 evita saltos após travadas) */
  const k=lastT?Math.min(4,Math.max(.25,(NOW-lastT)*60)):1;
  lastT=NOW;

  if(!dead&&!done&&!tm){

    const dx=(keys.d?1:0)-(keys.a?1:0),
    dy=(keys.s?1:0)-(keys.w?1:0);

    if(dx||dy){
      moving=true;
      dist=Math.hypot(dx,dy);
      tface=Math.atan2(dx,dy);
      const nx=pos.x+dx*SP,
      ny=pos.y+dy*SP;

      slide(dx,dy,k);

      for(const t of TR){
        const i=inside(t,pos.x,pos.y);
        if(i&&!t.in&&!(t.o&&opened[t.o]))fire(t);
        t.in=i;
        if(dead||done)break
      }
    }
  }
  amp+=((moving?1:0)-amp)*(1-Math.pow(.84,k));
  if(moving)ph+=.095*SP*dist*k;

  let df=tface-face;
  df=Math.atan2(Math.sin(df),Math.cos(df));
  face+=df*(1-Math.pow(.74,k));

  popups=popups.filter(p=>NOW-p.t0<p.life);

  draw();
  requestAnimationFrame(loop)
}
function parse(txt){
  const out=[];
  let s=txt.replace(/[\s,;]+/g,'');
  while(s.length){
    const k=TOK.find(t=>s.startsWith(t));
    if(!k)return null;
    out.push(k);
    s=s.slice(k.length)
  }
  return out
}
function run(txt){

  reset();
  const a=parse(txt);
  if(!a||!a.length){
    dead=true;
    reason='roteiro vazio ou com símbolo desconhecido.';
    render();
    return
  }
  let i=0;
  tm=setInterval(()=>{

    if(i>=a.length){
      clearInterval(tm);tm=0;if(!done&&!dead){
        dead=true;reason=`a entrada acabou no estado ${cur().st} (${NM[cur().st]}), que não é final.`;render()
      }
      return
    }
    const s=a[i++],t=TR.find(q=>q.s===s);if(t)pos=t.g?{
      x:(t.g[0]+t.g[2])/2,y:(t.g[1]+t.g[3])/2
    }
    :{
      x:t.x,y:t.y
    };
    const ok=step(s);if(ok&&t&&t.o)opened[t.o]=1;if(ok&&t&&/^[a-d]1?$/.test(s))spawnChar(t);if(!ok||done){
      clearInterval(tm);tm=0
    }
  },700)
}
const MAP={
  w:'w',
  arrowup:'w',
  s:'s',
  arrowdown:'s',
  a:'a',
  arrowleft:'a',
  d:'d',
  arrowright:'d'
};
document.addEventListener('keydown',e=>{
  if(document.activeElement===$('inp'))return;const k=e.key.toLowerCase();if(MAP[k]){
    e.preventDefault();keys[MAP[k]]=1
  }
});
document.addEventListener('keyup',e=>{
  const k=MAP[e.key.toLowerCase()];if(k)keys[k]=0
});
$('mR').onclick=()=>{
  soft=false;
  $('mR').className='on';
  $('mS').className='';
  reset();
  $('mR').blur()
};
$('mS').onclick=()=>{
  soft=true;
  $('mS').className='on';
  $('mR').className='';
  reset();
  $('mS').blur()
};
$('rst').onclick=()=>{
  reset();
  $('rst').blur()
};
$('run').onclick=()=>{
  run($('inp').value);
  $('run').blur()
};
$('inp').addEventListener('keydown',e=>{
  if(e.key==='Enter')run($('inp').value)
});
let assetsReady=false,imageReady=false;
function startWhenReady(){
  if(assetsReady&&imageReady){
    reset();
    loop()
  }
}
img.onload=()=>{
  imageReady=true;
  startWhenReady()
};
img.onerror=()=>say('Não foi possível carregar assets/images/background.jpg');
img.src='./assets/images/background.jpg';
loadAssets().then(()=>{
  assetsReady=true;startWhenReady()
}).catch(err=>{
  console.error(err);say('Erro ao carregar recursos. Verifique a pasta assets e execute por um servidor local.');
});
/* imagem carregada por arquivo externo */
