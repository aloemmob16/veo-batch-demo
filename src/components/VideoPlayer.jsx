export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl) return null;

  return (
    <div className="mt-6">
      <video
        src={videoUrl}
        controls
        autoPlay
        loop
        className="rounded shadow max-w-md"
      />
    </div>
  );
}
