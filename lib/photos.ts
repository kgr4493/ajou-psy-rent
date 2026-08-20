import { bucket } from "./firebase-admin";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function savePhoto(file: File, prefix: string): Promise<string> {
  if (!file || file.size === 0) throw new Error("사진을 첨부해 주세요.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("사진 용량은 12MB 이하만 가능합니다.");

  const type = file.type || "image/jpeg";
  if (!ALLOWED_TYPES.has(type) && !type.startsWith("image/"))
    throw new Error("이미지 파일만 업로드할 수 있습니다.");

  const ext =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const filename = `uploads/${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileRef = bucket().file(filename);

  await fileRef.save(buffer, {
    metadata: { contentType: type },
  });

  // 공개 읽기 허용
  await fileRef.makePublic();

  return fileRef.publicUrl();
}
