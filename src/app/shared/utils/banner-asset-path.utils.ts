export function getBannerAssetPath(fileName: string): string {
  const cleanName = fileName.trim().replace(/^\/+/, '');
  return `/banners/${cleanName}`;
}
