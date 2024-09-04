import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Img1, Img2, Img3 } from "@/assets/images/products/utils";
import {
  LogHeadersType,
  LogListingType,
  ReviewStatus,
} from "@/components/dashboard/logs/client/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "system-settings",
    disabled: false,
  },
  {
    title: "client-logs",
    disabled: true,
  },
];
export const logHeaders: LogHeadersType[] = [
  {
    title: "Timestamp",
    align: "start",
    sortable: true,
    key: "created_at",
  },
  { title: "Caused by", key: "causer.email" },
  { title: "Subject", key: "subject" },
  { title: "Description", key: "description" },
];
export const logs: LogListingType[] = [
  {
    id: 1,
    log: "16/04/24 11:45:42",
    causedBy: "User123",
    subject: "Employee Records",
    description: "Updated employee records document",
    docData: [
      {
        docFile: Img1,
        oldValues: [
          {
            category: "Personal Information",
            name: "Jane Doe",
            fileType: "PDF",
            fileSize: 512,
            reviewStatus: ReviewStatus.Pending,
            reviewMessage: "Looks good, minor formatting issues addressed",
            uploadedBy: "Admin567",
          },
        ],
        newValues: [
          {
            category: "Personal Information",
            name: "Jane Doe",
            fileType: "PDF",
            fileSize: 512,
            reviewStatus: ReviewStatus.Approved,
            uploadedBy: "User123",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    log: "17/04/24 11:45:42",
    causedBy: "User987",
    subject: "Project Proposal",
    description: "Uploaded new project proposal document",
    docData: [
      {
        docFile: Img2,
        oldValues: [
          {
            category: "Marketing",
            name: "Social Media Campaign Proposal",
            fileType: "Document",
            fileSize: 1024,
            reviewStatus: ReviewStatus.Pending,
            uploadedBy: "User987",
          },
        ],
        newValues: [],
      },
    ],
  },
  {
    id: 3,
    log: "18/04/24 11:45:42",
    causedBy: "Customer123",
    subject: "Product Photo",
    description: "Submitted a new product photo",
    docData: [
      {
        docFile: Img3,
        oldValues: [],
        newValues: [
          {
            category: "Product Images",
            name: "New T-Shirt Photo",
            fileType: "Image",
            fileSize: 2048,
            reviewStatus: ReviewStatus.Approved,
            uploadedBy: "Customer123",
          },
        ],
      },
    ],
  },
];
