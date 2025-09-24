import { Progress } from "@/components/ui/helpers/progress"
import { Trash2Icon, UploadCloudIcon } from "lucide-react";
//import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Button } from '@/components/button'

import getFileTypeFromUrl from "@/shared/helpers/GetFileTypeFromUrl";
import { addCacheBuster } from "@/shared/helpers/utils";

type Aspect = "auto" | "1:1" | "16:9" | "9:16" | "rounded";

type InputMediaProps = {
  aspect?: Aspect;
  background?: "light" | "dark";
  allowedExtensions?: string;
  multiple?: boolean;
  initialImageSrc?: string;
  maxFileSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxDurationSeconds?: number;
  useCache?: boolean;
  deleteFunction?: (imageSrc: string) => void;
  uploadFunction: (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: () => void
  ) => void;
};

type FileType = "image" | "video";

export function InputMedia({
  aspect = "auto",
  background = "light",
  allowedExtensions = "png,jpg,jpeg",
  multiple = false,
  initialImageSrc,
  maxFileSizeMB,
  maxWidth,
  maxHeight,
  maxDurationSeconds,
  useCache = true,
  deleteFunction,
  uploadFunction,
}: InputMediaProps) {
  //const t = useTranslations();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(initialImageSrc);
  const [fileType, setFileType] = useState<FileType>("image");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [aspectState, setAspectState] = useState<Aspect>(aspect);


  useEffect(() => {
    if (initialImageSrc) {
      setImageSrc(initialImageSrc);
      const type = getFileTypeFromUrl(initialImageSrc);
      if (type) {
        setFileType(type as FileType);
      }
    }
  }, [initialImageSrc]);

  const aspectClasses = {
    "auto": "aspect-auto",
    "1:1": "aspect-square",
    "16:9": "aspect-video",
    "9:16": "aspect-9/16",
    "rounded": "rounded-full",
  };

  const backgroundClasses = {
    light: "bg-white text-blue-gray-500",
    dark: "bg-gray-800 text-white",
  };

  const containerClasses = `relative rounded ${aspectClasses[aspectState]}`;
  const dragActiveClasses = "border-blue-500";
  const dragInactiveClasses = "border-blue-gray-300";
  const baseDragClasses = "border-2 border-dashed cursor-pointer";
  const fontClasses = "font-semibold text-base font-[sans-serif]";
  const buttonClasses = "absolute top-2 right-2 bg-white rounded-full p-1 shadow md:hidden md:group-hover:flex";

  const handleDragEvent = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter") {
      setIsDragging(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement | HTMLDivElement>) => {
    handleDragEvent(e);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileExtension = file.type.split("/")[1];

    if (!allowedExtensions.includes(fileExtension)) {
      alert(`File type not allowed. Please upload one of the following types: ${allowedExtensions}`);
      return;
    }

    if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
      alert(`File size exceeds the maximum limit of ${maxFileSizeMB} MB.`);
      return;
    }

    if (file.type.startsWith("image/")) {
      setFileType("image");
      setAspectState("auto");
      const img = new Image();
      img.onload = () => {
        if ((maxWidth && img.width > maxWidth) || (maxHeight && img.height > maxHeight)) {
          //alert(`${t("sentence.allowed_extensions_warning")} ${maxWidth || "∞"} x ${maxHeight || "∞"} px.`);
          alert(`sentence.allowed_extensions_warning")} ${maxWidth || "∞"} x ${maxHeight || "∞"} px.`);
          return;
        }
        processFile(file);
      };
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
      setAspectState("auto");
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (maxDurationSeconds && video.duration > maxDurationSeconds) {
          //alert(`${t("sentence.max_duration_seconds")} ${maxDurationSeconds} seconds.`);
          alert(`t("sentence.max_duration_seconds")} ${maxDurationSeconds} seconds.`);
          return;
        }
        processFile(file);
      };
      video.src = URL.createObjectURL(file);
    } else {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded / event.total) * 50);
        setUploadProgress(percentCompleted);
      }
    };

    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      handleUpload(file);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imageSrc) {
      deleteFunction?.(imageSrc);
    }
    setImageSrc(undefined);
    setUploadProgress(0);
  };

  const handleUpload = (file: File) => {
    const progress = (currentProgress: number) => {
      const serverProgress = Math.round(currentProgress / 2);
      const totalProgress = 50 + serverProgress;
      setUploadProgress(totalProgress);
    };

    const onComplete = () => {
      setUploadProgress(100); // Finaliza o progresso
    };

    uploadFunction(file, progress, onComplete);
  };

  return (
    <div className="relative">
      {imageSrc ? (
        <div className={`group ${containerClasses}`}>
          {fileType === "video" && (
            <video src={imageSrc} className="object-cover w-full h-full rounded" controls />
          )}
          {fileType === "image" && (
            <img src={useCache ? imageSrc : addCacheBuster(imageSrc)} alt="Preview" className="object-cover w-full h-full rounded" />
          )}
          <Button type="button" onClick={handleRemoveImage} className={buttonClasses}>
            <Trash2Icon size={16} className="text-blue-gray-500" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="upload_file"
          className={`
            flex flex-col items-center justify-center p-4
            ${fontClasses} ${baseDragClasses}
            ${containerClasses} ${backgroundClasses[background]}
            ${isDragging ? dragActiveClasses : dragInactiveClasses}
          `}
          onDragEnter={handleDragEvent}
          onDragLeave={handleDragEvent}
          onDragOver={handleDragEvent}
          onDrop={handleDrop}
        >
          <UploadCloudIcon size={24} className={`${backgroundClasses[background]}`} />
          <div className="mt-2 whitespace-nowrap">
            {"sentence.upload_files"}
          </div>
          <div className="mt-2 text-xs font-medium text-center">
            {"sentence.allowed_file_types"} {allowedExtensions.split(",").join(", ")}
          </div>
          <input
            type="file"
            id="upload_file"
            className="hidden"
            onChange={handleFileChange}
            accept={allowedExtensions.split(",").map(ext => `.${ext}`).join(",")}
            multiple={multiple}
          />
        </label>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div
          className="absolute flex justify-center w-full transition-opacity duration-300 ease-in-out opacity-100 bottom-4"
        >
          <div className="w-[98%] bg-white rounded-full p-1">
            <Progress value={uploadProgress} color="green"/>
          </div>
        </div>
      )}
    </div>
  );
}
