import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pets.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.css'],
})
export class PetsComponent {
  constructor(private route: ActivatedRoute) { }

  hasChildRoute(): boolean {
    return this.route.snapshot.children.length > 0;
  }
}
