// Web Worker — MegaSena Analyzer

self.onmessage = e => {
  const { type } = e.data;
  if (type === 'analyze') analyze(e.data.draws);
  if (type === 'generate') generate(e.data.config);
};

let cachedStats = null;

function analyze(draws){
  const periods = [1,2,5,10];
  const result = periods.map(y => {
    const f = statsByYears(draws, y);
    const cls = classify(f);
    return {
      y,
      h: cls.quentes.slice(0,5).map(x=>x.n),
      m: cls.mornos.slice(0,5).map(x=>x.n),
      f: cls.frios.slice(0,5).map(x=>x.n)
    };
  });
  cachedStats = classify(statsByYears(draws,10));
  self.postMessage({ type:'stats', cls: result });
}

function statsByYears(draws, years){
  const limit = new Date(); limit.setFullYear(limit.getFullYear()-years);
  const f = Array(61).fill(0);
  draws.forEach(r => {
    if(r.d >= limit) r.n.forEach(n => f[n]++);
  });
  return f;
}

function classify(freq){
  const arr = [];
  for(let i=1;i<=60;i++) arr.push({n:i,c:freq[i]});
  arr.sort((a,b)=>b.c-a.c);
  const t = Math.floor(arr.length/3);
  return {
    quentes: arr.slice(0,t),
    mornos: arr.slice(t,2*t),
    frios: arr.slice(2*t)
  };
}
function generate(){
  if(!cachedStats) return;
  const game = [];
  game.push(...pick(cachedStats.quentes, 2));
  game.push(...pick(cachedStats.mornos, 2));
  game.push(...pick(cachedStats.frios, 2));
  self.postMessage({ type:'game', game: [...new Set(game)].sort((a,b)=>a-b) });
}

"""function generate(cfg){
  if(!cachedStats) return;
  const games = [];

  for(let g=0; g<cfg.qty; g++){
    let game = [];
    game.push(...pick(cachedStats.quentes, cfg.hot));
    game.push(...pick(cachedStats.mornos, cfg.warm));
    game.push(...pick(cachedStats.frios, cfg.cold));

    game = [...new Set(game)];
    while(game.length < 6) game.push(rand());

    game = balanceEvenOdd(game, cfg.even, cfg.odd);

    let sum = game.reduce((a,b)=>a+b,0);
    let guard = 0;
    while((sum < cfg.sumMin || sum > cfg.sumMax) && guard < 100){
      game[Math.floor(Math.random()*game.length)] = rand();
      game = [...new Set(game)];
      while(game.length < 6) game.push(rand());
      sum = game.reduce((a,b)=>a+b,0);
      guard++;
    }

    games.push(game.sort((a,b)=>a-b));
  }

  self.postMessage({ type:'games', games });
}"""

function pick(arr,n){
  return arr.sort(()=>0.5-Math.random()).slice(0,n).map(x=>x.n);
}

function rand(){ return Math.floor(Math.random()*60)+1; }

function balanceEvenOdd(game, even, odd){
  let ev = game.filter(n=>n%2===0).length;
  let od = game.length - ev;
  let g = [...game];

  let guard = 0;
  while((ev!==even || od!==odd) && guard<100){
    const i = Math.floor(Math.random()*g.length);
    g[i] = rand();
    ev = g.filter(n=>n%2===0).length;
    od = g.length - ev;
    guard++;
  }
  return [...new Set(g)].slice(0,6);
}

