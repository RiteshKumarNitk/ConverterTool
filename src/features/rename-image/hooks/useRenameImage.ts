// src/features/rename-image/hooks/useRenameImage.ts
import JSZip from 'jszip';

export function useRenameImage() {
  const stripPrefixFromImages = (files: File[], prefix: string): File[] => {
    return files.map((file) => {
      const originalName = file.name;
      const ext = originalName.split('.').pop() || 'png';
      let nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

      // Remove the prefix if present
      if (nameWithoutExt.startsWith(prefix)) {
        nameWithoutExt = nameWithoutExt.replace(prefix, '');
      }

      const newName = `${nameWithoutExt}.${ext}`;
      return new File([file], newName, { type: file.type });
    });
  };

  const downloadAllAsZip = async (files: File[]) => {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.name, file));
    const blob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'renamed_images.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return { stripPrefixFromImages, downloadAllAsZip };
}

// // src/features/rename-image/hooks/useRenameImage.ts
// import JSZip from 'jszip';

// export function useRenameImage() {
//   const renameImages = (files: File[], baseName: string): File[] => {
//     return files.map((file, index) => {
//       const ext = file.name.split('.').pop() || 'png';
//       const newName = `${baseName}${index + 1}.${ext}`;
//       return new File([file], newName, { type: file.type });
//     });
//   };

//   const downloadAllAsZip = async (files: File[]) => {
//     const zip = new JSZip();
//     files.forEach((file) => zip.file(file.name, file));
//     const blob = await zip.generateAsync({ type: 'blob' });

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'renamed_images.zip';
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return { renameImages, downloadAllAsZip };
// }
