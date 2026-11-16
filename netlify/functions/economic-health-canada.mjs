const INDICATORS=[
["Real GDP growth","NY.GDP.MKTP.KD.ZG","%","Growth"],["Unemployment","SL.UEM.TOTL.ZS","%","Jobs"],["Consumer price inflation","FP.CPI.TOTL.ZG","%","Prices"],["GDP per capita growth","NY.GDP.PCAP.KD.ZG","%","Households"],["Household consumption growth","NE.CON.PRVT.KD.ZG","%","Households"],["Consumer price index","FP.CPI.TOTL","index","Prices"],["Labor participation","SL.TLF.CACT.ZS","%","Jobs"],["Employment-to-population","SL.EMP.TOTL.SP.ZS","%","Jobs"],["Urban population growth","SP.URB.GROW","%","Housing"],["Household consumption (% GDP)","NE.CON.PRVT.ZS","%","Households"],["Gross capital formation (% GDP)","NE.GDI.TOTL.ZS","%","Growth"],["GDP per person (constant USD)","NY.GDP.PCAP.KD","USD","Growth"],["Real interest rate","FR.INR.RINR","%","Prices"],["Government expense (% GDP)","GC.XPN.TOTL.GD.ZS","%","Fiscal"],["Poverty at $3/day (2021 PPP)","SI.POV.DDAY","%","Households"]
];
async function load([name,id,unit,group]) {
 const source="https://data.worldbank.org/indicator/"+id+"?locations=CA";
 try{
 const r=await fetch("https://api.worldbank.org/v2/country/CAN/indicator/"+id+"?format=json&per_page=80",{signal:AbortSignal.timeout(9000)});
 if(!r.ok)throw Error("World Bank API "+r.status);
 const j=await r.json();const history=(Array.isArray(j[1])?j[1]:[]).filter(x=>x.value!==null&&Number.isFinite(Number(x.value))).map(x=>({date:String(x.date),value:Number(x.value)})).sort((a,b)=>a.date.localeCompare(b.date));
 return {name,id,unit,group,history,latest:history.at(-1)||null,status:history.length?"ok":"unavailable",source};
 }catch{return {name,id,unit,group,history:[],latest:null,status:"unavailable",source};}
}
export default async request=>{
 if(request.method!=="GET")return new Response("Method not allowed",{status:405});
 const data=await Promise.all(INDICATORS.map(load));
 return new Response(JSON.stringify({asOf:new Date().toISOString(),data,notes:"World Bank annual Canadian economic indicators. Latest published years vary; unavailable series are not estimated."}),{headers:{"Content-Type":"application/json","Cache-Control":"public,max-age=3600,s-maxage=21600"}});
};
