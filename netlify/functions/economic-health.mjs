const SERIES = [
["Real GDP growth","A191RL1Q225SBEA","%","Growth"],["Unemployment","UNRATE","%","Jobs"],["CPI inflation","CPIAUCSL","index","Prices"],["Real hourly earnings","CES0500000032","USD","Households"],["Consumer spending","PCEC96","billions","Households"],["Consumer sentiment","UMCSENT","index","Households"],["Labor participation","CIVPART","%","Jobs"],["Nonfarm payrolls","PAYEMS","thousands","Jobs"],["Housing affordability proxy (mortgage rate)","MORTGAGE30US","%","Housing"],["Household debt-service ratio","TDSP","%","Households"],["Business investment","PNFI","billions","Growth"],["Labor productivity","OPHNFB","index","Growth"],["Federal funds rate","FEDFUNDS","%","Prices"],["Federal deficit / GDP","FYFSGDA188S","%","Fiscal"],["Poverty rate","PPAAUS00000A156NCEN","%","Households"]
];
const cacheHeaders={"Cache-Control":"public, max-age=3600, s-maxage=21600"};
async function load([name,id,unit,group]){
 const url="https://fred.stlouisfed.org/graph/fredgraph.csv?id="+encodeURIComponent(id);
 try {const r=await fetch(url,{signal:AbortSignal.timeout(8500)});if(!r.ok)throw Error("upstream "+r.status);
 const rows=(await r.text()).trim().split(/\r?\n/).slice(1).map(s=>s.split(",")).filter(a=>a.length>=2&&Number.isFinite(Number(a[1]))&&a[1]!==".");
 const recent=rows.slice(-160).map(([date,value])=>({date,value:Number(value)}));
 return {name,id,unit,group,latest:recent.at(-1)||null,history:recent,status:recent.length?"ok":"unavailable",source:url};
 }catch(e){return {name,id,unit,group,status:"unavailable",history:[],source:url};}
}
export default async (request)=>{
 if(request.method!=="GET")return new Response("Method not allowed",{status:405});
 const data=await Promise.all(SERIES.map(load));
 return new Response(JSON.stringify({asOf:new Date().toISOString(),data,notes:"Latest available observations; different series have different reporting lags. Values are not normalized to a composite score."}),{headers:{"Content-Type":"application/json",...cacheHeaders}});
};
