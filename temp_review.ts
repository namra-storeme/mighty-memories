
export async function deleteReview(reviewId: string) {
  try {
    const db = getDb();
    await db.ref(`reviews/${reviewId}`).remove();
    revalidatePath("/mightymemoriesadmin/reviews");
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting review:", error);
  }
}
