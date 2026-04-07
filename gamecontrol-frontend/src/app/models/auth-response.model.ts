import { Usuario } from "../services/user.service";

export interface AuthResponse {
    user: Usuario;
    token: string;
}
