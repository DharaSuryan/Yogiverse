export interface Location {
  id: string;
  name: string;
  states?: Location[];
  cities?: Location[];
}

export interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  profile_image?: string;
}
