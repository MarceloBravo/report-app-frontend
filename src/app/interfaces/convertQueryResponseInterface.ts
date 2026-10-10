export interface ConvertQueryResponseInterface {
  consultaId: string;
  tenantId: string;
  usuarioId: string;
  preguntaUsuario: string;
  querySqlGenerada: string;
  fechaConsulta: string;
  exitosa: boolean;
  registrosCount: number;
  dbConnectionId: string;
  consultasEnPeriodo: number;
  data: Record<string, string>[];
}