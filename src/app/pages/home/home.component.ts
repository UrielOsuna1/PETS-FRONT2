import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Subscription, filter } from 'rxjs';

export interface PetStatus {
  id: string;
  name: 'Disponible' | 'Reservado' | 'Adoptado' | 'En tratamiento';
}

export interface PetImage {
  id: string;
  pet_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Pet {
  id: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  age_years?: number;
  size: 'Pequeño' | 'Mediano' | 'Grande';
  gender: 'Macho' | 'Hembra';
  description: string;
  status_id: string;
  status: PetStatus;
  created_at: string;
  images: PetImage[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredPets: Pet[] = [
    {
      id: '1',
      name: 'Luna',
      species: 'Perro',
      breed: 'Golden Retriever',
      age_years: 2,
      size: 'Grande',
      gender: 'Hembra',
      description: 'Luna es una perrita juguetona y cariñosa que adora estar con personas. Es muy activa y le encanta correr y jugar. Perfecta para familias activas con espacio.',
      status_id: '1',
      status: { id: '1', name: 'Disponible' },
      created_at: '2025-01-20T10:00:00Z',
      images: [
        { id: '1', pet_id: '1', image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400', is_primary: true },
        { id: '2', pet_id: '1', image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', is_primary: false }
      ]
    },
    {
      id: '2',
      name: 'Max',
      species: 'Gato',
      breed: 'Europeo',
      age_years: 1,
      size: 'Mediano',
      gender: 'Macho',
      description: 'Max es un gato tranquilo y afectuoso. Le gusta dormir en lugares cálidos y jugar con juguetes. Es independiente pero también disfruta de las caricias.',
      status_id: '1',
      status: { id: '1', name: 'Disponible' },
      created_at: '2025-02-01T14:20:00Z',
      images: [
        { id: '3', pet_id: '2', image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400', is_primary: true }
      ]
    },
    {
      id: '3',
      name: 'Rocky',
      species: 'Perro',
      breed: 'Labrador',
      age_years: 3,
      size: 'Grande',
      gender: 'Macho',
      description: 'Rocky es un perro leal y protector. Ha sido entrenado y responde bien a comandos básicos. Ideal para hogares con experiencia con perros grandes.',
      status_id: '2',
      status: { id: '2', name: 'Reservado' },
      created_at: '2025-02-15T09:30:00Z',
      images: [
        { id: '5', pet_id: '3', image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', is_primary: true }
      ]
    }
  ];

  private fragmentSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Listen to navigation events to handle returning to home
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Scroll to top when navigating to home
        if (event.urlAfterRedirects === '/main/home' || event.urlAfterRedirects.startsWith('/main/home')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

    // Single subscription to handle fragments
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          this.scrollToElement(fragment);
        }, 300);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
      this.fragmentSubscription = null;
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }

  scrollToElement(elementId: string): void {
    if (!elementId) return;

    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  getPrimaryImage(pet: Pet): string {
    const primary = pet.images.find(img => img.is_primary);
    return primary?.image_url || pet.images[0]?.image_url || '';
  }

  getAgeLabel(pet: Pet): string {
    if (!pet.age_years) return 'Edad desconocida';
    return `${pet.age_years} ${pet.age_years === 1 ? 'año' : 'años'}`;
  }
}
