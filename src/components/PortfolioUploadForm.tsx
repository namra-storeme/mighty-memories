"use client";

import { uploadPortfolioPhoto } from "@/app/mightymemoriesadmin/actions";

export default function PortfolioUploadForm() {
  return (
    <form
      action={uploadPortfolioPhoto}
      onSubmit={(e) => {
        const input = (e.currentTarget as HTMLFormElement).querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        const file = input?.files?.[0];
        if (file && file.size > 50 * 1024 * 1024) {
          e.preventDefault();
          alert(
            `❌ File too large! Your image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 50MB. Please compress the image first.`
          );
        }
      }}
      className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100"
    >
      <input
        type="file"
        name="photo"
        accept="image/jpeg, image/png, image/webp"
        required
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition cursor-pointer"
      />
      <button
        type="submit"
        className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition shrink-0"
      >
        Upload to Gallery
      </button>
    </form>
  );
}
