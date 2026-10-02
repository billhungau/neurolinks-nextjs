import { getClinicianSession } from "@/lib/clinical/auth";
import { buildQuestionnaireVerificationReport, type VerificationCode } from "@/lib/clinical/imports/verify-questionnaire";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const SUPPORTED=new Set<VerificationCode>(["bdii","bai","ybocs","pss"]);

export async function GET(request:Request){
 const clinician=await getClinicianSession();
 if(!clinician) return Response.json({ok:false,error:"Authentication required."},{status:401,headers:{"Cache-Control":"no-store, private"}});
 const {searchParams}=new URL(request.url);
 const code=String(searchParams.get("code")??"bdii").toLowerCase() as VerificationCode;
 const submissionId=String(searchParams.get("submissionId")??"").trim();
 if(!SUPPORTED.has(code)) return Response.json({ok:false,error:"Unsupported questionnaire."},{status:400});
 try{
   const report=await buildQuestionnaireVerificationReport(code);
   if(submissionId){
     const detail=report.detailsBySubmission.get(submissionId);
     if(!detail) return Response.json({ok:false,error:"Verification record not found."},{status:404,headers:{"Cache-Control":"no-store, private"}});
     return Response.json({ok:true,detail},{headers:{"Cache-Control":"no-store, private"}});
   }
   return Response.json({ok:true,generatedAt:report.generatedAt,summary:report.summary,rows:report.rows},{headers:{"Cache-Control":"no-store, private"}});
 }catch{
   return Response.json({ok:false,error:"Could not verify the historical questionnaire migration."},{status:500,headers:{"Cache-Control":"no-store, private"}});
 }
}