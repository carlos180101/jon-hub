"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { verificarPassword } from "./actions";
import { Users, FileText, Activity, Search, LogOut, PlusCircle, Calendar, Printer, ShieldCheck, Download, HeartPulse, Stethoscope, Clock, CheckCircle, Trash2, Edit3, Save, Moon, Globe, BrainCircuit } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

export default function ClinicaApp() {
  const [vista, setVista] = useState<"landing" | "login" | "admin">("landing");
  const [password, setPassword] = useState("");
  const [menu, setMenu] = useState("dashboard");
  
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [citas, setCitas] = useState<any[]>([]);
  
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState("");
  const [recetaActiva, setRecetaActiva] = useState<any>(null);
  const [busquedaExp, setBusquedaExp] = useState("");
  const [busquedaCons, setBusquedaCons] = useState("");
  const [editandoPaciente, setEditandoPaciente] = useState<any>(null);

  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("es");
  const [cargandoIA, setCargandoIA] = useState(false);
  const [sugerenciaIA, setSugerenciaIA] = useState("");

  const bgMain = theme === "dark" ? "bg-[#0f172a] text-slate-100" : "bg-slate-100 text-slate-800";
  const bgCard = theme === "dark" ? "bg-[#1e293b] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800";
  const inputClass = theme === "dark" ? "w-full bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-blue-500" : "w-full bg-slate-50 border border-slate-300 p-3 rounded-xl text-slate-800 outline-none focus:border-blue-500";

  useEffect(() => {
    if (vista === "admin") cargarDatos();
  }, [vista]);

  const cargarDatos = async () => {
    const p = await supabase.from("pacientes").select("*").order("id", { ascending: false });
    const c = await supabase.from("consultas").select("*").order("fecha", { ascending: false });
    const a = await supabase.from("citas").select("*").order("fecha_cita", { ascending: true });
    if (p.data) setPacientes(p.data);
    if (c.data) setConsultas(c.data);
    if (a.data) setCitas(a.data);
  };

  const procesarLogin = async (e: any) => {
    e.preventDefault();
    const esCorrecta = await verificarPassword(password);
    if (esCorrecta) { setVista("admin"); setPassword(""); } 
    else alert("❌ Contraseña incorrecta.");
  };

  const borrarPaciente = async (id: number) => {
    if (window.confirm("⚠️ ¿Borrar paciente y todo su historial?")) {
      await supabase.from("citas").delete().eq("paciente_id", id);
      await supabase.from("consultas").delete().eq("paciente_id", id);
      await supabase.from("pacientes").delete().eq("id", id);
      cargarDatos();
    }
  };

  const borrarConsulta = async (id: number) => {
    if (window.confirm("⚠️ ¿Borrar esta consulta?")) {
      await supabase.from("consultas").delete().eq("id", id); cargarDatos();
    }
  };

  const borrarCita = async (id: number) => {
    if (window.confirm("⚠️ ¿Borrar cita?")) {
      await supabase.from("citas").delete().eq("id", id); cargarDatos();
    }
  };

  const esAlertaSigno = (tipo: string, valor: any) => {
    if (!valor || valor === "-") return false;
    const v = parseFloat(valor);
    if (isNaN(v)) return false;
    switch (tipo) {
      case "bpm": return v > 100 || v < 50;
      case "temp": return v >= 38.0 || v < 35.0;
      case "spo2": return v < 92;
      default: return false;
    }
  };

  const consultarIA = async () => {
    const diag = (document.getElementById("diag_input") as HTMLTextAreaElement)?.value;
    if (!diag) return alert("Escribe un diagnóstico previo.");
    setCargandoIA(true);
    try {
      const res = await fetch(`https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(diag)}&utf8=&format=json&origin=*`);
      const data = await res.json();
      if (data.query.search.length > 0) {
        setSugerenciaIA(`🤖 ANÁLISIS DE IA:\n\nSugerencia Médica Base:\n${data.query.search[0].snippet.replace(/(<([^>]+)>)/gi, "")}...\n\nRecomendaciones: Reposo e hidratación.`);
      } else setSugerenciaIA("🤖 IA: No se encontraron patrones exactos.");
    } catch (e) { setSugerenciaIA("Error al conectar con IA."); }
    setCargandoIA(false);
  };

  const dataSexo = [
    { name: "Masculinos", value: pacientes.filter((p: any) => p.sexo === "Masculino").length },
    { name: "Femeninos", value: pacientes.filter((p: any) => p.sexo === "Femenino").length }
  ];
  const COLORS_PIE = ["#3b82f6", "#ec4899"];

  const consultasPorMes = consultas.reduce((acc: any, curr: any) => {
    if(!curr.fecha) return acc;
    const mes = curr.fecha.substring(0, 7);
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});
  const dataGraficoLineas = Object.keys(consultasPorMes).sort().map((key: any) => ({
    name: key, Consultas: consultasPorMes[key]
  }));

  if (recetaActiva) {
    const pac = pacientes.find((p: any) => p.id === recetaActiva.paciente_id);
    return (
      <div className="bg-white min-h-screen p-8 text-black">
        <style>{`@media print { .no-print { display: none !important; } }`}</style>
        <div className="max-w-3xl mx-auto border-2 border-slate-800 p-10 rounded-2xl relative bg-white">
          <div className="flex justify-between border-b-4 border-blue-900 pb-6 mb-6">
            <div className="flex items-center"><Activity className="text-blue-900 mr-4" size={50} /><div><h1 className="text-4xl font-black text-blue-900">Dr. Carlos Alvanez</h1></div></div>
            <div className="text-right"><p className="font-bold text-slate-500">FECHA</p><p className="text-xl font-bold">{new Date(recetaActiva.fecha).toLocaleDateString()}</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 mb-8">
            <div><span className="text-xs font-bold text-slate-500 block">Paciente</span><span className="font-bold">{pac?.nombre}</span></div>
            <div><span className="text-xs font-bold text-slate-500 block">Edad</span><span className="font-bold">{pac?.edad} años</span></div>
            <div><span className="text-xs font-bold text-slate-500 block">Peso</span><span className="font-bold">{recetaActiva.peso} kg</span></div>
            <div><span className="text-xs font-bold text-slate-500 block">Presión</span><span className="font-bold">{recetaActiva.presion}</span></div>
          </div>
          <div className="min-h-[400px]"><h2 className="text-4xl font-black text-blue-900 mb-6 border-b pb-4">Rx.</h2><p className="whitespace-pre-wrap text-lg">{recetaActiva.receta}</p></div>
          <div className="mt-12 text-center flex flex-col items-center"><div className="w-72 border-b-2 border-slate-800 mb-2"></div><p className="font-bold">Firma y Sello Médico</p></div>
        </div>
        <div className="max-w-3xl mx-auto mt-8 flex justify-between no-print"><button onClick={() => setRecetaActiva(null)} className="px-8 py-3 bg-slate-800 text-white rounded-xl">← Volver</button><button onClick={() => window.print()} className="px-8 py-3 bg-blue-600 text-white rounded-xl"><Printer className="mr-2 inline"/> Imprimir PDF</button></div>
      </div>
    );
  }

  if (vista === "landing") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center"><div className="flex items-center text-xl font-black"><Activity className="text-blue-600 mr-2"/> Dr. Alvanez</div><button onClick={() => setVista("login")} className="text-sm font-bold text-blue-600 flex items-center"><ShieldCheck className="mr-1" size={18}/> Acceso Médico</button></header>
        <section className="bg-blue-900 text-white py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div><h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">Tu salud en las mejores manos.</h1><p className="text-lg text-blue-200 mb-8">Atención médica integral, diagnósticos precisos y tratamientos personalizados.</p><button onClick={() => document.getElementById("agendar")?.scrollIntoView()} className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-full font-black">Agendar Cita Ahora</button></div>
            <div className="hidden md:grid grid-cols-2 gap-4"><div className="bg-blue-800/50 p-6 rounded-3xl border border-blue-700/50"><HeartPulse className="text-emerald-400 mb-4" size={40}/><h3 className="font-bold text-xl mb-2">Cardiología</h3></div><div className="bg-blue-800/50 p-6 rounded-3xl border border-blue-700/50 mt-8"><Stethoscope className="text-blue-400 mb-4" size={40}/><h3 className="font-bold text-xl mb-2">Medicina General</h3></div></div>
          </div>
        </section>
        <section id="agendar" className="py-20 px-6 bg-slate-100">
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl">
            <h2 className="text-3xl font-black text-center mb-6">Solicitud de Cita</h2>
            <form onSubmit={async (e: any) => { e.preventDefault(); const fd = new FormData(e.target); const { data: p } = await supabase.from("pacientes").insert([{ nombre: fd.get("nombre"), edad: fd.get("edad"), sexo: fd.get("sexo"), telefono: fd.get("tel") }]).select(); if (p) await supabase.from("citas").insert([{ paciente_id: p[0].id, fecha_cita: fd.get("fecha"), hora_cita: fd.get("hora"), motivo: fd.get("motivo"), estado: "Pendiente" }]); alert("✅ Cita agendada!"); e.target.reset(); }} className="space-y-4">
              <input name="nombre" required placeholder="Nombre Completo" className="w-full border p-3 rounded-lg" />
              <div className="flex gap-4"><input name="edad" type="number" required placeholder="Edad" className="w-1/2 border p-3 rounded-lg" /><select name="sexo" className="w-1/2 border p-3 rounded-lg"><option>Masculino</option><option>Femenino</option></select></div>
              <input name="tel" type="number" required placeholder="Teléfono" className="w-full border p-3 rounded-lg" />
              <div className="flex gap-4"><input name="fecha" type="date" required className="w-1/2 border p-3 rounded-lg" /><input name="hora" type="time" required className="w-1/2 border p-3 rounded-lg" /></div>
              <input name="motivo" required placeholder="Motivo de la Consulta" className="w-full border p-3 rounded-lg" />
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold">Enviar Solicitud</button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  if (vista === "login") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgMain}`}><form onSubmit={procesarLogin} className={`${bgCard} p-10 rounded-3xl w-full max-w-sm`}><ShieldCheck className="mx-auto text-blue-500 mb-6" size={50} /><h1 className="text-2xl font-black text-center mb-6">Acceso Admin</h1><input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} className={`${inputClass} mb-6`} placeholder="Contraseña" /><button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold">Desbloquear</button></form></div>
    );
  }

  return (
    <div className={`flex h-screen ${bgMain}`}>
      <div className={`w-64 p-4 flex flex-col gap-4 border-r ${theme==="dark"?"border-slate-800":"border-slate-200"}`}>
        <div className="text-xl font-black flex items-center mb-8"><Activity className="mr-2 text-blue-500"/> Dr. Alvanez</div>
        <button onClick={() => setMenu("dashboard")} className={`p-3 rounded-xl font-bold flex ${menu==="dashboard"?"bg-blue-600 text-white":"opacity-50"}`}><Activity className="mr-2"/> Dashboard</button>
        <button onClick={() => setMenu("agenda")} className={`p-3 rounded-xl font-bold flex ${menu==="agenda"?"bg-blue-600 text-white":"opacity-50"}`}><Calendar className="mr-2"/> Agenda</button>
        <button onClick={() => setMenu("pacientes")} className={`p-3 rounded-xl font-bold flex ${menu==="pacientes"?"bg-blue-600 text-white":"opacity-50"}`}><Users className="mr-2"/> Pacientes</button>
        <button onClick={() => setMenu("consultas")} className={`p-3 rounded-xl font-bold flex ${menu==="consultas"?"bg-blue-600 text-white":"opacity-50"}`}><PlusCircle className="mr-2"/> Nueva Consulta</button>
        <button onClick={() => setMenu("expedientes")} className={`p-3 rounded-xl font-bold flex ${menu==="expedientes"?"bg-blue-600 text-white":"opacity-50"}`}><FileText className="mr-2"/> Expedientes</button>
        <div className="mt-auto"><button onClick={() => setTheme(theme==="dark"?"light":"dark")} className="p-3 mb-2 w-full text-center border border-slate-700 rounded-xl"><Moon className="inline mr-2"/> Tema</button><button onClick={() => setVista("landing")} className="w-full flex justify-center p-3 text-rose-500 bg-rose-900/10 rounded-xl font-bold"><LogOut className="mr-2"/> Salir</button></div>
      </div>
      <div className="flex-1 p-10 overflow-y-auto">
        {menu === "dashboard" && (
          <div><h2 className="text-3xl font-black mb-8">Dashboard de Gráficos</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className={`${bgCard} p-8 rounded-3xl`}><h3 className="text-sm opacity-50">Pacientes Totales</h3><p className="text-4xl font-black">{pacientes.length}</p></div>
              <div className={`${bgCard} p-8 rounded-3xl`}><h3 className="text-sm opacity-50">Citas Pendientes</h3><p className="text-4xl font-black">{citas.filter((c:any)=>c.estado==="Pendiente").length}</p></div>
              <div className={`${bgCard} p-8 rounded-3xl`}><h3 className="text-sm opacity-50">Consultas Atendidas</h3><p className="text-4xl font-black">{consultas.length}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className={`${bgCard} p-8 rounded-3xl h-96`}><h3 className="font-bold mb-6">Consultas por Mes</h3><ResponsiveContainer><LineChart data={dataGraficoLineas}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><RechartsTooltip/><Line type="monotone" dataKey="Consultas" stroke="#3b82f6" strokeWidth={4}/></LineChart></ResponsiveContainer></div>
              <div className={`${bgCard} p-8 rounded-3xl h-96`}><h3 className="font-bold mb-6">Distribución de Género</h3><ResponsiveContainer><PieChart><Pie data={dataSexo} cx="50%" cy="50%" outerRadius={100} dataKey="value">{dataSexo.map((e:any, i:number)=><Cell key={i} fill={COLORS_PIE[i]}/>)}</Pie><RechartsTooltip/><Legend/></PieChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {menu === "agenda" && (
          <div><h2 className="text-3xl font-black mb-8">Agenda de Citas</h2>
            {citas.filter((c:any)=>c.estado==="Pendiente").length === 0 && <p className="opacity-50">No hay citas.</p>}
            {citas.filter((c:any)=>c.estado==="Pendiente").map((c:any) => {
              const pac = pacientes.find((p:any)=>p.id===c.paciente_id);
              return (<div key={c.id} className={`${bgCard} p-6 mb-4 rounded-2xl flex justify-between items-center`}><div className="font-bold text-xl">{pac?.nombre} <span className="text-sm ml-4 bg-blue-600 text-white px-2 py-1 rounded">📅 {c.fecha_cita} ⏰ {c.hora_cita}</span><p className="text-sm opacity-50 mt-2">Motivo: {c.motivo}</p></div><div className="flex gap-2"><button onClick={()=>borrarCita(c.id)} className="p-3 bg-rose-500/20 text-rose-500 rounded-xl"><Trash2/></button><button onClick={async ()=>{await supabase.from("citas").update({estado:"Completada"}).eq("id",c.id);cargarDatos();}} className="p-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center"><CheckCircle className="mr-2"/> Atendida</button></div></div>)
            })}
          </div>
        )}

        {menu === "pacientes" && (
          <div><h2 className="text-3xl font-black mb-8">Pacientes</h2>
            <form onSubmit={async (e:any)=>{e.preventDefault(); const fd=new FormData(e.target); if(editandoPaciente){await supabase.from("pacientes").update({nombre:fd.get("n"),edad:fd.get("e"),sexo:fd.get("s"),telefono:fd.get("t")}).eq("id",editandoPaciente.id); setEditandoPaciente(null); cargarDatos(); e.target.reset();}else{await supabase.from("pacientes").insert([{nombre:fd.get("n"),edad:fd.get("e"),sexo:fd.get("s"),telefono:fd.get("t")}]); cargarDatos(); e.target.reset();} }} className={`${bgCard} p-6 mb-8 rounded-2xl grid grid-cols-2 gap-4`}><input name="n" defaultValue={editandoPaciente?.nombre} required placeholder="Nombre" className={inputClass}/><input name="e" type="number" defaultValue={editandoPaciente?.edad} required placeholder="Edad" className={inputClass}/><select name="s" defaultValue={editandoPaciente?.sexo} className={inputClass}><option>Masculino</option><option>Femenino</option></select><input name="t" defaultValue={editandoPaciente?.telefono} required placeholder="Teléfono" className={inputClass}/><button className="col-span-2 bg-blue-600 p-4 rounded-xl font-bold text-white">Guardar Paciente</button></form>
            <div className={`${bgCard} p-4 rounded-2xl`}><table className="w-full text-left"><thead><tr><th className="p-2">ID</th><th>Nombre</th><th>Teléfono</th><th>Acciones</th></tr></thead><tbody>{pacientes.map((p:any)=><tr key={p.id} className="border-t border-slate-700"><td className="p-2">#{p.id}</td><td className="font-bold">{p.nombre}</td><td>{p.telefono}</td><td className="flex gap-2"><button onClick={()=>setEditandoPaciente(p)} className="text-blue-500"><Edit3/></button><button onClick={()=>borrarPaciente(p.id)} className="text-rose-500"><Trash2/></button></td></tr>)}</tbody></table></div>
          </div>
        )}

        {menu === "consultas" && (
          <div><h2 className="text-3xl font-black mb-8">Nueva Consulta & IA</h2>
            <form onSubmit={async (e:any)=>{e.preventDefault(); const fd=new FormData(e.target); await supabase.from("consultas").insert([{paciente_id:fd.get("pid"),peso:fd.get("p"),estatura:fd.get("e"),presion:fd.get("pr"),frecuencia_cardiaca:fd.get("f"),temperatura:fd.get("t"),oxigeno:fd.get("o"),diagnostico:fd.get("d"),receta:fd.get("r")}]); cargarDatos(); setBusquedaCons(""); setSugerenciaIA(""); e.target.reset(); alert("✅ Guardado");}} className={`${bgCard} p-8 rounded-3xl space-y-6`}>
              <div className="relative"><Search className="absolute top-3 left-3 opacity-50"/><input placeholder="Buscar Paciente..." value={busquedaCons} onChange={(e: any)=>setBusquedaCons(e.target.value)} className={`${inputClass} pl-10`}/></div>
              {busquedaCons && <div className="max-h-40 overflow-y-auto">{pacientes.filter((p:any)=>p.nombre.toLowerCase().includes(busquedaCons.toLowerCase())).map((p:any)=><div key={p.id} className="p-2 hover:bg-slate-700 cursor-pointer" onClick={()=>{const s=document.getElementById("ps") as HTMLSelectElement; if(s)s.value=p.id; setBusquedaCons(p.nombre);}}>{p.nombre}</div>)}</div>}
              <select id="ps" name="pid" required className={inputClass}><option value="">- Confirmar Paciente -</option>{pacientes.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
              <div className="grid grid-cols-3 gap-4"><input name="p" type="number" step="0.1" placeholder="Peso (kg)" className={inputClass}/><input name="pr" placeholder="Presión (120/80)" className={inputClass}/><input name="t" type="number" step="0.1" placeholder="Temp (°C)" className={inputClass}/><input name="e" type="number" step="0.01" placeholder="Estatura (m)" className={inputClass}/><input name="f" type="number" placeholder="BPM" className={inputClass}/><input name="o" type="number" placeholder="SpO2 (%)" className={inputClass}/></div>
              <div className="flex justify-between items-center"><h3 className="font-bold text-blue-500">Evaluación Clínica</h3><button type="button" onClick={consultarIA} className="bg-purple-600/20 text-purple-400 p-2 rounded flex font-bold"><BrainCircuit className="mr-2"/> Asistente IA</button></div>
              <textarea id="diag_input" name="d" rows={3} placeholder="Diagnóstico..." className={inputClass}></textarea>
              {sugerenciaIA && <div className="bg-purple-900/20 border border-purple-500 p-4 rounded-xl text-purple-300 whitespace-pre-wrap">{sugerenciaIA}</div>}
              <textarea name="r" rows={4} placeholder="Receta Médica..." className={inputClass}></textarea>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold p-4 rounded-xl">Guardar Consulta</button>
            </form>
          </div>
        )}

        {menu === "expedientes" && (
          <div><h2 className="text-3xl font-black mb-8">Expedientes Clínicos</h2>
            <select onChange={(e: any)=>setPacienteSeleccionado(e.target.value)} className={`${inputClass} mb-8 text-xl font-bold`}><option value="">-- Selecciona un Paciente --</option>{pacientes.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select>
            {pacienteSeleccionado && <div className="space-y-6">{consultas.filter((c:any)=>c.paciente_id.toString()===pacienteSeleccionado).map((c:any,i:number)=><div key={c.id} className={`${bgCard} p-8 rounded-3xl relative`}><div className="flex justify-between mb-4 border-b pb-4 border-slate-700"><h4 className="text-2xl font-black text-blue-500">Consulta #{consultas.filter((cx:any)=>cx.paciente_id.toString()===pacienteSeleccionado).length - i}</h4><div className="flex gap-2"><button onClick={()=>setRecetaActiva(c)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Printer className="mr-2"/> Imprimir PDF</button><button onClick={()=>borrarConsulta(c.id)} className="bg-rose-500/20 text-rose-500 p-2 rounded-lg"><Trash2/></button></div></div><div className="grid grid-cols-4 gap-4 mb-6"><div className="bg-slate-800/50 p-4 rounded-xl text-center"><span className="text-xs opacity-50 block">PESO</span><span className="font-bold text-xl">{c.peso} kg</span></div><div className="bg-slate-800/50 p-4 rounded-xl text-center"><span className="text-xs opacity-50 block">PRESIÓN</span><span className="font-bold text-xl">{c.presion}</span></div><div className="bg-slate-800/50 p-4 rounded-xl text-center"><span className="text-xs opacity-50 block">BPM</span><span className="font-bold text-xl">{c.frecuencia_cardiaca}</span></div><div className="bg-slate-800/50 p-4 rounded-xl text-center"><span className="text-xs opacity-50 block">TEMP</span><span className="font-bold text-xl">{c.temperatura}°C</span></div></div><div className="space-y-4"><div><span className="font-bold opacity-50 block text-xs">DIAGNÓSTICO</span><p className="bg-slate-900/50 p-4 rounded-lg">{c.diagnostico}</p></div><div><span className="font-bold opacity-50 block text-xs">RECETA</span><p className="bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-400 p-4 rounded-lg whitespace-pre-wrap">{c.receta}</p></div></div></div>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
