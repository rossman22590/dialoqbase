export interface ChatRequestBody {
  Body: {
    username: string;
    password: string;
  };
}

export interface UpdateUsernameRequestBody {
  Body: {
    username: string;
    email: string;
  };
}

export interface UpdatePasswordRequestBody {
  Body: {
    oldPassword?: string;
    newPassword: string;
  };
}

export interface ForgotPasswordRequestBody {
  Body: {
    email: string;
  };
}

export interface ResetPasswordRequestBody {
  Body: {
    token: string;
    newPassword: string;
  };
}

export interface RegisterUserRequestBody {
  Body: {
    username: string;
    email: string;
    password: string;
  };
}


export interface CreateNewApiKey {
  Body: {
    name: string
  }
}

export interface DeleteApiKey {
  Params: {
    id: number
  }
}