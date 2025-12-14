self.onmessage=e=>{
 const {type,draws}=e.data;
 if(type==='analyze')analyze(draws);
 if(type==='generate')generate();
};

let cached=null;

function analyze(draws){
 const f=Array(61).fill(0);
 const limit=new Date();limit.setFullYear(limit.getFullYear()-10);
 draws.forEach(r=>{if(r.d>=limit)r.n.forEach(n=>f[n]++);});
 const arr=[...Array(60)].map((_,i)=>({n:i+1,c:f[i+1]})).sort((a,b)=>b.c-a.c);
 cached={q:arr.slice(0,20),m:arr.slice(20,40),f:arr.slice(40)};
 self.postMessage({type:'stats',cls:[{},{},{},{h:cached.q.slice(0,5).map(x=>x.n),m:cached.m.slice(0,5).map(x=>x.n),f:cached.f.slice(0,5).map(x=>x.n)}]});
}

function generate(){
 if(!cached)return;
 let g=[...pick(cached.q,2),...pick(cached.m,2),...pick(cached.f,2)];
 g=[...new Set(g)];
 while(g.length<6)g.push(rand());
 self.postMessage({type:'game',game:g.sort((a,b)=>a-b)});
}

function pick(a,n){return a.sort(()=>.5-Math.random()).slice(0,n).map(x=>x.n);}
function rand(){return Math.floor(Math.random()*60)+1;}
