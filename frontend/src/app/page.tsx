"use client"; // Add this directive for client-side hooks

import type React from "react"; // Add React import
import { useState, useEffect } from "react";
import CommentSection from "@/components/CommentSection"; // Import the component

// Define an interface for the file structure
interface File {
  id: string;
  name: string;
  uploadDate: string;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]); // Use the File interface
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null); // State for selected file ID
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorFiles, setErrorFiles] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState("");
  const [pdfUrl, setPdfUrl] = useState("http://localhost:3001/api/files/1/view");
  const [isDoxc, setIsDocx] = useState(false);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    setIsLoadingFiles(true);
    setErrorFiles(null);
    fetch("http://localhost:3001/api/files") // Adjust URL if needed
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch files");
        }
        return res.json();
      })
      .then((data: File[]) => {
        setFiles(data);
      })
      .catch((err) => {
        console.error("Error fetching files:", err);
        setErrorFiles(err.message || "Could not load files.");
      })
      .finally(() => {
        setIsLoadingFiles(false);
      });
  }, []);

  const handleFileSelect = (fileId: string, file:any) => { 
    setIsDocx(false); 
    setIsPdf(false); 
 
    // DOCX
    if(file.filename.includes('docx')) {
        setIsDocx(true); 
        fetch(`http://localhost:3001/api/files/${file.id}`)
          .then((res) => res.json())
          .then((res) => {
            console.log(res ); 
            setDocxHtml(res.data);
          }) 
    } 
    // PDF
    else if(file.filename.includes('pdf')) {    
        setIsPdf(true);   
        setPdfUrl(`http://localhost:3001/api/files/${file.id}/view`)
    } else {
      //@todo - apply error message
    } 
    setSelectedFileId(fileId);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    fileId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); // Prevent default space bar scroll
      handleFileSelect(fileId, null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-8 md:p-16 lg:p-24 bg-gray-50 text-gray-900">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">File Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* File List Section */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Files</h2>
            {isLoadingFiles && <p>Loading files...</p>}
            {errorFiles && <p className="text-red-500">Error: {errorFiles}</p>}
            {!isLoadingFiles && !errorFiles && (
              <ul className="space-y-2 list-none p-0 m-0">
                {files.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => handleFileSelect(file.id, file)}
                      onKeyDown={(e) => handleKeyDown(e, file.id)}
                      aria-pressed={selectedFileId === file.id}
                      className={`w-full text-left p-3 rounded border cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selectedFileId === file.id
                          ? "bg-blue-100 font-semibold border-blue-300"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {file.uploadDate}
                      </p>
                    </button>
                  </li>
                ))}
                {files.length === 0 && !isLoadingFiles && (
                  <li className="text-gray-500 italic">No files found.</li>
                )}
              </ul>
            )}
          </div>
          {/* Comment Section */}
          <div className="md:col-span-2">
          
            {isDoxc &&  
                <div
                  dangerouslySetInnerHTML={{__html:docxHtml}}
                > 
                </div>
            }
            {isPdf &&
                  <iframe 
                    title="pdf preview"
                    src={pdfUrl} 
                    width={"100%"}
                    height={"1040px"} >
                  </iframe>
            }

            <CommentSection fileId={selectedFileId} />
          </div>
        </div>
      </div>
    </main>
  );
}
