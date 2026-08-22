import { Storage } from "@google-cloud/storage";

// Lazy initialization — Storage is only created when first needed
let _storage: Storage | null = null;

function getGCSStorage(): Storage {
  if (!_storage) {
    _storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });
  }
  return _storage;
}

export async function uploadToGCS(
  buffer: Buffer,
  folder: string,
  filename: string,
  contentType: string = "image/jpeg"
): Promise<string> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not set in .env");

  const destination = `${folder}/${filename}`;
  const storage = getGCSStorage();
  const file = storage.bucket(bucketName).file(destination);

  // Use .save() instead of streams — returns a proper Promise with full error handling
  await file.save(buffer, {
    contentType,
    resumable: false, // For files under ~5MB — no multipart/resumable protocol
  });

  return `https://storage.googleapis.com/${bucketName}/${destination}`;
}

export async function deleteFromGCS(publicUrl: string): Promise<void> {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not set in .env");

  // URL format: https://storage.googleapis.com/bucket-name/folder/filename
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  if (!publicUrl.startsWith(prefix)) return;

  const filePath = publicUrl.replace(prefix, "");
  const storage = getGCSStorage();
  await storage.bucket(bucketName).file(filePath).delete();
}
