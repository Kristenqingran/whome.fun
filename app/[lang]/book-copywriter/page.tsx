'use client';
import { useState } from 'react';
type Draft = { title: string; script: string };
type Result = { drafts: { zh: Draft; en: Draft } };
const fields = [['title','书名'],['author','作者（可留空）'],['audience','目标受众'],['duration','时长/字数'],['tone','语气']] as const;
const materials = [['personal_view','我的观点或经历'],['introduction','简介'],['table_of_contents','目录'],['notes','笔记'],['reader_reviews','读者评论（仅作为观点来源）']] as const;
export default function Workbench() {
  const [form,setForm]=useState({title:'',author:'',audience:'普通读者',duration:'60秒，约250字',tone:'真诚、简洁、有启发性',personal_view:'',introduction:'',table_of_contents:'',notes:'',reader_reviews:''});
  const [message,setMessage]=useState(''); const [result,setResult]=useState<Result|null>(null);
  const update=(key:string,value:string)=>setForm(v=>({...v,[key]:value}));
  async function call(path:string, language?:'zh'|'en') { setMessage('生成中…'); const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,language,request_id:crypto.randomUUID()})}); const body=await response.json(); if(!response.ok){setMessage(body.error||'生成失败');return;} if(!result||!language)setResult(body.result);else setResult(v=>v?({...v,drafts:{...v.drafts,[language]:body.result.drafts[language]}}):body.result); setMessage(''); }
  return <div className="shell"><section className="card"><h1>图书口播文案工作台</h1><p className="muted">仅限邮箱已验证且管理员批准的用户使用。每个批准周期有效 30 天，平台承担最多 600 分模型调用成本。</p><form onSubmit={e=>{e.preventDefault();void call('/api/book-copywriter/generate')}}><div className="grid">{fields.map(([key,label])=><label className="field" key={key}>{label}<input required={key==='title'} value={form[key]} onChange={e=>update(key,e.target.value)}/></label>)}</div>{materials.map(([key,label])=><label className="field" key={key}>{label}<textarea value={form[key]} onChange={e=>update(key,e.target.value)}/></label>)}<button className="button">生成中文和英文文案</button><p>{message}</p></form></section>{result&&<section className="card"><h2>中文稿</h2><h3>{result.drafts.zh.title}</h3><textarea value={result.drafts.zh.script} readOnly/><button className="button" onClick={()=>void call('/api/book-copywriter/regenerate','zh')}>只重新生成中文</button><h2>English draft</h2><h3>{result.drafts.en.title}</h3><textarea value={result.drafts.en.script} readOnly/><button className="button" onClick={()=>void call('/api/book-copywriter/regenerate','en')}>Regenerate English</button></section>}</div>;
}
