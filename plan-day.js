/* Day planning helpers shared by the UI and regression checks. */
(function(root){
  const api={
    url(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}},
    normalize(p){p.itinerary=Array.isArray(p.itinerary)?p.itinerary.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.start==='string'):[];p.bookings=Array.isArray(p.bookings)?p.bookings.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string'):[];p.budget=Number.isSafeInteger(p.budget)&&p.budget>0?p.budget:0;p.notes=typeof p.notes==='string'?p.notes:'';return p;},
    day(items,date,field){return items.filter(x=>!date||String(x[field]||'').startsWith(date));},
    sorted(items){return [...items].sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'));},
    overlaps(items){const sorted=api.sorted(items),ids=new Set();for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){const a=sorted[i],b=sorted[j];if(a.start&&a.end&&b.start&&b.start<a.end&&b.start>=a.start){ids.add(a.id);ids.add(b.id);}}return ids;},
    bookingName(p,id){return p.bookings.find(b=>b.id===id)?.title||'';},
    removeBooking(p,id){p.bookings=p.bookings.filter(b=>b.id!==id);p.itinerary.forEach(x=>{if(x.bookingId===id)x.bookingId='';});p.expenses.forEach(x=>{if(x.bookingId===id)x.bookingId='';});}
  };
  if(typeof module!=='undefined')module.exports=api;else root.KeepsDay=api;
})(typeof window!=='undefined'?window:globalThis);
