import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { uid } from "./utils";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const PUBLIC_PREFIX = "/uploads";

export type UploadResult = {
  url: string;
  thumbnail: string;
  width: number;
  height: number;
};

export async function saveImage(
  buffer: Buffer,
  coupleId: string
): Promise<UploadResult> {
  const dir = path.join(UPLOAD_DIR, coupleId);
  await mkdir(dir, { recursive: true });

  const id = uid();
  const filename = `${id}.webp`;
  const thumbName = `${id}.thumb.webp`;
  const filepath = path.join(dir, filename);
  const thumbpath = path.join(dir, thumbName);

  // 主图：webp 压缩，最大 2000px，质量 85
  const main = sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 });
  const mainBuf = await main.toBuffer({ resolveWithObject: true });
  await writeFile(filepath, mainBuf.data);

  // 缩略图：500px，质量 75
  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 500, height: 500, fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();
  await writeFile(thumbpath, thumb);

  return {
    url: `${PUBLIC_PREFIX}/${coupleId}/${filename}`,
    thumbnail: `${PUBLIC_PREFIX}/${coupleId}/${thumbName}`,
    width: mainBuf.info.width,
    height: mainBuf.info.height,
  };
}
