// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class EstudianteDashboard implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg: string, kind: string = 'info'){
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    // Bars chart - Solicitudes enviadas por mes
    const data = [8, 11, 1, 12, 5, 7, 2, 4, 6];
    const labels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
    const bars = document.getElementById('bars');
    const lbls = document.getElementById('bars-labels');
    if (bars && lbls){
      const max = Math.max(...data) || 1;
      data.forEach((v,i) => {
        const b = document.createElement('div');
        b.className = 'bar';
        b.style.height = `${(v/max)*100}%`;
        bars.appendChild(b);
        const l = document.createElement('div');
        l.textContent = labels[i];
        lbls.appendChild(l);
      });
    }

    // Calendar deep-link to trámites con fecha límite
    const calendarMap: {[key: string]: string} = {
      '10': 'S-2012', // Certificado de conducta
      '14': 'S-2002', // Homologación de materias
      '16': 'S-2003', // Cambio de carrera
      '20': 'S-2011', // Solicitud de beca
      '24': 'S-2001', // Certificados académicos
    };

    function goToSolicitudById(tid: string){
      showStatus('Abriendo trámite desde el calendario…','info');
      setTimeout(() => window.location.href = '/estudiante/solicitudes', 500);
    }

    const calendar = document.querySelector('.calendar');
    if(calendar){
      calendar.addEventListener('click', (e)=>{
        const day = e.target.closest('.day');
        if(!day) return;
        const val = day.textContent.trim();
        const id = calendarMap[val];
        if(id){ goToSolicitudById(id); }
      });
    }

    // Quick actions
    const qa = document.getElementById('st-qa');
    if (qa){
      qa.addEventListener('click', (e)=>{
        const btn = e.target.closest('.qa-item');
        if(!btn) return;
        const act = btn.getAttribute('data-act');
        if(act === 'new') window.location.href = '/estudiante/solicitudes';
        else if (act === 'ai') window.location.href = '/estudiante/asistente';
        else if (act === 'buscar') window.location.href = '/estudiante/seguimiento';
        else if (act === 'config') window.location.href = '/estudiante/notificaciones';
      });
    }
  }
}
