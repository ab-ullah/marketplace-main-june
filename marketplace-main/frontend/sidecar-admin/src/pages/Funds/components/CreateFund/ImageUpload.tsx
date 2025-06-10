import { useCallback, useEffect, useState } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import { useDropzone } from "react-dropzone";
import get from "lodash/get";

const MB = 1000000;
const maxLimit = 2 * MB;

const ImageUpload = ({ name, currentImg, onChange,label }: any) => {
  const [file, setFile] = useState<any>({});
  const { getRootProps, getInputProps } = useDropzone({
    maxSize: maxLimit,
    multiple: false,
    accept: "image/*",
    onDrop: useCallback((acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejectedFile = get(rejectedFiles, "[0]", []);
        const error = rejectedFile.errors[0]?.message;
        alert(error);
      } else {
        const selectedImage = get(acceptedFiles, "[0]", []);
        Object.assign(selectedImage, {
          preview: URL.createObjectURL(selectedImage),
        });
        onChange(name, selectedImage);
        setFile(selectedImage);
      }
    }, []),
  });

  useEffect(() => {
    if (currentImg) {
      setFile({ name: `${name}.png`, preview: currentImg });
    }
  }, []);

  return (
    <div>
      <p>{label}</p>
      <section className="container">
        <div
          {...getRootProps({ className: "dropzone" })}
          style={{
            minHeight: "150px",
            background: "white",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Object.keys(file).length > 0 ? (
            <aside>
              <div
                key={file.name}
                style={{
                  width: "fit-content",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  style={{ height: "60px", width: "fit-content" }}
                  src={file.preview}
                  alt="logo"
                />
                <div>
                  <DeleteIcon
                    style={{ fill: "red", cursor: "pointer" }}
                    onClick={() => setFile({})}
                  />

                  <span>{file.name}</span>
                </div>
              </div>
            </aside>
          ) : (
            <>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
              <span
                style={{
                  border: "1px dashed #C1CEE9",
                  boxSizing: "border-box",
                  borderRadius: "40px",
                  fontFamily: "Quicksand",
                  fontStyle: "normal",
                  fontWeight: "bold",
                  fontSize: "16px",
                  lineHeight: "20px",
                  color: "#2E86DE",
                  padding: "8px 18px",
                  display: "inline-block !important",
                  cursor: "pointer",
                }}
              >
                Select
              </span>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ImageUpload;
