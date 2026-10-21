/**
 * Usuario público: nunca incluye el hash de la contraseña.
 */
export interface User {
  id: string;
  nombre: string;
  email: string;
  created_at: Date;
}

/**
 * Usuario con el hash de la contraseña, usado únicamente durante el login.
 */
export interface UserWithPassword extends User {
  password_hash: string;
}
