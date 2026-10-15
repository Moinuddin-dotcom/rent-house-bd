'use client';

import { ImagePlus, Loader2, Trash2, Video } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/listings/status-badge';
import { LazyImage } from '@/components/listings/lazy-image';
import { YoutubeEmbed } from '@/components/listings/youtube-embed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { ListingImage, ListingVideo } from '@/types';

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 500;

/** Photos go to S3; videos picked from the phone gallery are pushed to YouTube by the backend. */
export function ListingMediaManager({
  listingId,
  images,
  videos,
  onChange,
}: {
  listingId: string;
  images: ListingImage[];
  videos: ListingVideo[];
  onChange: () => void;
}) {
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<'images' | 'video' | null>(null);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const tooBig = Array.from(files).find((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig) return toast.error(`${tooBig.name} is larger than ${MAX_IMAGE_MB} MB`);

    const data = new FormData();
    Array.from(files).forEach((f) => data.append('images', f));
    setUploading('images');
    try {
      await api(`/listings/${listingId}/images`, { method: 'POST', body: data });
      toast.success('Photos uploaded');
      onChange();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(null);
      if (imageInput.current) imageInput.current.value = '';
    }
  };

  const uploadVideo = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return toast.error(`Video must be under ${MAX_VIDEO_MB} MB`);

    const data = new FormData();
    data.append('video', file);
    setUploading('video');
    try {
      await api(`/listings/${listingId}/videos`, { method: 'POST', body: data });
      toast.success('Video received — it will appear once YouTube finishes processing.');
      onChange();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(null);
      if (videoInput.current) videoInput.current.value = '';
    }
  };

  const remove = async (path: string) => {
    try {
      await api(path, { method: 'DELETE' });
      onChange();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>The first photo is used as the cover. JPG, PNG or WEBP, up to {MAX_IMAGE_MB} MB each.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative">
                <LazyImage src={img.url} alt="" className="aspect-square w-full rounded-lg" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-7 w-7 opacity-90"
                  onClick={() => remove(`/listings/${listingId}/images/${img.id}`)}
                  aria-label="Delete photo"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <input
            ref={imageInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(e) => uploadImages(e.target.files)}
          />
          <Button variant="outline" onClick={() => imageInput.current?.click()} disabled={uploading !== null}>
            {uploading === 'images' ? <Loader2 className="animate-spin" /> : <ImagePlus />} Add photos
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Videos</CardTitle>
          <CardDescription>
            Pick a video from your phone gallery. We upload it to YouTube (unlisted) and embed it on your listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {videos.map((v) => (
            <div key={v.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={v.status} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(`/listings/${listingId}/videos/${v.id}`)}
                  aria-label="Delete video"
                >
                  <Trash2 /> Remove
                </Button>
              </div>
              {v.status === 'READY' && v.youtubeId && <YoutubeEmbed videoId={v.youtubeId} title="Listing video" />}
              {v.status === 'FAILED' && <p className="text-sm text-destructive">{v.errorMessage ?? 'Upload failed'}</p>}
              {v.status === 'PROCESSING' && (
                <p className="text-sm text-muted-foreground">Uploading to YouTube… refresh in a minute.</p>
              )}
            </div>
          ))}
          <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => uploadVideo(e.target.files?.[0])} />
          <Button variant="outline" onClick={() => videoInput.current?.click()} disabled={uploading !== null}>
            {uploading === 'video' ? <Loader2 className="animate-spin" /> : <Video />} Upload video
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
