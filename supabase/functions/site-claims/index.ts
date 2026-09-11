import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method==="GET"){
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const{data,error}=await db.from("sites").select("sitekey").not("userid","is",null).not("sitekey","is",null);
  if(error)return json({message:"Claim registry unavailable."},500);
  return json(data||[]);
 }
 if(req.method!=="POST")return json({message:"Method not allowed."},405);
 try{
  const authorization=req.headers.get("Authorization")||"";
  const authClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:authorization}}});
  const{data:auth,error:authError}=await authClient.auth.getUser();
  if(authError||!auth.user)return json({message:"Please log in again."},401);
  const body=await req.json();
  const cleanSites=Array.isArray(body.sites)?body.sites.map((x:any)=>({path:String(x?.path||"").trim(),name:String(x?.name||"").trim(),hostingType:String(x?.hostingType||"standard").trim()})):[];
  if(!cleanSites.length||cleanSites.some((x:any)=>!x.path||!x.name||!/^[A-Za-z0-9_-]+$/.test(x.path)))return json({message:"One or more selected sites are invalid."},400);
  if(new Set(cleanSites.map((x:any)=>x.path)).size!==cleanSites.length)return json({message:"The same site cannot be claimed twice."},400);

  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const agreementIds=Object.values(body.agreementIds||{}).filter((id:any)=>typeof id==="string"&&id);
  if(!agreementIds.length)return json({message:"A signed agreement is required."},400);
  const{data:agreements,error:agreementError}=await db.from("agreements").select("id").eq("userid",auth.user.id).eq("accepted",true).in("id",agreementIds);
  if(agreementError)throw agreementError;
  if(!agreements?.length)return json({message:"A valid signed agreement was not found."},403);

  const{data:development,error:developmentError}=await db.from("square").select("id").eq("userid",auth.user.id).eq("cadence","ONE_TIME").in("status",["COMPLETED","ACTIVE"]).limit(1).maybeSingle();
  if(developmentError)throw developmentError;
  if(!development)return json({message:"A completed website-development payment is required."},402);

  const needsHosting=cleanSites.some((x:any)=>x.hostingType!=="none");
  if(needsHosting){
   const{data:hosting,error:hostingError}=await db.from("square").select("id").eq("userid",auth.user.id).eq("cadence","MONTHLY").eq("status","ACTIVE").limit(1).maybeSingle();
   if(hostingError)throw hostingError;
   if(!hosting)return json({message:"An active hosting subscription is required."},402);
  }

  const claimId=crypto.randomUUID();
  const{data,error}=await db.rpc("claimsites",{p_user:auth.user.id,p_claim:claimId,p_sites:cleanSites});
  if(error?.code==="23505")return json({message:"One of these sites has already been claimed. Refresh and choose another site."},409);
  if(error)throw error;
  return json(data||{success:true,claimId,sites:cleanSites});
 }catch(error){console.error(error);return json({message:error instanceof Error?error.message:"Unexpected server error."},500)}
});
