export enum ReviewStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export type DocDataType = {
  docFile: string;
  oldValues: ValType[];
  newValues: ValType[];
};

export type ValType = {
  category: string;
  name: string;
  fileType: string;
  fileSize: number;
  reviewStatus?: ReviewStatus;
  reviewMessage?: string;
  uploadedBy: string;
};
export type LogHeadersType = {
  title: string;
  align?: string;
  sortable?: boolean;
  key: string;
};
export type LogListingType = {
  id: number;
  log: string;
  causedBy: string;
  subject: string;
  description: string;
  docData: DocDataType[];
};
