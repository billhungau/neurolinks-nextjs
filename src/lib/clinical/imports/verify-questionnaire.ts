import { subjectKeyFromVcitaUuid } from "../pseudonym";
import { ensureImportedQuestionnaire, type ImportedQuestionnaireCode, type ImportedQuestionnaireSchema } from "../questionnaires/jotform-import";
import { clinicalSupabaseRequest } from "../supabase";
import { listAllVcitaClients, type VcitaClientSummary } from "../vcita";
import { buildBdiVerificationReport } from "./verify-bdii";
import {
  answerText,
  findAnswer,
} from "./historical-bdii";
import {
  fetchAllHistoricalQuestionnaireSubmissions,
  historicalQuestionnaireTokenHash,
  historicalQuestionnaireTotal,
  mapHistoricalSubmissionToSchema,
  type HistoricalImportedCode,
  type HistoricalSubmission,
} from "./historical-questionnaire";

type InvitationRow = { id:string; token_hash:string; subject_key:string };
type ResultRow = { id:string; invitation_id:string; submitted_at:string; total_score:number; answers:Record<string,unknown> };
type QuestionnaireRow = { metadata?: { schema?: ImportedQuestionnaireSchema } | null };

export type VerificationCode = "bdii" | ImportedQuestionnaireCode;

