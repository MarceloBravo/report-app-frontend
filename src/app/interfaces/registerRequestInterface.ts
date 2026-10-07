export interface ClienteInterface {
  nombreEmpresa: string;
  subdominioSlug: string;
}

export interface UsuarioInterface {
  nombre: string;
  email: string;
  password: string;
}

export interface ConexionInterface {
  host: string;
  puerto: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  schemaName: string;
}

export interface RegisterRequestInterface {
  cliente: ClienteInterface;
  usuario: UsuarioInterface;
  conexion: ConexionInterface;
}
