export type Usuario = {
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereço: string;
  status: number;
  data_inclusao: string;
  data_atualizacao: string;
  promotoras: any;
};

export type UserData = {
  usuarios: {
    [uuid: string]: Usuario;
  };
};
