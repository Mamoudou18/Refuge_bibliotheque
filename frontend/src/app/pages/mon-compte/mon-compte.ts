import { Component } from '@angular/core';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.scss',
})
export class MonCompte {
  activeSection: string = 'accueil';
  showSection(section: string): void{
    this.activeSection = section;
  }
}
