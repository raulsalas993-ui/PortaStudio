import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

// ==========================================
// 🎨 UTILIDADES
// ==========================================
const formatearFecha = (fecha) => {
  if(!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const getIconoArchivo = (tipo) => {
    if (!tipo) return '📦';
    if (tipo.includes('image')) return '🖼️';
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    if (tipo.includes('video')) return '🎥';
    if (tipo.includes('excel') || tipo.includes('sheet')) return '📊';
    return '📦';
};

const agruparPorNombre = (archivos) => {
    if (!Array.isArray(archivos)) return {};
    const grupos = {};
    archivos.forEach(archivo => {
        const nombre = archivo.nombre || 'Sin nombre';
        if (!grupos[nombre]) grupos[nombre] = [];
        grupos[nombre].push(archivo);
    });
    return grupos;
};

const obtenerImagen = (proyecto) => {
    if (!proyecto) return null;
    if (proyecto.logo) return proyecto.logo;
    if (proyecto.versiones && Array.isArray(proyecto.versiones) && proyecto.versiones.length > 0) {
        const vImg = [...proyecto.versiones].reverse().find(v => v.tipo && v.tipo.includes('image'));
        if(vImg) return vImg.url;
    }
    if (proyecto.archivos && Array.isArray(proyecto.archivos) && proyecto.archivos.length > 0) {
       const primeraImagen = proyecto.archivos.find(a => typeof a === 'string' && (a.includes('jpg') || a.includes('png') || a.includes('jpeg')));
       return primeraImagen || proyecto.archivos[0];
    }
    return null;
};

// ==========================================
// 🧩 COMPONENTE: TARJETA DE ARCHIVO
// ==========================================
function TarjetaArchivoAgrupado({ nombre, archivos, proyecto, seleccionarVersion }) {
    const [expandido, setExpandido] = useState(false);
    const archivosOrdenados = [...archivos].reverse(); 
    const masReciente = archivosOrdenados[0];
    const versionesAnteriores = archivosOrdenados.slice(1);
    const totalVersiones = archivos.length;

    return (
        <div className={`transition-all duration-300 ${expandido ? 'bg-slate-50 ring-1 ring-slate-200' : 'bg-transparent'} rounded-xl mb-3`}>
            <div className={`border p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 transition-all bg-white relative z-10 ${proyecto.archivoFinal === masReciente.url ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-violet-300 shadow-sm'}`}>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl shrink-0 relative">
                    {getIconoArchivo(masReciente.tipo || '')}
                    {totalVersiones > 1 && <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">v{totalVersiones}</span>}
                </div>
                <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <h4 className="text-slate-800 text-sm font-bold truncate">{masReciente.nombre}</h4>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">{formatearFecha(masReciente.fecha)} {masReciente.fecha ? new Date(masReciente.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                    {proyecto.archivoFinal === masReciente.url && <div className="text-emerald-600 text-[10px] font-bold mt-1 uppercase tracking-wider">🌟 Aprobado</div>}
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <a href={masReciente.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors text-center">Ver</a>
                    {seleccionarVersion && proyecto.archivoFinal !== masReciente.url && <button onClick={() => seleccionarVersion(masReciente)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200">Aprobar</button>}
                    {versionesAnteriores.length > 0 && <button onClick={() => setExpandido(!expandido)} className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${expandido ? 'bg-violet-100 text-violet-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}><span>📜</span><span className="hidden sm:inline">Historial</span><span className={`transform transition-transform ${expandido ? 'rotate-180' : ''}`}>▼</span></button>}
                </div>
            </div>
            {expandido && versionesAnteriores.length > 0 && (
                <div className="p-3 pl-4 sm:pl-16 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="flex items-center gap-2 mb-2"><div className="h-px bg-slate-200 flex-1"></div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Versiones Anteriores</span><div className="h-px bg-slate-200 flex-1"></div></div>
                    {versionesAnteriores.map((v, i) => (
                        <div key={i} className={`flex items-center justify-between p-2 rounded-lg border text-xs bg-white ${proyecto.archivoFinal === v.url ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200'}`}>
                            <div className="flex items-center gap-3"><span className="text-slate-400 font-mono font-bold">v{totalVersiones - 1 - i}</span><div className="flex flex-col"><span className="text-slate-600 font-medium truncate max-w-[150px]">{v.nombre}</span><span className="text-[9px] text-slate-400">{formatearFecha(v.fecha)}</span></div></div>
                            <div className="flex gap-2"><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline font-bold">Ver</a>{seleccionarVersion && proyecto.archivoFinal !== v.url && <button onClick={() => seleccionarVersion(v)} className="text-emerald-600 hover:underline font-bold">Restaurar</button>}{proyecto.archivoFinal === v.url && <span className="text-emerald-600 font-bold text-[10px] border border-emerald-200 px-2 rounded-full bg-emerald-50">ACTUAL</span>}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================================
// 🔐 PANTALLA DE LOGIN
// ==========================================
function AuthPage({ onLogin }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setCargando(true);
    const endpoint = esRegistro ? '/registro' : '/login';
    try {
      const res = await fetch(`https://portastudio-api.vercel.app/api/auth${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);
      if (esRegistro) { alert('✅ Cuenta creada. Bienvenido a PortaStudio.'); setEsRegistro(false); setFormData({ nombre: '', email: '', password: '' }); }
      else { localStorage.setItem('token', data.token); localStorage.setItem('usuario', JSON.stringify(data.usuario)); onLogin(data.usuario); }
    } catch (err) { setError(err.message); } finally { setCargando(false); }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"><div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-violet-950/40 to-slate-950 z-0"></div><div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-violet-700/40 blur-[180px] mix-blend-screen z-10"></div><div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-cyan-600/30 blur-[180px] mix-blend-screen z-10"></div><div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/30 blur-[200px] mix-blend-overlay z-10"></div></div>
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-20 animate-in fade-in zoom-in duration-500 border border-white/20 ring-1 ring-white/40">
         <div className="p-10">
            <h1 className="text-center text-4xl font-black text-neutral-900 mb-2 tracking-tighter">Porta<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Studio</span>.</h1>
            <p className="text-center text-slate-500 mb-8 text-sm font-medium tracking-wide">{esRegistro ? 'Únete al equipo creativo' : 'Gestión de Proyectos Premium'}</p>
            {error && <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-xs font-bold mb-6 text-center shadow-sm">⚠️ {error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
               {esRegistro && <div><label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Nombre</label><input placeholder="Tu Nombre" className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all focus:bg-white" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>}
               <div><label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Email Corporativo</label><input type="email" placeholder="nombre@portastudio.com" className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all focus:bg-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
               <div><label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wider">Contraseña</label><input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all focus:bg-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
               <button disabled={cargando} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-4 rounded-xl font-bold hover:from-violet-700 hover:to-fuchsia-700 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{cargando ? 'Accediendo...' : (esRegistro ? 'Crear Cuenta' : 'Ingresar al Portal')}</button>
            </form>
            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">{esRegistro ? '¿Ya eres miembro?' : '¿Aún no tienes acceso?'} <button onClick={() => { setEsRegistro(!esRegistro); setError(''); }} className="text-violet-600 font-black ml-2 hover:underline uppercase tracking-wide">{esRegistro ? 'Inicia Sesión' : 'Solicitar Cuenta'}</button></div>
         </div>
      </div>
    </div>
  );
}

// ==========================================
// 👤 VISTA CLIENTE
// ==========================================
function VistaCliente() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [imagenActual, setImagenActual] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarChat, setMostrarChat] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nombreCliente, setNombreCliente] = useState(''); 

  useEffect(() => {
    fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}`).then(res => res.json()).then(data => { 
        setProyecto(data);
        const img = obtenerImagen(data);
        if(img) setImagenActual(img);
        setLoading(false); 
    }).catch(err => setLoading(false));
    cargarComentarios();
  }, [id]);

  const cargarComentarios = () => { fetch(`https://portastudio-api.vercel.app/api/comentarios/${id}`).then(res => res.json()).then(data => { if(Array.isArray(data)) setComentarios(data.filter(c => c.tipo === 'cliente')); else setComentarios([]); }).catch(() => setComentarios([])); };
  
  const seleccionarVersion = async (archivo) => {
      if(!window.confirm(`¿Aprobar versión: "${archivo.nombre}"?`)) return;
      const res = await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}/seleccionar`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urlArchivo: archivo.url, nombreArchivo: archivo.nombre }) });
      const data = await res.json();
      setProyecto(data);
      alert("🎉 Versión aprobada.");
  };

  const enviarDecision = async (d) => { 
      if(!window.confirm(`¿Confirmar decisión: ${d}?`)) return; 
      const res = await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}/decision`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ decision: d }) 
      }); 
      const data = await res.json(); 
      setProyecto(data); 
      if (data.decision === 'Pendiente') alert("Estado reseteado a PENDIENTE.");
      else alert(`Estado actualizado a: ${data.decision.toUpperCase()}`);
  };

  const enviarReaccion = async (t) => { await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}/reaccion`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: t }) }); const data = await (await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}`)).json(); setProyecto(data); };
  const enviarComentarioCliente = async (e) => { e.preventDefault(); if (!nuevoComentario.trim()) return; await fetch('https://portastudio-api.vercel.app/api/comentarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proyectoId: id, usuario: nombreCliente || "Cliente", texto: nuevoComentario, tipo: 'cliente' }) }); setNuevoComentario(''); cargarComentarios(); };

  if (loading) return <div className="h-screen bg-neutral-950 flex items-center justify-center text-white/50 font-light">Cargando experiencia...</div>;
  if (!proyecto) return <div className="h-screen bg-neutral-950 flex items-center justify-center text-white">Proyecto no encontrado.</div>;

  const archivosAgrupados = agruparPorNombre(proyecto.versiones);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none"><div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-violet-950/40 to-slate-950 z-0"></div><div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-violet-700/40 blur-[180px] mix-blend-screen z-10"></div></div>
      <div className="w-full p-8 flex justify-between items-start z-20 pointer-events-none">
         <div className="pointer-events-auto">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">{proyecto.titulo}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-violet-400 font-bold uppercase text-[10px] tracking-widest border border-violet-500/30 px-2 py-1 rounded">PARA: {proyecto.cliente}</span>
              {proyecto.decision === 'Aprobado' && <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">✅ APROBADO</span>}
              {proyecto.decision === 'Rechazado' && <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">❌ CAMBIOS</span>}
            </div>
         </div>
         <button onClick={() => setMostrarChat(!mostrarChat)} className="pointer-events-auto bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/40 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all">💬 Feedback ({comentarios.length})</button>
      </div>
      <div className="flex-1 w-full max-w-5xl mx-auto p-6 z-10 flex flex-col md:flex-row gap-8 items-start">
         <div className="w-full md:w-1/3 flex flex-col gap-4">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-center justify-center min-h-[200px]">
                 {proyecto.logo ? <img src={proyecto.logo} className="w-48 h-48 object-contain rounded-full bg-white/10 p-2 shadow-2xl" alt="Logo Cliente" /> : <div className="text-6xl">🏢</div>}
             </div>
             {proyecto.descripcion && <div className="bg-neutral-900/80 border border-white/10 p-6 rounded-2xl"><h3 className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2">Sobre el Proyecto</h3><p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{proyecto.descripcion}</p></div>}
             <div className="flex justify-center gap-6 p-4 rounded-2xl bg-neutral-900/50 border border-white/10 md:hidden">
                {['like','love','fire'].map(t=><button key={t} onClick={()=>enviarReaccion(t)} className="group flex flex-col items-center hover:scale-110 transition-transform"><span className="text-2xl">{t==='like'?'👍':t==='love'?'❤️':'👎'}</span><span className="text-[10px] text-white/50">{proyecto.reacciones?.[t]||0}</span></button>)}
             </div>
         </div>
         <div className="w-full md:w-2/3">
             <h2 className="text-white text-lg font-bold mb-4 flex items-center gap-2">📂 Archivos Entregables <span className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full">{(proyecto.versiones || []).length}</span></h2>
             <div className="grid gap-3">
                 {Object.keys(archivosAgrupados).length > 0 ? Object.keys(archivosAgrupados).map((nombreArchivo, idx) => (<TarjetaArchivoAgrupado key={idx} nombre={nombreArchivo} archivos={archivosAgrupados[nombreArchivo]} proyecto={proyecto} seleccionarVersion={seleccionarVersion} />)) : <div className="text-slate-500 text-sm italic p-10 text-center border border-dashed border-white/10 rounded-xl">Aún no hay entregables disponibles.</div>}
                 {Array.isArray(proyecto.archivos) && proyecto.archivos.map((archivo, idx) => (<div key={`old-${idx}`} className="border p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 bg-neutral-900/80 border-white/10 opacity-70"><div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-2xl shrink-0">📁</div><div className="flex-1 min-w-0 w-full text-center sm:text-left"><h4 className="text-white text-sm font-bold truncate">Archivo Anterior {idx + 1}</h4><p className="text-slate-500 text-[10px] uppercase font-bold">Legacy</p></div><a href={archivo} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors text-center">Ver</a></div>))}
             </div>
             <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                 <div className="hidden md:flex gap-6 mr-auto items-center">
                    <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Tu Opinión:</span>
                    {['like','love','fire'].map(t=><button key={t} onClick={()=>enviarReaccion(t)} className="group flex items-center gap-2 hover:scale-110 transition-transform"><span className="text-xl opacity-70 group-hover:opacity-100">{t==='like'?'👍':t==='love'?'❤️':'👎'}</span><span className="text-[10px] text-white/50">{proyecto.reacciones?.[t]||0}</span></button>)}
                 </div>
                 <button onClick={() => enviarDecision('Rechazado')} className="bg-transparent hover:bg-red-500/10 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/50 px-5 py-2 rounded-xl text-xs font-bold transition-all">Solicitar Cambios</button>
                 <button onClick={() => enviarDecision('Aprobado')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all">Aprobar Todo</button>
            </div>
         </div>
      </div>
      {mostrarChat && <div className="fixed top-0 right-0 h-full w-80 bg-neutral-900 border-l border-white/10 z-50 flex flex-col"><div className="p-4 border-b border-white/10 flex justify-between text-white"><h3 className="font-bold">Feedback</h3><button onClick={() => setMostrarChat(false)} className="text-white">✕</button></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{comentarios.map(c => <div key={c._id} className="p-3 rounded-xl bg-white/5 text-sm text-slate-300">{c.texto}</div>)}</div><form onSubmit={enviarComentarioCliente} className="p-4 border-t border-white/10"><input className="w-full bg-neutral-800 text-white rounded p-2 mb-2" placeholder="Tu nombre" value={nombreCliente} onChange={e=>setNombreCliente(e.target.value)}/><div className="flex gap-2"><input className="flex-1 bg-neutral-800 text-white rounded p-2" value={nuevoComentario} onChange={e=>setNuevoComentario(e.target.value)}/><button className="bg-violet-600 text-white px-4 rounded">Enviar</button></div></form></div>}
    </div>
  );
}

// ====================================================
// 🏢 PANEL ADMIN
// ====================================================
function PanelAdmin({ onLogout, usuario }) {
  const [vista, setVista] = useState('proyectos'); 
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [tabChat, setTabChat] = useState('interno'); 

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [imagenVisualizada, setImagenVisualizada] = useState(''); 
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [busquedaProyectos, setBusquedaProyectos] = useState('');
  const [busquedaClientes, setBusquedaClientes] = useState('');
  const [archivo, setArchivo] = useState(null); 
  
  const [nuevoProyecto, setNuevoProyecto] = useState({ titulo: '', cliente: '', estado: 'Borrador', fechaEntrega: '', descripcion: '' });
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', email: '', empresa: '', telefono: '' });
  const [nuevoRecurso, setNuevoRecurso] = useState({ nombre: '', categoria: 'Otros' });
  const [archivoRecurso, setArchivoRecurso] = useState(null);
  const [filtroRecursos, setFiltroRecursos] = useState('Todos');

  const cargarDatos = async () => {
    try {
      const resP = await fetch('https://portastudio-api.vercel.app/api/proyectos'); const dataP = await resP.json(); setProyectos(Array.isArray(dataP) ? dataP : []); 
      const resC = await fetch('https://portastudio-api.vercel.app/api/clientes'); const dataC = await resC.json(); setClientes(Array.isArray(dataC) ? dataC : []);
      const resR = await fetch('https://portastudio-api.vercel.app/api/recursos'); if(resR.ok) { const dataR = await resR.json(); setRecursos(Array.isArray(dataR) ? dataR : []); }
      const resN = await fetch('https://portastudio-api.vercel.app/api/notificaciones'); if(resN.ok) { const dataN = await resN.json(); if(Array.isArray(dataN)){ setNotificaciones(dataN); setNoLeidas(dataN.filter(n => !n.leido).length); } }
    } catch (error) { console.error("Error cargando datos:", error); }
  };

  useEffect(() => { cargarDatos(); const intervalo = setInterval(cargarDatos, 30000); return () => clearInterval(intervalo); }, []);
  useEffect(() => { if (proyectoSeleccionado) { const img = obtenerImagen(proyectoSeleccionado); setImagenVisualizada(img || ''); } else { setImagenVisualizada(''); } }, [proyectoSeleccionado]);

  const abrirNotificacion = async (n) => { if(!n.leido) { await fetch(`https://portastudio-api.vercel.app/api/notificaciones/${n._id}/leer`, { method: 'PUT' }); const nuevas = notificaciones.map(item => item._id === n._id ? {...item, leido: true} : item); setNotificaciones(nuevas); setNoLeidas(nuevas.filter(x => !x.leido).length); } if(n.proyectoId) { const p = proyectos.find(x => x._id === n.proyectoId); if(p) { setProyectoSeleccionado(p); setTabChat('cliente'); cargarComentarios(p._id); } } setMostrarNotificaciones(false); };
  const cargarComentarios = async (id) => { try { const res = await fetch(`https://portastudio-api.vercel.app/api/comentarios/${id}`); const data = await res.json(); setComentarios(Array.isArray(data) ? data : []); } catch { setComentarios([]); } };
  const enviarComentario = async (e) => { e.preventDefault(); if (!nuevoComentario.trim()) return; await fetch('https://portastudio-api.vercel.app/api/comentarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proyectoId: proyectoSeleccionado._id, usuario: usuario?.nombre || "Colaborador", texto: nuevoComentario, tipo: tabChat }) }); setNuevoComentario(''); cargarComentarios(proyectoSeleccionado._id); };
  const subirVersionRapida = async (e, id) => { const file = e.target.files[0]; if (!file) return; if(!window.confirm(`¿Subir archivo "${file.name}"?`)) return; const formData = new FormData(); formData.append('archivo', file); const res = await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}/version`, { method: 'POST', body: formData }); if(res.ok) { alert("✅ Nueva versión subida y notificación enviada."); cargarDatos(); if(proyectoSeleccionado && proyectoSeleccionado._id === id) { const updated = await (await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}`)).json(); setProyectoSeleccionado(updated); } } };
  const enviarProyecto = async (e) => { e.preventDefault(); const formData = new FormData(); formData.append('titulo', nuevoProyecto.titulo); formData.append('cliente', nuevoProyecto.cliente); formData.append('estado', nuevoProyecto.estado); formData.append('descripcion', nuevoProyecto.descripcion); if (nuevoProyecto.fechaEntrega) formData.append('fechaEntrega', nuevoProyecto.fechaEntrega); if (archivo) formData.append('imagen', archivo); const res = await fetch('https://portastudio-api.vercel.app/api/proyectos', { method: 'POST', body: formData }); if (res.ok) { const data = await res.json(); setProyectos(prev => [data, ...prev]); setNuevoProyecto({ titulo: '', cliente: '', estado: 'Borrador', fechaEntrega: '', descripcion: '' }); setArchivo(null); alert("✅ Proyecto creado exitosamente"); } };
  const enviarCliente = async (e) => { e.preventDefault(); const res = await fetch('https://portastudio-api.vercel.app/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoCliente) }); if(res.ok) { const data = await res.json(); setClientes(prev => [data, ...prev]); setNuevoCliente({ nombre: '', email: '', empresa: '', telefono: '' }); } };
  const subirRecurso = async (e) => { e.preventDefault(); if(!archivoRecurso) return alert("Selecciona archivo"); const formData = new FormData(); formData.append('nombre', nuevoRecurso.nombre); formData.append('categoria', nuevoRecurso.categoria); formData.append('archivo', archivoRecurso); const res = await fetch('https://portastudio-api.vercel.app/api/recursos', { method: 'POST', body: formData }); if(res.ok) { const data = await res.json(); setRecursos(prev => [data, ...prev]); setNuevoRecurso({ nombre: '', categoria: 'Otros' }); setArchivoRecurso(null); alert("✅ Recurso subido"); } };
  const eliminarProyecto = async (id, e) => { e.stopPropagation(); if (window.confirm("¿Eliminar proyecto?")) { await fetch(`https://portastudio-api.vercel.app/api/proyectos/${id}`, { method: 'DELETE' }); cargarDatos(); } };
  const eliminarRecurso = async (id) => { if(window.confirm("¿Eliminar recurso?")) { await fetch(`https://portastudio-api.vercel.app/api/recursos/${id}`, { method: 'DELETE' }); cargarDatos(); } };
  
  // === NUEVA FUNCIÓN PARA ELIMINAR CLIENTES ===
  const eliminarCliente = async (id) => {
      if(!window.confirm("¿Seguro que quieres eliminar este cliente? Se borrarán sus datos.")) return;
      try {
          await fetch(`https://portastudio-api.vercel.app/api/clientes/${id}`, { method: 'DELETE' });
          alert("✅ Cliente eliminado");
          cargarDatos(); // Recargar la lista
      } catch (e) { alert("Error al eliminar"); }
  };

  const proyectosFiltrados = proyectos.filter(p => p.titulo.toLowerCase().includes(busquedaProyectos.toLowerCase()) || p.cliente.toLowerCase().includes(busquedaProyectos.toLowerCase()));
  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busquedaClientes.toLowerCase()) || c.empresa?.toLowerCase().includes(busquedaClientes.toLowerCase()));
  const recursosFiltrados = recursos.filter(r => filtroRecursos === 'Todos' || r.categoria === filtroRecursos);
  const comentariosFiltrados = comentarios.filter(c => c.tipo === tabChat);
  const archivosAgrupados = proyectoSeleccionado ? agruparPorNombre(proyectoSeleccionado.versiones) : {};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative selection:bg-violet-200">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3"><h1 className="text-xl font-bold tracking-tight text-neutral-900">Porta<span className="text-violet-600">Studio</span>.</h1><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-slate-200">{usuario?.rol || 'Admin'}</span></div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)} className="relative p-2 text-slate-500 hover:text-violet-600 transition-colors"><span className="text-xl">🔔</span>{noLeidas > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">{noLeidas}</span>}</button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex gap-2 items-center">
              {['proyectos','clientes','recursos'].map(v=><button key={v} onClick={() => setVista(v)} className={`px-4 py-2 rounded-lg font-bold transition-all text-sm capitalize ${vista === v ? 'bg-violet-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{v}</button>)}
              <button onClick={onLogout} className="ml-2 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">SALIR</button>
            </div>
          </div>
        </div>
      </nav>

      {mostrarNotificaciones && <div className="absolute top-16 right-4 md:right-40 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto p-2"><div className="flex justify-between border-b p-2"><h3 className="font-bold text-xs">Notificaciones</h3><button onClick={()=>setMostrarNotificaciones(false)}>x</button></div>{notificaciones.map(n=><div key={n._id} onClick={()=>abrirNotificacion(n)} className="p-2 border-b text-xs cursor-pointer hover:bg-slate-50">{n.texto}</div>)}</div>}

      <main className="max-w-6xl mx-auto p-6">
        {vista === 'proyectos' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-6 text-neutral-800">Proyectos Creativos</h2>
            <form onSubmit={enviarProyecto} className="bg-white p-6 rounded-2xl border mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm">
              <div className="flex flex-col gap-1 md:col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Título</label><input className="border p-2 rounded-lg outline-violet-500" value={nuevoProyecto.titulo} onChange={e => setNuevoProyecto({...nuevoProyecto, titulo: e.target.value})} required /></div>
              <div className="flex flex-col gap-1 relative">
                <label className="text-xs font-bold text-slate-400 uppercase">Cliente</label>
                <input type="text" className="border p-2 rounded-lg outline-violet-500 w-full" placeholder="Escribe o selecciona..." value={nuevoProyecto.cliente} onChange={e => { setNuevoProyecto({...nuevoProyecto, cliente: e.target.value}); setMostrarSugerencias(true); }} onFocus={() => setMostrarSugerencias(true)} onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)} required />
                {mostrarSugerencias && nuevoProyecto.cliente && ( <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mt-1">{clientes.filter(c => c.nombre.toLowerCase().includes(nuevoProyecto.cliente.toLowerCase())).map(c => (<div key={c._id} className="p-3 hover:bg-violet-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0 font-medium" onClick={() => { setNuevoProyecto({...nuevoProyecto, cliente: c.nombre}); setMostrarSugerencias(false); }}>{c.nombre}</div>))}{clientes.filter(c => c.nombre.toLowerCase().includes(nuevoProyecto.cliente.toLowerCase())).length === 0 && (<div className="p-3 text-xs text-slate-400 italic bg-slate-50">Presiona Enter para nuevo cliente</div>)}</div> )}
              </div>
              <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-400 uppercase">Estado</label><select className="border p-2 rounded-lg bg-white outline-violet-500" value={nuevoProyecto.estado} onChange={e => setNuevoProyecto({...nuevoProyecto, estado: e.target.value})}><option value="Borrador">📁 Borrador</option><option value="En Progreso">🎨 En Progreso</option><option value="Finalizado">✅ Finalizado</option><option value="Presentado">🚀 Presentado</option></select></div>
              <div className="md:col-span-4 flex flex-col gap-1"><label className="text-xs font-bold text-slate-400 uppercase">Descripción / Brief</label><textarea className="border p-2 rounded-lg outline-violet-500 w-full h-24 text-sm" placeholder="Describe los requerimientos del proyecto..." value={nuevoProyecto.descripcion} onChange={e => setNuevoProyecto({...nuevoProyecto, descripcion: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Fecha Entrega</label><input type="date" className="w-full border p-2 rounded-lg text-slate-600 text-sm outline-violet-500" value={nuevoProyecto.fechaEntrega} onChange={e=>setNuevoProyecto({...nuevoProyecto, fechaEntrega: e.target.value})} /></div>
              <div className="md:col-span-2"><label className="flex items-center gap-3 cursor-pointer group"><div className="bg-violet-50 hover:bg-violet-100 text-violet-600 px-4 py-2 rounded-xl font-bold text-xs border border-violet-200 transition-all flex items-center gap-2"><span>📂</span><span>Subir Logo Cliente</span></div><span className="text-xs text-slate-400 italic">{archivo ? archivo.name : 'Ningún archivo seleccionado'}</span><input type="file" onChange={e => setArchivo(e.target.files[0])} className="hidden" /></label></div>
              <button className="bg-violet-600 text-white p-2 rounded-lg font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">Guardar</button>
            </form>
            <div className="mb-6"><input type="text" placeholder="🔍 Buscar proyecto..." className="w-full p-3 rounded-xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-violet-200 transition-all" value={busquedaProyectos} onChange={(e) => setBusquedaProyectos(e.target.value)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{proyectosFiltrados.map(p => (<div key={p._id} onClick={() => { setProyectoSeleccionado(p); cargarComentarios(p._id); }} className={`bg-white rounded-xl overflow-hidden border group shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer relative ${p.decision === 'Aprobado' ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'hover:border-violet-300'}`}><div className="h-40 w-full overflow-hidden bg-slate-100 relative group/img bg-cover bg-center" style={{backgroundImage: `url(${obtenerImagen(p) || ''})`}}>{!obtenerImagen(p) && <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🏢</div>}{p.fechaEntrega && <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-1 rounded shadow border border-slate-200 flex items-center gap-1">🕒 {formatearFecha(p.fechaEntrega)}</div>}{p.decision === 'Aprobado' && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">✅ APROBADO</div>}{p.decision === 'Rechazado' && <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">❌ RECHAZADO</div>}</div><div className="p-4"><h3 className="font-bold text-lg leading-tight mb-1 text-slate-800">{p.titulo}</h3><p className="text-violet-600 text-sm font-semibold italic">{p.cliente}</p><div className="flex justify-between items-center mt-4 border-t pt-3"><label className="cursor-pointer bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border border-slate-200 flex items-center gap-1" onClick={e=>e.stopPropagation()}>⬆️ Subir Versión<input type="file" className="hidden" onChange={(e) => subirVersionRapida(e, p._id)}/></label><button onClick={(e) => eliminarProyecto(p._id, e)} className="text-red-400 hover:text-red-600 text-xs font-bold z-10 hover:underline">ELIMINAR</button></div></div></div>))}</div>
          </div>
        )}

        {vista === 'clientes' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-6 text-neutral-800">Directorio de Clientes</h2>
            <form onSubmit={enviarCliente} className="bg-white p-6 rounded-2xl border mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm"><input placeholder="Nombre" className="border p-2 rounded-lg outline-violet-500" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} required /><input placeholder="Email" className="border p-2 rounded-lg outline-violet-500" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} required /><input placeholder="Empresa" className="border p-2 rounded-lg outline-violet-500" value={nuevoCliente.empresa} onChange={e => setNuevoCliente({...nuevoCliente, empresa: e.target.value})} /><input placeholder="Teléfono" className="border p-2 rounded-lg outline-violet-500" value={nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} /><button className="bg-emerald-600 text-white p-2 rounded-lg font-bold lg:col-span-4 hover:bg-emerald-700 shadow-md">Registrar Cliente</button></form>
            <div className="mb-6"><input type="text" placeholder="🔍 Buscar cliente..." className="w-full p-3 rounded-xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-violet-200 transition-all" value={busquedaClientes} onChange={(e) => setBusquedaClientes(e.target.value)} /></div>
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-widest"><tr><th className="p-4">Cliente</th><th className="p-4 text-center">Proyectos</th><th className="p-4">Contacto</th></tr></thead>
                    <tbody>
                        {clientesFiltrados.map(c => { 
                            const numProyectos = proyectos.filter(p => p.cliente === c.nombre).length; 
                            return (
                                <tr key={c._id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="p-4"><div className="font-bold text-slate-800">{c.nombre}</div><div className="text-xs text-slate-400 font-medium">{c.empresa || 'Freelance'}</div></td>
                                    <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${numProyectos > 0 ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'}`}>{numProyectos}</span></td>
                                    <td className="p-4 flex justify-between items-center">
                                        <div><div className="text-sm font-medium text-slate-600">{c.email}</div>{c.telefono && (<a href={`https://wa.me/${c.telefono.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 mt-1"><span>🟢 WhatsApp</span></a>)}</div>
                                        {/* BOTÓN ELIMINAR AÑADIDO */}
                                        <button onClick={() => eliminarCliente(c._id)} className="text-red-400 hover:text-red-600 text-xs font-bold ml-4 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-all">🗑️ Eliminar</button>
                                    </td>
                                </tr>
                            ); 
                        })}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* ... (Resto del código de recursos y modal igual que antes) ... */}
        {vista === 'recursos' && (<div className="animate-in fade-in duration-500"><h2 className="text-3xl font-bold mb-6 text-neutral-800">Biblioteca de Recursos</h2><div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm"><form onSubmit={subirRecurso} className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full"><label className="text-xs font-bold text-slate-400 uppercase">Nombre del Archivo</label><input className="w-full border p-2 rounded-lg outline-violet-500" value={nuevoRecurso.nombre} onChange={e => setNuevoRecurso({...nuevoRecurso, nombre: e.target.value})} required placeholder="Ej. Manual de Marca" /></div><div><label className="text-xs font-bold text-slate-400 uppercase">Categoría</label><select className="border p-2 rounded-lg bg-white outline-violet-500" value={nuevoRecurso.categoria} onChange={e => setNuevoRecurso({...nuevoRecurso, categoria: e.target.value})}><option>Branding</option><option>Legal</option><option>Plantillas</option><option>Otros</option></select></div><label className="flex items-center gap-3 cursor-pointer group min-w-[140px]"><div className="bg-violet-50 hover:bg-violet-100 text-violet-600 px-4 py-2 rounded-xl font-bold text-xs border border-violet-200 transition-all flex items-center gap-2 w-full justify-center"><span>📤</span><span>Elegir</span></div><input type="file" onChange={e => setArchivoRecurso(e.target.files[0])} className="hidden" required /></label><button className="bg-violet-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-violet-700 shadow-lg shadow-violet-200">Subir</button></form>{archivoRecurso && <div className="text-xs text-emerald-500 font-bold mt-2 ml-1 animate-in fade-in">✅ {archivoRecurso.name}</div>}</div><div className="flex gap-2 mb-6 overflow-x-auto pb-2">{['Todos', 'Branding', 'Legal', 'Plantillas', 'Otros'].map(cat => (<button key={cat} onClick={() => setFiltroRecursos(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filtroRecursos === cat ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>{cat}</button>))}</div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{recursosFiltrados.map(r => (<div key={r._id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition group relative"><div className="h-24 bg-slate-50 rounded-lg flex items-center justify-center mb-3 text-4xl text-slate-300">{r.url.endsWith('pdf') ? '📄' : (r.url.match(/(jpg|jpeg|png|gif)$/i) ? <img src={r.url} className="h-full w-full object-contain" alt="" /> : '📦')}</div><h4 className="font-bold text-sm truncate text-slate-800" title={r.nombre}>{r.nombre}</h4><p className="text-[10px] text-slate-400 uppercase font-bold mb-3">{r.categoria}</p><div className="flex gap-2"><a href={r.url} target="_blank" rel="noreferrer" className="flex-1 bg-violet-50 text-violet-600 text-center py-1.5 rounded text-xs font-bold hover:bg-violet-100 transition-colors">Descargar</a><button onClick={() => eliminarRecurso(r._id)} className="text-slate-300 hover:text-red-500 text-lg transition-colors">🗑️</button></div></div>))}</div>{recursosFiltrados.length === 0 && <div className="text-center py-10"><p className="text-slate-300 text-4xl mb-2">📂</p><p className="text-slate-400 text-sm">Carpeta vacía.</p></div>}</div>)}
      </main>

      {proyectoSeleccionado && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setProyectoSeleccionado(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50"><div><h2 className="text-xl font-bold text-slate-800">{proyectoSeleccionado.titulo}</h2><div className="flex items-center gap-2 mt-1"><span className="text-sm text-violet-600 font-semibold">{proyectoSeleccionado.cliente}</span><span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{(proyectoSeleccionado.versiones || []).length} Archivos</span></div></div><div className="flex gap-2"><button onClick={() => window.open(`/presentacion/${proyectoSeleccionado._id}`, '_blank')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">🔗 Link Cliente</button><button onClick={() => setProyectoSeleccionado(null)} className="text-slate-400 hover:text-red-500 text-2xl transition-colors">&times;</button></div></div>
            <div className="flex-1 overflow-y-auto p-6 bg-white scrollbar-thin">
                {proyectoSeleccionado.fechaEntrega && (<div className="bg-violet-50 border border-violet-100 p-3 rounded-lg mb-6 flex items-center gap-3"><span className="text-2xl">📅</span><div><div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Fecha Límite</div><div className="text-sm font-bold text-violet-900">{formatearFecha(proyectoSeleccionado.fechaEntrega)}</div></div></div>)}
                {proyectoSeleccionado.descripcion && <div className="bg-slate-50 border-b border-slate-200 p-4 mb-4 rounded-xl"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción del Proyecto</h4><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{proyectoSeleccionado.descripcion}</p></div>}
                <div className="bg-slate-50 border-b border-slate-200 p-4 mb-4 rounded-xl"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Estadísticas</h4><div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><div className="flex gap-4"><span className="flex items-center gap-1">👍 <b>{proyectoSeleccionado.reacciones?.like || 0}</b></span><span className="flex items-center gap-1">❤️ <b>{proyectoSeleccionado.reacciones?.love || 0}</b></span><span className="flex items-center gap-1">👎 <b>{proyectoSeleccionado.reacciones?.fire || 0}</b></span></div><span className={`text-xs font-bold uppercase ${proyectoSeleccionado.decision === 'Aprobado' ? 'text-emerald-500' : proyectoSeleccionado.decision === 'Rechazado' ? 'text-red-500' : 'text-slate-400'}`}>{proyectoSeleccionado.decision}</span></div></div>
                <div className="bg-slate-100 rounded-xl overflow-hidden border flex justify-center items-center min-h-[300px] mb-4 bg-grid-slate-200">{imagenVisualizada ? <img src={imagenVisualizada} className="max-h-96 object-contain shadow-lg" alt="" /> : <span className="text-slate-400">Sin imágenes</span>}</div>
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center mb-2"><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archivos / Versiones</h4><label className="cursor-pointer bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1">➕ Nueva Versión<input type="file" className="hidden" onChange={(e) => subirVersionRapida(e, proyectoSeleccionado._id)}/></label></div>
                    {Object.keys(archivosAgrupados).length > 0 ? Object.keys(archivosAgrupados).map((nombre, i) => (<TarjetaArchivoAgrupado key={i} nombre={nombre} archivos={archivosAgrupados[nombre]} proyecto={proyectoSeleccionado}/>)) : <div className="text-slate-500 text-sm italic p-4 text-center">Sin archivos</div>}
                    {proyectoSeleccionado.archivos && Array.isArray(proyectoSeleccionado.archivos) && proyectoSeleccionado.archivos.map((a, i) => (<div key={`a-${i}`} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors opacity-70"><div className="flex items-center gap-3"><div className="text-xl">📁</div><div><div className="text-xs font-bold text-slate-700">Archivo Anterior {i+1}</div><div className="text-[9px] text-slate-400">Legacy</div></div></div><a href={a} target="_blank" rel="noreferrer" className="text-xs text-violet-600 font-bold hover:underline">Abrir</a></div>))}
                </div>
                <div className="flex gap-4 border-b border-slate-200 mb-4 mt-6"><button onClick={() => setTabChat('interno')} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${tabChat === 'interno' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>🔒 Equipo Interno</button><button onClick={() => setTabChat('cliente')} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${tabChat === 'cliente' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>🌍 Chat con Cliente</button></div>
                <div className="space-y-3 min-h-[100px]">{comentariosFiltrados.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No hay mensajes en este canal.</p>}{comentariosFiltrados.map(c => (<div key={c._id} className={`text-sm p-3 rounded-lg border flex gap-2 ${tabChat === 'interno' ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50/50 border-emerald-100'}`}><span className={`font-bold text-xs ${tabChat === 'interno' ? 'text-violet-600' : 'text-emerald-600'}`}>{c.usuario}:</span><span className="text-slate-700">{c.texto}</span></div>))}</div>
            </div>
            <form onSubmit={enviarComentario} className={`p-4 border-t flex gap-2 ${tabChat === 'interno' ? 'bg-slate-50' : 'bg-emerald-50/30'}`}><input className="flex-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all bg-white" placeholder={`Escribir en ${tabChat === 'interno' ? 'Equipo Privado' : 'Chat Público'}...`} value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} /><button className={`text-white px-4 rounded-lg font-bold text-xs transition-colors ${tabChat === 'interno' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Enviar</button></form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const handleLogin = (u) => { setIsAuthenticated(true); setUsuario(u); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); setIsAuthenticated(false); setUsuario(null); };
  return (
    <Routes>
      <Route path="/" element={ isAuthenticated ? <PanelAdmin onLogout={handleLogout} usuario={usuario} /> : <AuthPage onLogin={handleLogin} /> } />
      <Route path="/presentacion/:id" element={<VistaCliente />} />
    </Routes>
  );
}

export default App;