import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { HttpError } from "@/lib/api";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MEDIA_PATH_PREFIX = "public/uploads/";
const PRIVATE_PATH_PREFIX = "storage/";

type DetectedType = { mimeType: string; extension: string };
type StoredUpload = {
  filename: string;
  originalName: string;
  path: string;
  url: string | null;
  mimeType: string;
  sizeBytes: number;
};

type UploadRoots = {
  media: string;
  private: string;
};

function resolveConfiguredRoot(value: string | undefined, fallback: string) {
  const configured = value?.trim();
  return path.resolve(configured || fallback);
}

function isInside(root: string, candidate: string) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export function getUploadRoots(): UploadRoots {
  const roots = {
    media: resolveConfiguredRoot(process.env.MEDIA_UPLOAD_ROOT, path.join(process.cwd(), "public", "uploads")),
    private: resolveConfiguredRoot(process.env.PRIVATE_STORAGE_ROOT, path.join(process.cwd(), "storage")),
  };
  if (isInside(roots.media, roots.private) || isInside(roots.private, roots.media)) {
    throw new HttpError(500, "Las raíces de archivos públicos y privados deben estar separadas.", "INVALID_STORAGE_CONFIGURATION");
  }
  return roots;
}

export function resolveVoucherUploadPath(storedPath: string) {
  const normalized = storedPath.trim().replaceAll("\\", "/");
  const prefixes = [`${PRIVATE_PATH_PREFIX}vouchers/`, "vouchers/"];
  const prefix = prefixes.find((candidate) => normalized.startsWith(candidate));
  if (!prefix) {
    throw new HttpError(409, "Este voucher usa una ubicación anterior no privada. Vuelve a cargarlo.", "LEGACY_VOUCHER_PATH");
  }

  const relativePath = normalized.slice(prefix.length);
  if (!relativePath || path.posix.isAbsolute(relativePath) || relativePath.split("/").includes("..")) {
    throw new HttpError(400, "La ruta privada del voucher no es válida.", "INVALID_UPLOAD_PATH");
  }

  const vouchersRoot = path.resolve(getUploadRoots().private, "vouchers");
  const absolutePath = path.resolve(vouchersRoot, ...relativePath.split("/"));
  if (!isInside(vouchersRoot, absolutePath) || absolutePath === vouchersRoot) {
    throw new HttpError(400, "La ruta privada del voucher no es válida.", "INVALID_UPLOAD_PATH");
  }
  return absolutePath;
}

function detectType(bytes: Uint8Array): DetectedType | null {
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: ".jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: ".png" };
  }
  const header = Buffer.from(bytes.slice(0, 12)).toString("ascii");
  if (header.startsWith("RIFF") && header.slice(8, 12) === "WEBP") {
    return { mimeType: "image/webp", extension: ".webp" };
  }
  if (Buffer.from(bytes.slice(0, 5)).toString("ascii") === "%PDF-") {
    return { mimeType: "application/pdf", extension: ".pdf" };
  }
  return null;
}

export function persistUpload(file: File, namespace: "media"): Promise<StoredUpload & { url: string }>;
export function persistUpload(file: File, namespace: "vouchers"): Promise<StoredUpload & { url: null }>;
export async function persistUpload(file: File, namespace: "media" | "vouchers"): Promise<StoredUpload> {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new HttpError(413, "El archivo debe pesar como máximo 5 MB.", "INVALID_UPLOAD_SIZE");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectType(bytes);
  if (!detected) {
    throw new HttpError(415, "Solo se permiten JPG, PNG, WebP o PDF válidos.", "INVALID_UPLOAD_TYPE");
  }

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const roots = getUploadRoots();
  const uploadsRoot = path.resolve(namespace === "vouchers" ? roots.private : roots.media, namespace);
  const directory = path.resolve(uploadsRoot, year, month);
  if (!isInside(uploadsRoot, directory) || directory === uploadsRoot) {
    throw new HttpError(400, "Ruta de subida inválida.", "INVALID_UPLOAD_PATH");
  }

  await mkdir(directory, { recursive: true, mode: namespace === "vouchers" ? 0o750 : 0o755 });
  const filename = `${randomUUID()}${detected.extension}`;
  const absolutePath = path.join(directory, filename);
  await writeFile(absolutePath, bytes, { flag: "wx", mode: namespace === "vouchers" ? 0o600 : 0o644 });
  const relativeUrl = namespace === "media" ? `/uploads/media/${year}/${month}/${filename}` : null;
  const storedPath = namespace === "media"
    ? `${MEDIA_PATH_PREFIX}media/${year}/${month}/${filename}`
    : `${PRIVATE_PATH_PREFIX}vouchers/${year}/${month}/${filename}`;
  return {
    filename,
    originalName: path.basename(file.name).slice(0, 255),
    path: storedPath,
    url: relativeUrl,
    mimeType: detected.mimeType,
    sizeBytes: bytes.byteLength,
  };
}
