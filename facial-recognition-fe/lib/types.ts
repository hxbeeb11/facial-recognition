export type PersonPublic = {
  id: string;
  full_name: string;
  external_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

/** Bounding box in the uploaded source image (pixels). */
export type FacialArea = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type FaceMatchItem = {
  face_index: number;
  matched: boolean;
  cosine_distance?: number | null;
  person?: PersonPublic | null;
  /** Enrolled embedding id; image URL uses GET .../gallery/embeddings/{id}/image */
  matched_embedding_id?: string | null;
  facial_area?: FacialArea | null;
};

export type EnrollResponse = {
  person_id: string;
  embedding_ids: string[];
  source_image_uri: string;
};

export type IdentifyImageResponse = {
  matches: FaceMatchItem[];
};

export type VideoMatchItem = {
  person: PersonPublic;
  best_cosine_distance: number;
  first_seen_frame_index: number;
  first_seen_timestamp_sec: number;
  matched_embedding_id?: string | null;
  face_crop_jpeg_base64?: string | null;
};

export type IdentifyVideoResponse = {
  matches: VideoMatchItem[];
  video_fps?: number | null;
};
