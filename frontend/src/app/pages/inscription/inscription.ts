import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { togglePasswordVisibility} from '../../utils/showPassword';
import { passwordStrengthValidator } from '../../utils/password.validator';

@Component({
  selector: 'app-inscription',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        prenom: ['', Validators.required],
        nom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        numero_tel: ['', Validators.required],
        date_naissance: [''],
        mot_de_passe: ['', [Validators.required, passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('mot_de_passe')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  togglePassword(input: HTMLInputElement, icon: HTMLElement): void {
    togglePasswordVisibility(input, icon);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = { ...this.registerForm.value };
    formValue.date_naissance = this.formatDateToFrench(formValue.date_naissance);

    this.authService.inscrireUtilisateur(formValue).subscribe({
      next: () => {
        this.isLoading = false;

        if (this.authService.isAdmin()) {
          this.router.navigate(['/mon-compte'], { queryParams: { section: 'membres' } });
        } else {
          this.router.navigate(['/connexion']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
      }
    });
  }

  private formatDateToFrench(isoDate: string): string {
    if (!isoDate) return '';
    const [annee, mois, jour] = isoDate.split('-');
    return `${jour}/${mois}/${annee}`;
  }
}