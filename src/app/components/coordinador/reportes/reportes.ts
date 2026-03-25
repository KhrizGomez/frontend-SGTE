// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg, kind='info'){ 
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    const flowMap = {
      basico: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Revisión', role:'Coordinador'},
        {name:'Aprobación', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      validacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Validación documental', role:'Coordinador'},
        {name:'Revisión coordinación', role:'Coordinador'},
        {name:'Aprobación decanato', role:'Decano'},
        {name:'Finalizado', role:'Coordinador'}
      ],
      homologacion: [
        {name:'Recepción', role:'Coordinador'},
        {name:'Evaluación de homologación', role:'Coordinador'},
        {name:'Resolución', role:'Decano'},
        {name:'Notificación', role:'Coordinador'},
        {name:'Finalizado', role:'Coordinador'}
      ],
    };

    let casos = [
      { id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En proceso', creado:'2025-09-02', actualizado:'2025-09-04', traza:'validacion', files:[ {name:'Solicitud.pdf', size:'120 KB'}, {name:'HistorialAcademico.pdf', size:'340 KB'} ], steps: flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-02': null, done: idx<1? '2025-09-03': null })), current: 1 },
      { id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'En proceso', creado:'2025-09-01', actualizado:'2025-09-05', traza:'homologacion', files:[ {name:'Programas.pdf', size:'1.2 MB'} ], steps: flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-01': null, done: idx<2? (idx===0? '2025-09-02':'2025-09-04') : null })), current: 2 },
      { id:'C-2103', titulo:'Certificado de matrícula - Carlos Ruiz', estudiante:'Carlos Ruiz', tipo:'Certificados académicos', prioridad:'Media', estado:'En proceso', creado:'2025-09-03', actualizado:'2025-09-03', traza:'basico', files:[ {name:'Comprobante.pdf', size:'85 KB'} ], steps: flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03': null, done: idx<1? '2025-09-03' : null })), current: 1 }
    ];

    let rows = [
      { id: 'T-1001', titulo: 'Homologación de materias', tipo:'Homologación', prioridad:'Alta', estado:'Publicado', fecha:'2025-09-25', traza:'homologacion', custom:[] },
      { id: 'T-1002', titulo: 'Certificados académicos', tipo:'Certificados académicos', prioridad:'Media', estado:'En revisión', fecha:'2025-09-20', traza:'basico', custom:[] },
      { id: 'T-1003', titulo: 'Cambio de carrera', tipo:'Cambio de carrera', prioridad:'Urgente', estado:'Publicado', fecha:'2025-10-05', traza:'validacion', custom:[] },
      { id: 'T-1004', titulo: 'Baja de matrícula parcial', tipo:'Baja de matrícula', prioridad:'Media', estado:'Borrador', fecha:'2025-09-30', traza:'basico', custom:[] },
      { id: 'T-1005', titulo: 'Solicitud de beca institucional', tipo:'Otro', prioridad:'Urgente', estado:'En revisión', fecha:'2025-09-18', traza:'validacion', custom:[] },
      { id: 'T-1006', titulo: 'Actualización de datos personales', tipo:'Otro', prioridad:'Baja', estado:'Publicado', fecha:'2025-10-10', traza:'basico', custom:[] },
    ];

    const repDesde = document.getElementById('rep-desde');
    const repHasta = document.getElementById('rep-hasta');
    const repTipo = document.getElementById('rep-tipo');
    const repPrio = document.getElementById('rep-prio');
    const repEstado = document.getElementById('rep-estado');
    const repQ = document.getElementById('rep-q');
    const repExport = document.getElementById('rep-export');
    const repPrint = document.getElementById('rep-print');
    const repClear = document.getElementById('rep-clear');
    const repTable = document.getElementById('rep-table')?.querySelector('tbody');
    const kpiProm = document.getElementById('kpi-prom');
    const kpiTotal = document.getElementById('kpi-total');
    const kpiRes = document.getElementById('kpi-res');
    const kpiRech = document.getElementById('kpi-rech');
    const kpiSla = document.getElementById('kpi-sla');
    const repBars = document.getElementById('rep-bars');
    const repBarsLabels = document.getElementById('rep-bars-labels');
    const repDonut = document.getElementById('rep-donut');
    const repDonutTotal = document.getElementById('rep-donut-total');
    const info = document.getElementById('rep-info');

    function toDate(s){ return s ? new Date(s+'T00:00:00') : null; }
    function dateInRange(d, from, to){ if(!d) return false; if(from && d < from) return false; if(to && d > to) return false; return true; }
    function durationDays(s,e){ if(!s||!e) return null; return Math.max(0, Math.round((toDate(e)-toDate(s))/(1000*60*60*24))); }

    function getHistory(){
      const hist = [];
      casos.forEach(c => {
        const lastStep = c.steps[c.steps.length-1];
        const resolved = c.estado === 'Finalizado' ? (lastStep?.done || c.actualizado) : null;
        hist.push({
          id: c.id, titulo: c.titulo, tipo: c.tipo, prioridad: c.prioridad,
          estado: c.estado, creado: c.creado, resuelto: resolved,
          dias: durationDays(c.creado, resolved), sla: (c.tipo==='Homologación'? 10 : 5), estudiante: c.estudiante
        });
      });
      rows.slice(0,6).forEach((r,i)=>{
        const creado = '2025-08-'+String(10+i).padStart(2,'0');
        const dias = (r.prioridad==='Urgente'? 2 : r.prioridad==='Alta'? 4 : 6);
        const resuelto = '2025-08-'+String(10+i+dias).padStart(2,'0');
        hist.push({ id: 'H-'+r.id, titulo: r.titulo, estudiante: 'Estudiante '+i, tipo: r.tipo, prioridad: r.prioridad, estado:'Finalizado', creado, resuelto, dias, sla:(r.tipo==='Homologación'?10:5) });
      });
      hist.push({ id:'H-R100', titulo:'Solicitud fuera de plazo', estudiante:'Carlos Solis', tipo:'Otro', prioridad:'Media', estado:'Rechazado', creado:'2025-08-18', resuelto:'2025-08-18', dias:0, sla:5 });
      return hist;
    }

    function applyRepFilters(data){
      const from = repDesde?.value ? toDate(repDesde.value) : null;
      const to = repHasta?.value ? toDate(repHasta.value) : null;
      const t = repTipo?.value || '';
      const p = repPrio?.value || '';
      const e = repEstado?.value || '';
      const q = (repQ?.value || '').trim().toLowerCase();
      return data.filter(d => {
        const dDate = toDate(d.creado);
        if(!dateInRange(dDate, from, to)) return false;
        if(t && d.tipo !== t) return false;
        if(p && d.prioridad !== p) return false;
        if(e && d.estado !== e) return false;
        if(q && !JSON.stringify(d).toLowerCase().includes(q)) return false;
        return true;
      });
    }

    function repaintBars(counts){
      if(!repBars || !repBarsLabels) return;
      repBars.innerHTML=''; repBarsLabels.innerHTML='';
      const labels = Object.keys(counts);
      const data = labels.map(k => counts[k]);
      const max = Math.max(...data, 1);
      data.forEach((v,i)=>{
        const b = document.createElement('div'); b.className='bar'; b.style.height = `${(v/max)*100}%`; repBars.appendChild(b);
        const l = document.createElement('div'); l.textContent = labels[i]; repBarsLabels.appendChild(l);
      });
    }
    function repaintDonut(finalizados, proceso, borrador, rechazados){
      if(!repDonut || !repDonutTotal) return;
      const total = finalizados+proceso+borrador+rechazados;
      const f = total? Math.round((finalizados/total)*100) : 0;
      const p = total? Math.round((proceso/total)*100) : 0;
      const b = total? Math.round((borrador/total)*100) : 0;
      const r = 100 - f - p - b;
      repDonut.style.background = `conic-gradient(
        #10b981 0 ${f}%, 
        #3b82f6 ${f}% ${f+p}%, 
        #f59e0b ${f+p}% ${f+p+b}%,
        #ef4444 ${f+p+b}% 100%
      )`;
      repDonutTotal.textContent = String(total);
    }

    function renderReports(){
      const all = getHistory();
      const data = applyRepFilters(all);
      const total = data.length;
      const finalizados = data.filter(d => d.estado==='Finalizado');
      const procesando = data.filter(d => d.estado==='En proceso' || d.estado==='Borrador' || d.estado==='Publicado' || d.estado==='En revisión');
      const rechazados = data.filter(d => d.estado==='Rechazado');
      const prom = Math.round((finalizados.map(d=>d.dias||0).reduce((a,b)=>a+b,0) / Math.max(finalizados.length,1)) || 0);
      const tasaRes = total? Math.round((finalizados.length/total)*100) : 0;
      const tasaRech = total? Math.round((rechazados.length/total)*100) : 0;
      const slaCumpl = finalizados.length? Math.round((finalizados.filter(d => (d.dias||0) <= d.sla).length / finalizados.length)*100) : 0;
      
      const stats = document.querySelectorAll('.stat__value');
      if(stats[0]) stats[0].textContent = `${prom}d`;
      if(stats[1]) stats[1].textContent = `${tasaRech}%`;
      if(stats[2]) stats[2].textContent = `${tasaRes}%`;
      
      const byType = {};
      data.forEach(d => { byType[d.tipo] = (byType[d.tipo]||0)+1; });
      repaintBars(byType);
      
      repaintDonut(finalizados.length, procesando.length, 0, rechazados.length);
      
      if(repTable){
        repTable.innerHTML = '';
        const limit = 10;
        data.slice(0, limit).forEach(d => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${d.id}</td><td>${d.estudiante}</td><td>${d.tipo}</td><td>${d.creado||'—'}</td><td>${d.estado}</td><td>${d.sla}</td>`;
          repTable.appendChild(tr);
        });
        if(info) info.textContent = `Mostrando ${Math.min(data.length, limit)} de ${data.length}`;
      }
    }

    function exportCSV(){
      const all = getHistory();
      const data = applyRepFilters(all);
      const rowsCsv = [
        ['ID','Estudiante','Tipo','Prioridad','Estado','Creado','Resuelto','Días','SLA']
      ].concat(data.map(d => [d.id,d.estudiante||'',d.tipo,d.prioridad,d.estado,d.creado||'',d.resuelto||'',String(d.dias??''),String(d.sla)]));
      const csv = rowsCsv.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'reportes.csv'; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
    }

    repDesde?.addEventListener('change', renderReports);
    repHasta?.addEventListener('change', renderReports);
    repTipo?.addEventListener('change', renderReports);
    repPrio?.addEventListener('change', renderReports);
    repEstado?.addEventListener('change', renderReports);
    repQ?.addEventListener('input', renderReports);
    repExport?.addEventListener('click', exportCSV);
    const clear = document.getElementById('rep-clear');
    if(clear) clear.addEventListener('click', ()=>{
      if(repDesde) repDesde.value=''; if(repHasta) repHasta.value=''; if(repTipo) repTipo.value=''; if(repPrio) repPrio.value=''; if(repEstado) repEstado.value=''; if(repQ) repQ.value='';
      renderReports();
    });

    renderReports();
  }
}
