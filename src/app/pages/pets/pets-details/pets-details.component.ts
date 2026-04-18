import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

export interface AdoptionRequest {
  id: string;
  pet_id: string;
  user_id: string;
  message: string;
  status_id: string;
  status: { name: 'Pendiente' | 'Aprobada' | 'Rechazada' };
  created_at: string;
  pet?: Pet;
}

export const mockPets: Pet[] = [
  {
    id: '1', name: 'Luna', species: 'Perro', breed: 'Golden Retriever',
    age_years: 2, size: 'Grande', gender: 'Hembra',
    description: 'Luna es una perrita juguetona y cariñosa que adora estar con personas. Es muy activa y le encanta correr y jugar. Perfecta para familias activas con espacio.',
    status_id: 'disponible', status: { id: '1', name: 'Disponible' },
    created_at: '2025-01-20T10:00:00Z',
    images: [
      { id: '1', pet_id: '1', image_url: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800', is_primary: true },
      { id: '2', pet_id: '1', image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800', is_primary: false }
    ]
  },
  {
    id: '2', name: 'Max', species: 'Gato', breed: 'Europeo',
    age_years: 1, size: 'Mediano', gender: 'Macho',
    description: 'Max es un gato tranquilo y afectuoso. Le gusta dormir en lugares cálidos y jugar con juguetes. Es independiente pero también disfruta de las caricias.',
    status_id: 'disponible', status: { id: '1', name: 'Disponible' },
    created_at: '2025-02-01T14:20:00Z',
    images: [
      { id: '3', pet_id: '2', image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', is_primary: true }
    ]
  },
  {
    id: '3', name: 'Rocky', species: 'Perro', breed: 'Labrador',
    age_years: 3, size: 'Grande', gender: 'Macho',
    description: 'Rocky es un perro leal y protector. Ha sido entrenado y responde bien a comandos básicos. Ideal para hogares con experiencia con perros grandes.',
    status_id: 'reservado', status: { id: '2', name: 'Reservado' },
    created_at: '2025-02-15T09:30:00Z',
    images: [
      { id: '5', pet_id: '3', image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', is_primary: true }
    ]
  },
  {
    id: '4', name: 'Mimi', species: 'Gato', breed: 'Persa',
    age_years: 4, size: 'Pequeño', gender: 'Hembra',
    description: 'Mimi es una gatita elegante y tranquila. Le gusta estar en ambientes relajados y adora que le cepillen su pelaje. Perfecta para apartamentos.',
    status_id: 'disponible', status: { id: '1', name: 'Disponible' },
    created_at: '2025-02-20T11:00:00Z',
    images: [
      { id: '6', pet_id: '4', image_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', is_primary: true }
    ]
  }
];

export const mockAdoptionRequests: AdoptionRequest[] = [];

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pets-details.component.html',
  styleUrls: ['./pets-details.component.css']
})
export class PetsDetailsComponent implements OnInit {

  pet: Pet | undefined;
  similarPets: Pet[] = [];
  currentImageIndex = 0;
  showAdoptionModal = false;
  showSuccessMessage = false;
  adoptionMessage = '';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.pet = mockPets.find(p => p.id === id);
      if (this.pet) {
        this.similarPets = mockPets
          .filter(p => p.species === this.pet!.species && p.id !== this.pet!.id && p.status.name === 'Disponible')
          .slice(0, 3);
      }
      this.currentImageIndex = 0;
    });
  }

  setImageIndex(index: number): void {
    this.currentImageIndex = index;
  }

  getPrimaryImage(pet: Pet): string {
    const primary = pet.images.find(img => img.is_primary);
    return primary?.image_url || pet.images[0]?.image_url || '';
  }

  getAgeLabel(pet: Pet): string {
    if (!pet.age_years) return 'Edad desconocida';
    return `${pet.age_years} ${pet.age_years === 1 ? 'año' : 'años'}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Disponible': return 'badge--sage';
      case 'Reservado': return 'badge--accent';
      case 'Adoptado': return 'badge--terracotta';
      default: return 'badge--muted';
    }
  }

  openAdoptionModal(): void {
    this.showAdoptionModal = true;
  }

  closeAdoptionModal(): void {
    this.showAdoptionModal = false;
    this.adoptionMessage = '';
  }

  submitAdoption(): void {
    if (!this.adoptionMessage.trim()) {
      alert(`Por favor, cuéntanos por qué quieres adoptar a ${this.pet?.name}`);
      return;
    }

    const newRequest: AdoptionRequest = {
      id: String(mockAdoptionRequests.length + 1),
      pet_id: this.pet!.id,
      user_id: '1',
      message: this.adoptionMessage,
      status_id: 'pendiente',
      status: { name: 'Pendiente' },
      created_at: new Date().toISOString(),
      pet: this.pet
    };

    mockAdoptionRequests.push(newRequest);
    this.closeAdoptionModal();
    this.showSuccessMessage = true;
    setTimeout(() => { this.showSuccessMessage = false; }, 5000);
  }
}
