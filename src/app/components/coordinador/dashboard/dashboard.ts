// @ts-nocheck
import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  ngAfterViewInit() {
    function showStatus(msg, kind='info'){ 
      const sb = document.getElementById('status');
      if(sb) { sb.textContent=msg; sb.className=`status ${kind}`; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
    }

    // Bars chart
    const data = [15, 11, 28, 45, 17, 22, 31, 29, 12];
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

    // Sparkline weekly trend (additional chart)
    const sparkHost = document.getElementById('sparkline');
    const sparkLegend = document.getElementById('spark-legend');
    if (sparkHost){
      const w = sparkHost.clientWidth || 280;
      const hostH = sparkHost.clientHeight || 180;
      const h = Math.max(300, hostH);
      const pad = 6;
      const sData = [12, 9, 14, 18, 16, 22, 19];
      const max = Math.max(...sData);
      const min = Math.min(...sData);
      const stepX = (w - pad*2) / (sData.length - 1);
      const y = (v)=> h - pad - ((v - min) / (max - min || 1)) * (h - pad*2);
      const points = sData.map((v,i)=> [pad + i*stepX, y(v)]);
      const pathD = points.map((p,i)=> (i? 'L':'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      // Area path
      const areaD = `M ${points[0][0].toFixed(1)} ${h-pad} ` +
        points.map(p=> `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') +
        ` L ${points[points.length-1][0].toFixed(1)} ${h-pad} Z`;
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', h.toString());
      // area fill
      const area = document.createElementNS('http://www.w3.org/2000/svg','path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', 'rgba(48,172,50,0.12)');
      area.setAttribute('stroke', 'none');
      svg.appendChild(area);
      // line stroke
      const line = document.createElementNS('http://www.w3.org/2000/svg','path');
      line.setAttribute('d', pathD);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', '#30ac32');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      // min/max markers
      const addDot = (pt, color)=>{
        const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx', pt[0].toFixed(1));
        c.setAttribute('cy', pt[1].toFixed(1));
        c.setAttribute('r', '3');
        c.setAttribute('fill', color);
        c.setAttribute('stroke', '#fff');
        c.setAttribute('stroke-width', '1');
        svg.appendChild(c);
      };
      addDot(points[sData.indexOf(max)], '#15803d');
      addDot(points[sData.indexOf(min)], '#ef4444');
      sparkHost.innerHTML = '';
      sparkHost.appendChild(svg);
      if(sparkLegend){
        sparkLegend.textContent = `Semana actual: min ${min}, max ${max}, total ${sData.reduce((a,b)=>a+b,0)}`;
      }
    }

    const coCalendarMap = {
      '10': 'T-1007', '14': 'T-1008', '16': 'T-1012', '20': 'T-1010', '24': 'T-1011'
    };

    function coGoToTramiteById(tid){
      showStatus('Buscando trámite ' + tid + '...', 'info');
      setTimeout(() => window.location.href = '/coordinacion/solicitudes', 500);
    }

    const coCalendar = document.querySelector('.calendar');
    if(coCalendar){
      coCalendar.addEventListener('click', (e)=>{
        const day = e.target.closest('.day');
        if(!day) return;
        const val = day.textContent.trim();
        const id = coCalendarMap[val];
        if(id){ coGoToTramiteById(id); }
      });
    }

    const coQa = document.getElementById('co-qa');
    if (coQa){
      coQa.addEventListener('click', (e)=>{
        const btn = e.target.closest('.qa-item');
        if(!btn) return;
        const act = btn.getAttribute('data-act');
        if(act === 'new') window.location.href = '/coordinacion/solicitudes';
        else if (act === 'buscar') window.location.href = '/coordinacion/seguimiento';
        else if (act === 'config') window.location.href = '/coordinacion/notificaciones';
        else if (act === 'reportes') window.location.href = '/coordinacion/reportes';
      });
    }
  }
}
