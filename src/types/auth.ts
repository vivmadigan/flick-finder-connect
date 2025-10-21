export type SignUpDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
};

export type SignInDto = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  displayName: string;
};

export type MyInformationDto = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
};
