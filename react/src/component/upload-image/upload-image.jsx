import React, {Fragment, useState} from 'react';
import {Icon, Modal} from "antd";
import axios from 'axios';
import './upload-image.less';

const UploadImage = ({action='', list='', onPreview=()=>{}, onDelete=()=>{}, onDownload=()=>{}, onUpload=()=>{}}) => {
    const [previewSrc, setPreviewSrc] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadErrorFileName, setUploadErrorFileName] = useState(null);

    return (
        <Fragment>
            <div className="upload-image">
                <div className="image-list">
                    {
                        list.map((item) =>(<div key={item.id} className="image-item">
                            <img className="item" src={item.src} alt=""/>
                            <div className="config item">
                                <Icon type="eye" className="icon" onClick={()=>previewImage(item, setPreviewSrc, onPreview)}/>
                                <Icon type="delete" className="icon" onClick={()=>onDelete(item)}/>
                                <Icon type="download" className="icon" onClick={()=>downloadImage(item, onDownload)}/>
                                <a id="download-image"  download={item.name}/>
                            </div>
                        </div>))
                    }
                    {uploadLoading && renderUploading()}
                    {uploadErrorFileName && renderUploadError(uploadErrorFileName, setUploadErrorFileName)}
                    <div className="upload-container item">
                        <Icon type="plus" className="icon"/>
                        <div className="name">Upload</div>
                        <input id="upload-image"
                               type="file"
                               name="image"
                               accept="image/*"
                               onChange={()=>handleUploadImage(list,action,onUpload,setUploadLoading, setUploadErrorFileName)}/>
                    </div>
                </div>
            </div>
            <Modal
                width={800}
                className="preview-modal"
                visible={previewSrc !== null}
                title={null}
                footer={null}
                onCancel={()=>setPreviewSrc(null)}
            >
                <img src={previewSrc} alt=""/>
            </Modal>
        </Fragment>
    )
};

const renderUploading =()=> (
    <div className="uploading item">
        <Icon className="icon" type='loading' />
        <span>Uploading...</span>
    </div>
);

const renderUploadError =(uploadErrorFileName, setUploadErrorFileName)=> (
    <div className="uploading item error">
        <Icon className="icon" type='close-circle' />
        <div className="error-message">Error!</div>
        <div className="name">{uploadErrorFileName}</div>
        <div className="config item">
            <Icon className="delete-icon" type="delete" onClick={()=> setUploadErrorFileName(null)}/>
        </div>
    </div>
);

const downloadImage=(item, onDownload)=>{
    const target = document.getElementById('download-image');
    const blob = new Blob([item.src]);
    target.href = URL.createObjectURL(blob);
    target.click();
    onDownload(item);
};

const previewImage=(item, setPreviewSrc, onPreview)=>{
    setPreviewSrc(item.src);
    onPreview(item);
};

const handleUploadImage= async (list,action,uploadImage,setUploadLoading, setUploadErrorFileName)=>{
    const input = document.getElementById('upload-image');
    const targetFile = input.files[0];
    if (targetFile){
        setUploadLoading(true);
        const { name } = targetFile;
        const imageBase64 = await getBase64(targetFile);
        await axios.post(action, {imageBase64, name})
            .then(()=>{
                uploadImage(action + "/" + name);
            }).catch(() => {
                setUploadErrorFileName(name);
            });
        setUploadLoading(false);
    }
};

const getBase64 = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    return new Promise((resolve)=>{
        fileReader.onload = (data) => {
            resolve(data.target.result)
        }
    })

};


export default UploadImage;
