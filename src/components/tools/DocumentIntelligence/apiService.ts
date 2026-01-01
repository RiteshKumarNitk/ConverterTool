export const API_BASE_URL = "http://localhost:8000";

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Upload failed");
    }

    return response.json();
};

export const processDocument = async (fileId: string) => {
    const response = await fetch(`${API_BASE_URL}/process/${fileId}`, {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error("Processing failed");
    }

    return response.json();
};

export const getDownloadUrl = (fileId: string, format: "json" | "xlsx" | "docx") => {
    return `${API_BASE_URL}/download/${fileId}/${format}`;
};
