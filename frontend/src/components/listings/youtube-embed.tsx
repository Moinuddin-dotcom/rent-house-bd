export function YoutubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}
