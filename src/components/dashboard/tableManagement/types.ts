export interface TableDataType {
  id?: number;
  branch_id? : number
  table_number?: number;
  name: string;
  type: "table" | "tableZone";
  elementId: string;
  classes: string[];
  locationX: number;
  locationY: number;
  width: number;
  height: number;
  relatedArea?: string;
  addedTables?: string[];
  color?: string;
}
