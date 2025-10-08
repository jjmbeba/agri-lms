import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  fileUploader: f({
    pdf: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
  })

    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session.userId) {
        throw new UploadThingError("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.userId };
    })
    .onUploadComplete(({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
  videoUploader: f({
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1,
    },
  })

    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session.userId) {
        throw new UploadThingError("Unauthorized");
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.userId };
    })
    .onUploadComplete(({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
  assignmentUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session.userId) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: session.userId };
    })
    .onUploadComplete(({ metadata }) => {
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
