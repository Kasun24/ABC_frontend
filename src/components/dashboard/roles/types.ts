/**
 * @description This file contains the types for AssigneeImgType and RoleListingType.
 * AssigneeImgType represents an object containing the name, image, and id of an assignee.
 * RoleListingType represents an object containing the id, level, assignedTo (an array of AssigneeImgType), and rolePermission (an array of strings).
 */

/**
 * @description The type of an AssigneeImgType object.
 * @property {string} assigneeName - The name of the assignee.
 * @property {string} assigneeImg - The image URL of the assignee.
 * @property {string} id - A unique identifier for the assignee.
 */
export type AssigneeImgType = {
  assigneeName: string;
  assigneeImg: string;
  id: string;
};

/**
 * @description The type of a RoleListingType object.
 * @property {number} id - A unique identifier for the role.
 * @property {string} level - The level of the role.
 * @property {AssigneeImgType[]} assignedTo - An array of AssigneeImgType objects representing the assignees of the role.
 * @property {string[]} rolePermission - An array of strings representing the permissions of the role.
 */
export type RoleListingType = {
  id: number;
  dashboard_id: number;
  role_id?: number;
  role: string;
  status: string;
  assignedTo: AssigneeImgType[];
  permissions: number[] | string[];
};
