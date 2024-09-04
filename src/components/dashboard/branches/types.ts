export type BranchListingType = {
  id: number;
  name: string;
  gm_id: number | null;
  bill_split: boolean | null | number;
};

export type ApiBranchListingType = {
  id: number;
  name: string;
};
