import { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiFileText, FiZap, FiCheck, FiAlertTriangle, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { scanDocument, getDrafts, publishDraft, discardDraft } from '../services/api';

const URGENCY_COLORS = {
  low:      { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)' },
  medium:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  high:     { color: '#f87171', bg: 'rgba(248,113,113,0.12)',border: 'rgba(248,113,113,0.3)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.5)'  }
};

const ScanUploadModal = ({ onClose, onPublished }) => {
  const [tab, setTab] = useState('upload'); // 'upload' | 'drafts'
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);      // last scan result
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const fileRef = useRef();

  // ── File picking ──────────────────────────────────────────────────────────
  const pickFile = (f) => {
    setFile(f);
    setResult(null);
    setError('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  // ── Upload & scan ─────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('document', file);
      const res = await scanDocument(fd);
      setResult(res.data);
      setTab('upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // ── Load drafts tab ───────────────────────────────────────────────────────
  const loadDrafts = async () => {
    setTab('drafts');
    setDraftsLoading(true);
    try {
      const res = await getDrafts();
      setDrafts(res.data);
    } catch (_) {}
    finally { setDraftsLoading(false); }
  };

  const handlePublish = async (id, data) => {
    try {
      await publishDraft(id, data);
      setDrafts(prev => prev.filter(d => d._id !== id));
      setEditingDraft(null);
      onPublished();
    } catch (err) {
      alert(err.response?.data?.message || 'Publish failed');
    }
  };

  const handleDiscard = async (id) => {
    if (!window.confirm('Discard this draft task?')) return;
    try {
      await discardDraft(id);
      setDrafts(prev => prev.filter(d => d._id !== id));
    } catch (_) {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ background: 'rgba(8,4,4,0.95)', border: '1px solid rgba(239,68,68,0.25)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 flex-shrink-0" style={{ borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #dc2626, #10b981)' }} />
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa' }}>
                  <FiFileText />
                </span>
                AI Document Scanner
              </h2>
              <p className="text-xs font-bold mt-2 uppercase tracking-widest" style={{ color: '#fca5a5' }}>
                Upload field surveys · AI extracts tasks automatically
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-3 mt-6">
            {[
              { key: 'upload', label: 'Upload & Scan', icon: <FiUploadCloud /> },
              { key: 'drafts', label: 'Review Drafts', icon: <FiEye /> }
            ].map(t => (
              <button key={t.key}
                onClick={() => t.key === 'drafts' ? loadDrafts() : setTab('upload')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={tab === t.key
                  ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }
                  : { background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6">

          {/* ── UPLOAD TAB ─────────────────────────────────────────────── */}
          {tab === 'upload' && (
            <div className="space-y-6">

              {/* Drop Zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current.click()}
                className="relative rounded-2xl p-10 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? '#a78bfa' : file ? '#10b981' : 'rgba(239,68,68,0.3)'}`,
                  background: dragOver ? 'rgba(124,58,237,0.08)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                  boxShadow: dragOver ? '0 0 30px rgba(124,58,237,0.15)' : 'none'
                }}>
                <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => pickFile(e.target.files[0])} />

                {file ? (
                  <div>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                      <FiFileText />
                    </div>
                    <p className="font-black text-white text-lg">{file.name}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {(file.size / 1024).toFixed(0)} KB · {file.type}
                    </p>
                    <p className="text-xs text-emerald-500 font-bold mt-2 uppercase tracking-widest">✓ File ready — click Analyze to proceed</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>
                      <FiUploadCloud />
                    </div>
                    <p className="font-black text-white text-lg">Drop your field report here</p>
                    <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">JPG · PNG · WebP · PDF · Max 10MB</p>
                    <p className="text-xs text-slate-600 mt-3">Scanned surveys, handwritten notes, or printed forms</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <FiAlertTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              {/* Scan button */}
              {file && !scanning && !result && (
                <button onClick={handleScan}
                  className="w-full py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #dc2626)', boxShadow: '0 10px 30px rgba(124,58,237,0.3)' }}>
                  <FiZap className="text-xl animate-pulse" />
                  Analyze with AI
                </button>
              )}

              {/* Scanning indicator */}
              {scanning && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(124,58,237,0.2)', borderTopColor: '#7c3aed' }} />
                    <div className="absolute inset-2 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(220,38,38,0.2)', borderTopColor: '#dc2626', animationDirection: 'reverse', animationDuration: '0.7s' }} />
                  </div>
                  <div>
                    <p className="font-black text-white text-center uppercase tracking-widest">Gemini AI Analyzing...</p>
                    <p className="text-xs text-slate-500 text-center mt-1">Reading handwriting, extracting task details</p>
                  </div>
                </div>
              )}

              {/* Result card */}
              {result && (
                <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' }}>
                  <div className="px-6 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.08)' }}>
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <FiCheck />
                    </span>
                    <div>
                      <p className="font-black text-emerald-400 text-sm uppercase tracking-widest">Draft Task Created!</p>
                      <p className="text-xs text-slate-500 mt-0.5">{result.message}</p>
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Task Title</p>
                      <p className="font-black text-white text-lg">{result.task.title}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Description</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{result.task.description}</p>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Urgency</p>
                        <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest" style={{
                          background: URGENCY_COLORS[result.task.urgency]?.bg,
                          color: URGENCY_COLORS[result.task.urgency]?.color,
                          border: `1px solid ${URGENCY_COLORS[result.task.urgency]?.border}`
                        }}>{result.task.urgency}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Location</p>
                        <span className="text-white text-sm font-bold">{result.task.location?.city}</span>
                      </div>
                      {result.extractedData?.affectedPeople && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Affected</p>
                          <span className="text-white text-sm font-bold">{result.extractedData.affectedPeople}</span>
                        </div>
                      )}
                    </div>

                    {result.task.requiredSkills?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {result.task.requiredSkills.map(s => (
                            <span key={s} className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.extractedData?.confidence && (
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        AI Confidence: <span className={result.extractedData.confidence === 'high' ? 'text-emerald-500' : result.extractedData.confidence === 'medium' ? 'text-amber-500' : 'text-red-500'}>{result.extractedData.confidence}</span>
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button onClick={loadDrafts}
                        className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', color: '#fff', boxShadow: '0 5px 20px rgba(220,38,38,0.3)' }}>
                        Review All Drafts →
                      </button>
                      <button onClick={() => { setFile(null); setResult(null); }}
                        className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:bg-white/10"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>
                        Scan Another
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DRAFTS TAB ─────────────────────────────────────────────── */}
          {tab === 'drafts' && (
            <div className="space-y-4">
              {draftsLoading && (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#ef4444' }} />
                </div>
              )}

              {!draftsLoading && drafts.length === 0 && (
                <div className="text-center py-12">
                  <FiFileText className="text-4xl mx-auto mb-3 text-slate-700" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No draft tasks</p>
                  <p className="text-slate-700 text-xs mt-1">Scan a document to create AI-generated drafts</p>
                </div>
              )}

              {!draftsLoading && drafts.map(draft => {
                const u = URGENCY_COLORS[draft.urgency] || URGENCY_COLORS.medium;
                const isEditing = editingDraft?._id === draft._id;
                return (
                  <div key={draft._id} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,5,5,0.6)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <div className="px-6 pt-5 pb-4">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        {isEditing ? (
                          <input value={editingDraft.title} onChange={e => setEditingDraft({ ...editingDraft, title: e.target.value })}
                            className="flex-1 bg-black/40 border border-red-900/50 rounded-lg px-3 py-2 text-white font-black text-base focus:outline-none focus:border-red-500" />
                        ) : (
                          <h4 className="font-black text-white text-base flex-1 leading-tight">{draft.title}</h4>
                        )}
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex-shrink-0" style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>
                          {draft.urgency}
                        </span>
                      </div>

                      {isEditing ? (
                        <textarea value={editingDraft.description} onChange={e => setEditingDraft({ ...editingDraft, description: e.target.value })}
                          rows={3} className="w-full bg-black/40 border border-red-900/50 rounded-lg px-3 py-2 text-slate-300 text-xs font-medium focus:outline-none focus:border-red-500 resize-none" />
                      ) : (
                        <p className="text-slate-400 text-xs leading-relaxed mb-3">{draft.description}</p>
                      )}

                      {draft.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {draft.requiredSkills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest" style={{ background: 'rgba(239,68,68,0.06)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>{s}</span>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        📍 {draft.location?.city} &nbsp;·&nbsp; Source: {draft.sourceDocument}
                      </p>
                    </div>

                    <div className="px-6 py-4 flex gap-2 justify-end" style={{ borderTop: '1px solid rgba(239,68,68,0.08)', background: 'rgba(0,0,0,0.3)' }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => handlePublish(draft._id, editingDraft)}
                            className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 5px 15px rgba(16,185,129,0.3)' }}>
                            <FiCheck /> Publish
                          </button>
                          <button onClick={() => setEditingDraft(null)}
                            className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handlePublish(draft._id, {})}
                            className="px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 5px 15px rgba(16,185,129,0.3)' }}>
                            <FiCheck /> Publish
                          </button>
                          <button onClick={() => setEditingDraft({ ...draft })}
                            className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5 flex items-center gap-1.5"
                            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                            <FiEdit2 /> Edit
                          </button>
                          <button onClick={() => handleDiscard(draft._id)}
                            className="px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500/10 text-red-700 hover:text-red-500">
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanUploadModal;
