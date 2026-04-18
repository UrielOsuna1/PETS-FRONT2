import { Component, OnInit, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TopMenuComponent } from './components/top-menu/top-menu.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  standalone: true,
  imports: [RouterOutlet, TopMenuComponent, AlertComponent, CommonModule, MatIconModule],
})
export class MainLayoutComponent implements OnInit {
  successMessage: string = '';
  private platformId = inject(PLATFORM_ID);

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // verificar si hay mensaje de login exitoso
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);

        // limpiar URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });

    // Inicializar funcionalidad del botón de scroll solo en browser
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollButton();
    }
  }

  initScrollButton() {
    const scrollButton = document.querySelector('.btn-scroll-top') as HTMLElement;
    if (scrollButton) {
      // Mostrar/ocultar botón según el scroll
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          scrollButton.classList.remove('fade');
          scrollButton.classList.add('show');
        } else {
          scrollButton.classList.remove('show');
          scrollButton.classList.add('fade');
        }
      });

      // Funcionalidad de scroll hacia arriba
      scrollButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
}
