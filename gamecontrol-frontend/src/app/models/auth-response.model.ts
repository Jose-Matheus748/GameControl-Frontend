import { User } from "../services/user.service";

export interface AuthResponse {
    user: User;
    token: string;
}