function isoSecond(value:string|null|undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime()/1000);
}
function norm(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value.map(String).sort());
  return String(value ?? "").normalize("NFKC").replace(/[\u200B-\u200D\u2060\uFEFF]/g,"").replace(/\s+/g," ").trim().toLocaleLowerCase();
}
async function subjectMap(clients:VcitaClientSummary[]) {
  return new Map(clients.map(c=>[subjectKeyFromVcitaUuid(c.id),c]));
}
async function schemaFor(code:HistoricalImportedCode) {
  await ensureImportedQuestionnaire(code);
  const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    `questionnaires?select=metadata&code=eq.${encodeURIComponent(code)}&order=version.desc&limit=1`,
    {method:"GET"},
  );
  const schema=rows[0]?.metadata?.schema;
  if (!schema) throw new Error("Questionnaire schema missing.");
  return schema;
}
function sourceName(submission:HistoricalSubmission) {
  return answerText(findAnswer(submission.answers ?? {}, ["Full Name","Name"]));
}
function flattenItems(schema:ImportedQuestionnaireSchema, source:Record<string,unknown>, imported:Record<string,unknown>) {
  const items:Array<{key:string;title:string;jotformText:string;jotformScore:number|null;supabaseText:string;supabaseScore:number|null;textMatch:boolean;scoreMatch:boolean;match:boolean}> = [];
  for (const field of schema.fields) {
    if (field.kind==="display") continue;
    if (field.kind==="matrix_radio") {
      field.rows.forEach((row,i)=>{
        const key=`${field.qid}:${i}`;
        const a=source[key], b=imported[key];
        const ai=field.columns.indexOf(String(a ?? ""));
        const bi=field.columns.indexOf(String(b ?? ""));
        items.push({key,title:row,jotformText:String(a??""),jotformScore:ai>=0?ai:null,supabaseText:String(b??""),supabaseScore:bi>=0?bi:null,textMatch:norm(a)===norm(b),scoreMatch:ai===bi && ai>=0,match:norm(a)===norm(b)});
      });
    } else {
      const a=source[field.qid], b=imported[field.qid];
      let ai:number|null=null, bi:number|null=null;
      if (field.kind==="radio") {
        ai=field.options.indexOf(String(a??"")); if (ai<0) ai=null;
        bi=field.options.indexOf(String(b??"")); if (bi<0) bi=null;
      }
      items.push({key:field.qid,title:field.text,jotformText:Array.isArray(a)?a.join(", "):String(a??""),jotformScore:ai,supabaseText:Array.isArray(b)?b.join(", "):String(b??""),supabaseScore:bi,textMatch:norm(a)===norm(b),scoreMatch:ai===null&&bi===null?true:ai===bi,match:norm(a)===norm(b)});
    }
  }
  return items;
}
export async function buildQuestionnaireVerificationReport(code:VerificationCode) {
  if (code==="bdii") return buildBdiVerificationReport();

  const [submissions,clients,schema]=await Promise.all([
    fetchAllHistoricalQuestionnaireSubmissions(code),
    listAllVcitaClients({maxPages:50}),
    schemaFor(code),
  ]);
  const ids=submissions.map(s=>String(s.id??"")).filter(Boolean);
  const invites:InvitationRow[]=[];
  for(let i=0;i<ids.length;i+=40){
    const chunk=ids.slice(i,i+40);
    const hashes=chunk.map(id=>historicalQuestionnaireTokenHash(code,id));
    const quoted=hashes.map(h=>`"${h}"`).join(",");
    invites.push(...await clinicalSupabaseRequest<InvitationRow[]>(
      `questionnaire_invitations?select=id,token_hash,subject_key&token_hash=in.(${encodeURIComponent(quoted)})`,{method:"GET"}
    ));
  }
  const results:ResultRow[]=[];
  const inviteIds=invites.map(i=>i.id);
  for(let i=0;i<inviteIds.length;i+=40){
    const chunk=inviteIds.slice(i,i+40);
    const quoted=chunk.map(id=>`"${id}"`).join(",");
    results.push(...await clinicalSupabaseRequest<ResultRow[]>(
      `assessment_results?select=id,invitation_id,submitted_at,total_score,answers&invitation_id=in.(${encodeURIComponent(quoted)})`,{method:"GET"}
    ));
  }
  const byHash=new Map(invites.map(i=>[i.token_hash,i]));
  const byInvite=new Map(results.map(r=>[r.invitation_id,r]));
  const clientsBySubject=await subjectMap(clients);

  const details=submissions.map(submission=>{
    const submissionId=String(submission.id??"");
    const invitation=byHash.get(historicalQuestionnaireTokenHash(code,submissionId));
    const result=invitation?byInvite.get(invitation.id):undefined;
    const mapped=mapHistoricalSubmissionToSchema(submission,schema);
    const items=flattenItems(schema,mapped,result?.answers??{});
    const jotformTotal=historicalQuestionnaireTotal(code,submission);
    const supabaseTotal=typeof result?.total_score==="number"?result.total_score:null;
    const jotformDate=submission.created_at?String(submission.created_at):null;
    const supabaseDate=result?.submitted_at??null;
    const dateMatch=isoSecond(jotformDate)!==null && isoSecond(jotformDate)===isoSecond(supabaseDate);
    const totalMatch=jotformTotal!==null && supabaseTotal!==null && jotformTotal===supabaseTotal;
    const itemMismatchCount=items.filter(i=>!i.match).length;
    const client=invitation?clientsBySubject.get(invitation.subject_key)??null:null;
    const status=(!invitation||!result)?"not_imported":(dateMatch&&totalMatch&&itemMismatchCount===0&&client)?"match":"mismatch";
    return {
      submissionId,jotformName:sourceName(submission),
      vcitaPatient:client?{id:client.id,firstName:client.firstName,lastName:client.lastName,email:client.email,phone:client.phone}:null,
      jotformDate,supabaseDate,jotformTotal,supabaseTotal,dateMatch,totalMatch,
      itemMismatchCount,itemMatchCount:items.length-itemMismatchCount,status,items
    };
  });
  const imported=details.filter(r=>r.status!=="not_imported");
  return {
    generatedAt:new Date().toISOString(),
    summary:{totalJotform:details.length,imported:imported.length,fullMatches:imported.filter(r=>r.status==="match").length,mismatches:imported.filter(r=>r.status==="mismatch").length,notImported:details.filter(r=>r.status==="not_imported").length},
    rows:details.map(({items:_items,...r})=>r),
    detailsBySubmission:new Map(details.map(r=>[r.submissionId,r])),
  };
}
