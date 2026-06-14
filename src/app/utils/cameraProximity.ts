// 河川ライブカメラの近接情報（静的同梱・アプリからは再取得しない）。
// 出典: 国土交通省 川の防災情報（位置情報を加工して作成）。
// データ生成日・しきい値は src/app/data/riverCameras.json を参照。
import data from '../data/riverCameras.json';

export interface RiverCameraInfo {
  cameraName: string;
  distanceKm: number;
  mapUrl: string;
}

const rivers = (data as any).rivers as Record<string, RiverCameraInfo>;

/** 川ID（river.id）に対し、1km以内に河川ライブカメラがあれば情報を返す。無ければ undefined。 */
export function getRiverCamera(id: string): RiverCameraInfo | undefined {
  return rivers[id];
}

export const CAMERA_SOURCE: string = (data as any).source;
export const CAMERA_SOURCE_URL: string = (data as any).sourceUrl;
export const CAMERA_NOTE: string = (data as any).note;
