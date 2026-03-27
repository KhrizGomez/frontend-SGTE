import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
// Dashboard inicial del coordinador: punto de entrada a acciones frecuentes del modulo.
export class DashboardComponent implements AfterViewInit {
  // Hook reservado para inicializaciones visuales diferidas del dashboard.
  ngAfterViewInit() {
    
  }
}
