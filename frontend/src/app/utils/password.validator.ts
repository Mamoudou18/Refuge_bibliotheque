import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if(!value) return null;

        const valid =
            value.length >= 10 &&
            /[a-z]/.test(value) &&
            /[A-Z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[^a-zA-Z0-9]/.test(value);
        
        return valid ? null : { passwordStrength: true};

    };
}