'use client';

interface PdfPlayerProps {
  url: string;
}

export function PdfPlayer({ url }: PdfPlayerProps) {
  return (
    <div className="w-full aspect-[4/3]">
      <iframe
        src={url}
        title="PDF Viewer"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
}
