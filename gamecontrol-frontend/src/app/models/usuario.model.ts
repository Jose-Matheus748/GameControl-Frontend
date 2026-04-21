export interface Usuario {
  id: string;
  email: string;
  username: string;
  bio?: string;
  country?: string;
  profilePictureUrl?: string;
  role?: string;
}

export interface CreateUsuarioDTO {
  email: string;
  password: string;
  username: string;
}

export interface UpdateUsuarioDTO {
  username?: string;
  bio?: string;
  country?: string;
  profilePictureUrl?: string;
}
