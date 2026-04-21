import { Usuario } from './usuario.model';
export interface AuthResponse {
    user: Usuario;
    token: string;
}
