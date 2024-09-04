export type AssigneeImgType = {
  assigneeName: string;
  assigneeImg: string;
  id: string;
};

export type UserListingType = {
  id: number;
  role_id: number | null;
  branches: any;
  image: any;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  status: string | number;
};
