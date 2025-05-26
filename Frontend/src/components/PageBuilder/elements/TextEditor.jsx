import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const EditorWrapper = styled.div`
  position: relative;
  
  .tox-tinymce {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .tox-editor-container {
    background: #fff;
  }

  .tox-toolbar {
    background: #f8f9fa !important;
    border-bottom: 1px solid #e0e0e0;
    padding: 4px !important;
  }

  .tox-toolbar__group {
    padding: 4px !important;
    border-right: 1px solid #e0e0e0;
  }

  .tox-tbtn {
    border-radius: 4px !important;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e3f2fd !important;
    }
  }
`;

const UploadProgress = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  z-index: 1000;
  min-width: 300px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  margin: 16px 0;
  overflow: hidden;

  div {
    height: 100%;
    background: linear-gradient(90deg, #2196f3, #64b5f6);
    transition: width 0.3s ease;
    border-radius: 4px;
  }
`;

const UploadStatus = styled.div`
  margin-top: 8px;
  color: #666;
  font-size: 14px;
`;

const TextEditor = ({ content: initialContent = '', onChange, fontSize = '16px' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const editorRef = useRef(null);

  const handleMediaUpload = async (blobInfo, success, failure, progress) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', blobInfo.blob());

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs/upload`,
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
              progress(progress);
            }
          },
        }
      );

      success(response.data.url);
    } catch (error) {
      console.error('Error uploading media:', error);
      failure('Media upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <EditorWrapper style={{ fontSize }}>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        initialValue={initialContent}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        init={{
          height: 600,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
            'fullscreen', 'insertdatetime', 'media', 'table', 'help',
            'wordcount', 'emoticons'
          ],
          toolbar1: 'blocks | bold italic underline | alignleft aligncenter alignright alignjustify',
          toolbar2: 'bullist numlist | outdent indent | link image media | forecolor backcolor | code fullscreen',
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              font-size: ${fontSize};
              line-height: 1.6;
              margin: 20px;
            }
            h1 { font-size: 2.5em; margin: 0.67em 0; }
            h2 { font-size: 2em; margin: 0.83em 0; }
            h3 { font-size: 1.5em; margin: 1em 0; }
            h4 { font-size: 1.25em; margin: 1.33em 0; }
            h5 { font-size: 1.1em; margin: 1.67em 0; }
            h6 { font-size: 1em; margin: 2.33em 0; }
            p { margin: 1em 0; }
          `,
          setup: (editor) => {
            editor.on('Change', () => {
              const content = editor.getContent();
              onChange(content);
            });
          },
          block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6',
          images_upload_handler: handleMediaUpload,
          file_picker_types: 'file image media',
          automatic_uploads: true,
          images_reuse_filename: true,
          paste_data_images: true,
          media_live_embeds: true,
          media_alt_source: false,
          media_poster: false,
          browser_spellcheck: true,
          contextmenu: false,
          resize: false,
          statusbar: false,
          formats: {
            h1: { block: 'h1' },
            h2: { block: 'h2' },
            h3: { block: 'h3' },
            h4: { block: 'h4' },
            h5: { block: 'h5' },
            h6: { block: 'h6' },
            p: { block: 'p' },
            blockquote: { block: 'blockquote' },
            pre: { block: 'pre' }
          }
        }}
      />
      {isUploading && (
        <UploadProgress>
          <div>Uploading media...</div>
          <ProgressBar>
            <div style={{ width: `${uploadProgress}%` }} />
          </ProgressBar>
          <UploadStatus>{uploadProgress}% Complete</UploadStatus>
        </UploadProgress>
      )}
    </EditorWrapper>
  );
};

export default TextEditor; 