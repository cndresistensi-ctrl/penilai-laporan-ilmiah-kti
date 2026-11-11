'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

type Aspect = { name: string; weight: number; score: number; note: string; weighted: number };
type Assessment = {
  id: string; user_id?: string; work_type: string; title: string; author: string;
  reviewer: string; institution: string; assessment_date: string; overall_note: string;
  aspects: Aspect[]; score: number; grade: string; created_at: string;
};
const criteria = [
  { name: 'Orisinalitas dan relevansi', weight: 20, desc: 'Keaslian gagasan dan kesesuaian topik dengan tujuan karya.' },
  { name: 'Sistematika dan struktur', weight: 20, desc: 'Kelengkapan bagian, keteraturan susunan, dan alur penyajian.' },
  { name: 'Metode dan ketepatan ilmiah', weight: 25, desc: 'Kesesuaian metode, kejelasan prosedur, dan penggunaan konsep.' },
  { name: 'Data, analisis, dan pembahasan', weight: 20, desc: 'Kualitas data, kecermatan analisis, dan keterkaitan dengan tujuan.' },
  { name: 'Bahasa dan referensi', weight: 15, desc: 'Kejelasan bahasa, sitasi, serta mutu dan relevansi referensi.' },
];
const today = () => new Date().toISOString().slice(0, 10);
function gradeFor(score: number) { return score >= 86 ? 'A — Sangat baik' : score >= 76 ? 'B — Baik' : score >= 66 ? 'C — Cukup' : 'D — Perlu perbaikan'; }
function recommendation(score: number) { return score >= 86 ? 'Layak diterima atau dipresentasikan; lakukan penyempurnaan kecil bila diperlukan.' : score >= 76 ? 'Layak dengan revisi minor.' : score >= 66 ? 'Revisi mayor dan peninjauan ulang disarankan.' : 'Belum layak; perlu revisi menyeluruh sebelum diajukan kembali.'; }
function csvCell(value: unknown) { let text = String(value ?? ''); if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`; return `"${text.replace(/"/g, '""')}"`; }
function downloadCsv(filename: string, rows: unknown[][]) { const blob = new Blob(['\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Assessment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [workType, setWorkType] = useState('Laporan Ilmiah');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [institution, setInstitution] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(today());
  const [overallNote, setOverallNote] = useState('');
  const [scores, setScores] = useState<string[]>(criteria.map(() => ''));
  const [notes, setNotes] = useState<string[]>(criteria.map(() => ''));
  const [result, setResult] = useState<Assessment | null>(null);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); setItems([]); setResult(null); });
    return () => subscription.unsubscribe();
  }, []);

  const loadItems = useCallback(async () => {
    if (!supabase || !session) return;
    const { data, error } = await supabase.from('assessments').select('*').order('created_at', { ascending: false });
    if (error) setMessage(`Gagal memuat data: ${error.message}`);
    else setItems((data ?? []) as Assessment[]);
  }, [session]);
  useEffect(() => { if (session) void loadItems(); }, [session, loadItems]);

  const average = useMemo(() => items.length ? (items.reduce((sum, item) => sum + Number(item.score), 0) / items.length).toFixed(1) : '—', [items]);
  const highest = useMemo(() => items.length ? Math.max(...items.map(item => Number(item.score))).toFixed(1) : '—', [items]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setMessage('');
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (authMode === 'signup' && !result.data.session) setMessage('Akun dibuat. Periksa email untuk konfirmasi, lalu masuk.');
    else setMessage('Berhasil masuk.');
  }

  function resetForm() { setEditingId(null); setWorkType('Laporan Ilmiah'); setTitle(''); setAuthor(''); setReviewer(''); setInstitution(''); setAssessmentDate(today()); setOverallNote(''); setScores(criteria.map(() => '')); setNotes(criteria.map(() => '')); setResult(null); setMessage('Formulir baru siap diisi.'); }

  async function saveAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase || !session) return;
    setMessage('');
    if (!title.trim()) { setMessage('Judul karya wajib diisi.'); return; }
    if (scores.some(value => !value)) { setMessage('Pilih skor 1–4 untuk semua aspek.'); return; }
    const aspects = criteria.map((criterion, index) => ({ name: criterion.name, weight: criterion.weight, score: Number(scores[index]), note: notes[index].trim(), weighted: Number((Number(scores[index]) / 4 * criterion.weight).toFixed(2)) }));
    const score = Number(aspects.reduce((sum, aspect) => sum + aspect.weighted, 0).toFixed(2));
    const payload = { user_id: session.user.id, work_type: workType, title: title.trim(), author: author.trim(), reviewer: reviewer.trim(), institution: institution.trim(), assessment_date: assessmentDate || null, overall_note: overallNote.trim(), aspects, score, grade: gradeFor(score) };
    setBusy(true);
    const query = editingId
      ? await supabase.from('assessments').update(payload).eq('id', editingId).select().single()
      : await supabase.from('assessments').insert(payload).select().single();
    setBusy(false);
    if (query.error) { setMessage(`Gagal menyimpan: ${query.error.message}. Pastikan schema database sudah dipasang.`); return; }
    const saved = query.data as Assessment; setResult(saved); setMessage('Penilaian berhasil disimpan ke database.'); await loadItems();
  }

  function editItem(item: Assessment) { setEditingId(item.id); setWorkType(item.work_type); setTitle(item.title); setAuthor(item.author || ''); setReviewer(item.reviewer || ''); setInstitution(item.institution || ''); setAssessmentDate(item.assessment_date || today()); setOverallNote(item.overall_note || ''); setScores(item.aspects.map(a => String(a.score))); setNotes(item.aspects.map(a => a.note || '')); setResult(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function deleteItem(id: string) { if (!supabase || !confirm('Hapus penilaian ini?')) return; const { error } = await supabase.from('assessments').delete().eq('id', id); if (error) setMessage(`Gagal menghapus: ${error.message}`); else { setMessage('Penilaian dihapus.'); if (result?.id === id) setResult(null); await loadItems(); } }
  function exportOne(item: Assessment) { downloadCsv('penilaian-karya-ilmiah.csv', [['Tanggal','Jenis karya','Judul','Penulis','Penilai','Institusi','Nilai','Predikat','Catatan umum'], [item.assessment_date,item.work_type,item.title,item.author,item.reviewer,item.institution,item.score,item.grade,item.overall_note], [], ['Aspek','Bobot (%)','Skor','Kontribusi','Catatan'], ...item.aspects.map(a => [a.name,a.weight,a.score,a.weighted,a.note])]); }
  function exportAll() { if (!items.length) { setMessage('Belum ada data untuk diekspor.'); return; } downloadCsv('rekap-penilaian.csv', [['Tanggal','Jenis karya','Judul','Penulis','Penilai','Institusi','Nilai','Predikat'], ...items.map(item => [item.assessment_date,item.work_type,item.title,item.author,item.reviewer,item.institution,item.score,item.grade])]); }

  if (!hasSupabaseConfig) return <main className="setup"><div className="setup-card"><div className="logo">R</div><h1>Hubungkan database untuk memulai</h1><p>Aplikasi full-stack ini memakai Supabase untuk autentikasi dan penyimpanan penilaian. Tambahkan environment variables di Vercel, lalu redeploy.</p><code>NEXT_PUBLIC_SUPABASE_URL</code><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code><p className="small">Jangan pernah menaruh service role key di variabel NEXT_PUBLIC atau di kode browser. Petunjuk setup tersedia di README repository.</p></div></main>;
  if (!authReady) return <main className="setup"><div className="setup-card">Memuat aplikasi…</div></main>;
  if (!session) return <main className="setup"><form className="auth-card" onSubmit={handleAuth}><div className="logo">R</div><p className="eyebrow">RUANG NILAI · FULL STACK</p><h1>{authMode === 'login' ? 'Selamat datang kembali' : 'Buat akun penilai'}</h1><p className="sub">Masuk untuk mengelola penilaian karya ilmiah Anda.</p><label>Email</label><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com"/><label>Kata sandi</label><input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 8 karakter"/><button className="primary full" disabled={busy}>{busy ? 'Memproses…' : authMode === 'login' ? 'Masuk' : 'Daftar'}</button>{message && <p className="message">{message}</p>}<button type="button" className="text-button" onClick={() => {setAuthMode(authMode === 'login' ? 'signup' : 'login');setMessage('');}}>{authMode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button><p className="small">Data penilaian hanya dapat diakses oleh akun yang membuatnya.</p></form></main>;

  return <main className="app-shell">
    <header className="header"><div className="brand"><div className="logo">R</div><div><h1>Ruang Nilai</h1><p>Penilaian laporan ilmiah &amp; KTI</p></div></div><div className="user-box"><span>{session.user.email}</span><button className="outline small-button" onClick={() => supabase?.auth.signOut()}>Keluar</button></div></header>
    <section className="hero"><p className="eyebrow">PENILAIAN AKADEMIK</p><h2>Kelola evaluasi karya secara profesional.</h2><p>Rubrik transparan, catatan terdokumentasi, dan rekap tersimpan aman di database akun Anda.</p></section>
    <section className="stats"><article><span>Total penilaian</span><strong>{items.length}</strong></article><article><span>Rata-rata nilai</span><strong>{average}</strong></article><article><span>Nilai tertinggi</span><strong>{highest}</strong></article></section>
    <form className="card" onSubmit={saveAssessment}>
      <div className="section-head"><div><h2>{editingId ? 'Edit penilaian' : 'Identitas penilaian'}</h2><p>Isi informasi karya dan penilai sebelum memberi skor.</p></div><span className="badge">Terhubung ke database</span></div>
      <div className="fields"><div><label>Jenis karya</label><select value={workType} onChange={e => setWorkType(e.target.value)}><option>Laporan Ilmiah</option><option>Karya Tulis Ilmiah (KTI)</option><option>Lainnya</option></select></div><div><label>Judul karya *</label><input required maxLength={180} value={title} onChange={e => setTitle(e.target.value)} placeholder="Masukkan judul"/></div><div><label>Nama penulis</label><input maxLength={120} value={author} onChange={e => setAuthor(e.target.value)} placeholder="Penulis atau tim"/></div><div><label>Nama penilai</label><input maxLength={120} value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="Nama penilai"/></div><div><label>Sekolah / institusi</label><input maxLength={140} value={institution} onChange={e => setInstitution(e.target.value)} placeholder="Opsional"/></div><div><label>Tanggal penilaian</label><input type="date" value={assessmentDate} onChange={e => setAssessmentDate(e.target.value)}/></div><div className="wide"><label>Catatan umum / rekomendasi perbaikan</label><textarea rows={3} maxLength={1200} value={overallNote} onChange={e => setOverallNote(e.target.value)} placeholder="Masukan utama untuk penulis"/></div></div>
      <div className="section-head rubric-title"><div><h2>Rubrik penilaian</h2><p>Pilih skor 1–4 pada semua aspek. Total bobot 100%.</p></div></div>
      {criteria.map((criterion,index)=><div className="criterion" key={criterion.name}><div className="aspect"><h3>{criterion.name}</h3><p>{criterion.desc}</p><span>Bobot {criterion.weight}%</span></div><div><label>Skor (1–4)</label><select required value={scores[index]} onChange={e=>setScores(prev=>prev.map((v,i)=>i===index?e.target.value:v))}><option value="">Pilih skor</option><option value="1">1 — Perlu perbaikan</option><option value="2">2 — Berkembang</option><option value="3">3 — Baik</option><option value="4">4 — Sangat baik</option></select></div><div><label>Catatan aspek</label><textarea rows={2} maxLength={600} value={notes[index]} onChange={e=>setNotes(prev=>prev.map((v,i)=>i===index?e.target.value:v))} placeholder="Masukan spesifik"/></div></div>)}
      <p className="hint">Panduan skor: 1 = perlu banyak perbaikan · 2 = berkembang · 3 = baik · 4 = sangat baik.</p><div className="actions"><button className="primary" disabled={busy}>{busy?'Menyimpan…':editingId?'Simpan perubahan':'Hitung & simpan'}</button><button type="button" className="outline" onClick={resetForm}>Penilaian baru</button>{result && <><button type="button" className="outline" onClick={()=>exportOne(result)}>Ekspor CSV</button><button type="button" className="outline" onClick={()=>window.print()}>Cetak / PDF</button></>}</div>{message&&<p className="message">{message}</p>}
    </form>
    {result&&<section className="card result"><div className="section-head"><div><p className="eyebrow">HASIL PENILAIAN</p><h2>{result.title}</h2><p>{result.work_type} · {result.author||'Penulis tidak diisi'} · {result.assessment_date}</p></div><div className="final-score">{Number(result.score).toFixed(2)}<small>/ 100</small></div></div><p className="grade">{result.grade}</p><div className="recommendation"><strong>Rekomendasi</strong><br/>{recommendation(Number(result.score))}</div><h3>Rincian aspek</h3><ul>{result.aspects.map(aspect=><li key={aspect.name}><strong>{aspect.name}:</strong> {aspect.score}/4 · kontribusi {aspect.weighted} {aspect.note&&`— ${aspect.note}`}</li>)}</ul>{result.overall_note&&<p><strong>Catatan umum:</strong> {result.overall_note}</p>}</section>}
    <section className="card history"><div className="section-head"><div><h2>Riwayat penilaian</h2><p>Data akun Anda disimpan di Supabase dan tersedia lintas perangkat.</p></div><button className="outline small-button" onClick={exportAll}>Ekspor rekap CSV</button></div>{items.length===0?<p className="empty">Belum ada penilaian tersimpan.</p>:<div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Judul</th><th>Penulis</th><th>Nilai</th><th>Predikat</th><th>Aksi</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{item.assessment_date||'—'}</td><td>{item.title}</td><td>{item.author||'—'}</td><td>{Number(item.score).toFixed(1)}</td><td>{item.grade}</td><td><div className="row-actions"><button className="link-button" onClick={()=>editItem(item)}>Edit</button><button className="link-button danger" onClick={()=>deleteItem(item.id)}>Hapus</button></div></td></tr>)}</tbody></table></div>}</section>
    <footer>Ruang Nilai · Akun: {session.user.email} · Penilaian Anda bersifat pribadi.</footer>
  </main>;
}
