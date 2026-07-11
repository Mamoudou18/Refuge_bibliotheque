export function togglePasswordVisibility(input: HTMLInputElement, icon: HTMLElement): void {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  icon.classList.toggle('bi-eye');
  icon.classList.toggle('bi-eye-slash');
}