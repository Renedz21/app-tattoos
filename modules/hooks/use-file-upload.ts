import {
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export type FileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type FileWithPreview = {
  file: File | FileMetadata;
  id: string;
  preview?: string;
};

export type FileUploadOptions = {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
  onFilesAdded?: (added: FileWithPreview[]) => void;
};

export type FileUploadState = {
  files: FileWithPreview[];
  isDragging: boolean;
  errors: string[];
};

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  clearErrors: () => void;
  openFileDialog: () => void;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>,
  ) => InputHTMLAttributes<HTMLInputElement> & { ref: any }; // biome-ignore lint/suspicious/noExplicitAny: ref compat
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(Math.max(0, decimals))} ${sizes[i]}`;
};

const fileKey = (file: File | FileMetadata) => `${file.name}:${file.size}`;

const toEntry = (file: File | FileMetadata): FileWithPreview => ({
  file,
  id:
    file instanceof File
      ? `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      : file.id,
  preview: file instanceof File ? URL.createObjectURL(file) : file.url,
});

const revokeEntry = ({ file, preview }: FileWithPreview) => {
  if (file instanceof File && file.type.startsWith("image/") && preview) {
    URL.revokeObjectURL(preview);
  }
};

export const useFileUpload = (
  options: FileUploadOptions = {},
): [FileUploadState, FileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = "*",
    multiple = false,
    initialFiles = [],
  } = options;

  const onFilesChangeRef = useRef(options.onFilesChange);
  onFilesChangeRef.current = options.onFilesChange;
  const onFilesAddedRef = useRef(options.onFilesAdded);
  onFilesAddedRef.current = options.onFilesAdded;

  const inputRef = useRef<HTMLInputElement>(null);
  const keySet = useRef<Set<string>>(new Set(initialFiles.map(fileKey)));

  const [state, setState] = useState<FileUploadState>({
    errors: [],
    isDragging: false,
    files: initialFiles.map((f) => ({ file: f, id: f.id, preview: f.url })),
  });

  const acceptedTypes = useMemo(
    () => (accept === "*" ? null : accept.split(",").map((t) => t.trim())),
    [accept],
  );

  const validate = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file.size > maxSize)
        return `"${file.name}" exceeds max size of ${formatBytes(maxSize)}.`;

      if (!acceptedTypes) return null;

      const type = file instanceof File ? (file.type ?? "") : file.type;
      const ext = `.${file.name.split(".").pop() ?? ""}`.toLowerCase();

      const accepted = acceptedTypes.some((t) => {
        if (t.startsWith(".")) return ext === t.toLowerCase();
        if (t.endsWith("/*")) return type.startsWith(`${t.split("/")[0]}/`);
        return type === t;
      });

      return accepted ? null : `"${file.name}" is not an accepted file type.`;
    },
    [acceptedTypes, maxSize],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const incoming = Array.from(newFiles ?? []);
      if (!incoming.length) return;
      if (!multiple) {
        state.files.forEach(revokeEntry);
        keySet.current.clear();
      }

      const errors: string[] = [];
      const valid: FileWithPreview[] = [];

      for (const file of incoming) {
        if (multiple && keySet.current.has(fileKey(file))) continue;

        const error = validate(file);
        if (error) {
          errors.push(error);
          continue;
        }
        valid.push(toEntry(file));
      }
      if (
        multiple &&
        maxFiles !== Infinity &&
        state.files.length + valid.length > maxFiles
      ) {
        valid.forEach(revokeEntry);
        setState((prev) => ({
          ...prev,
          errors: [`Max ${maxFiles} files allowed.`],
        }));
        return;
      }

      for (const { file } of valid) keySet.current.add(fileKey(file));
      if (inputRef.current) inputRef.current.value = "";

      if (!valid.length) {
        if (errors.length) setState((prev) => ({ ...prev, errors }));
        return;
      }

      const nextFiles = multiple ? [...state.files, ...valid] : valid;
      setState((prev) => ({ ...prev, errors, files: nextFiles }));
      onFilesAddedRef.current?.(valid);
      onFilesChangeRef.current?.(nextFiles);
    },
    [state.files, multiple, maxFiles, validate],
  );

  const removeFile = useCallback(
    (id: string) => {
      const target = state.files.find((f) => f.id === id);
      if (target) {
        revokeEntry(target);
        keySet.current.delete(fileKey(target.file));
      }
      const nextFiles = state.files.filter((f) => f.id !== id);
      setState((prev) => ({ ...prev, errors: [], files: nextFiles }));
      onFilesChangeRef.current?.(nextFiles);
    },
    [state.files],
  );

  const clearFiles = useCallback(() => {
    state.files.forEach(revokeEntry);
    keySet.current.clear();
    if (inputRef.current) inputRef.current.value = "";
    setState((prev) => ({ ...prev, errors: [], files: [] }));
    onFilesChangeRef.current?.([]);
  }, [state.files]);

  const clearErrors = useCallback(
    () => setState((prev) => ({ ...prev, errors: [] })),
    [],
  );

  const openFileDialog = useCallback(() => inputRef.current?.click(), []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setState((prev) => ({ ...prev, isDragging: false }));
      if (inputRef.current?.disabled || !e.dataTransfer.files.length) return;
      addFiles(multiple ? e.dataTransfer.files : [e.dataTransfer.files[0]]);
    },
    [addFiles, multiple],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) addFiles(e.target.files);
    },
    [addFiles],
  );

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
      ...props,
      type: "file" as const,
      accept: props.accept ?? accept,
      multiple: props.multiple ?? multiple,
      onChange: handleFileChange,
      ref: inputRef as any, // biome-ignore lint/suspicious/noExplicitAny: ref compat
    }),
    [accept, multiple, handleFileChange],
  );

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      openFileDialog,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      getInputProps,
    },
  ];
};
