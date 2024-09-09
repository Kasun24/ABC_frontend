export type QueryListingType = {
  id: number;
  customer_id: number | string;
  subject: string;
  message: string;
  status: string;
  user_id: number | string;
  response: string;
  customer_email?: string;
  user_name?: string;
};
