import HttpService from "@/app/http/httpService";

const http = new HttpService();
let permissions: number[] | null = null;
let permissionsPromise: Promise<number[]> | null = null;

export const getPermissions = async (): Promise<number[]> => {
  // Check if permissions are already fetched
  if (permissions) {
    return permissions;
  }

  // If permissions are not fetched, fetch them
  if (!permissionsPromise) {
    permissionsPromise = fetchPermissions();
  }

  // Await the permissions fetch
  permissions = await permissionsPromise;
  return permissions;
};

const fetchPermissions = async (): Promise<number[]> => {
  const roleId = localStorage.getItem("role_id");

  if (!roleId) {
    throw new Error(`Role ID not found`);
  }

  const permissionsResponse = await http.get(`getpermission/${roleId}`);
  return permissionsResponse.data.data;
};

// Function to reset permissions
export const resetPermissions = () => {
  permissions = null;
  permissionsPromise = null;
};
