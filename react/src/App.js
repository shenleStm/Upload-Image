import React,{useState, useEffect} from 'react';
import UploadImage from "./component/upload-image/upload-image";
import axios from "axios";
import {message} from "antd";

const baseUrl = 'http://localhost:8080/image';

const getImageListUrl = `${baseUrl}/list`;
const addImageUrl = `${baseUrl}/add`;
const deleteImageUrl = `${baseUrl}/delete`;

const ajax = (url, data={}, type='GET') =>{
    return new Promise((resolve)=>{
        const promise = type === 'GET' ? axios.get(url, {params: data}) : axios.post(url, data)
        promise.then(res=>{
            const data = res.data;
            data.status !== 0 ? message.error(data.msg) : resolve(data);
        }).catch(err => {
            message.error('Network request Error: '+err);
        })
    })
};

const getAndUpdateImageList = async(setList) => {
    const data = await ajax(getImageListUrl);
    setList(data.data);
};

const deleteImage = async ({name}, setList)=>{
    await ajax(deleteImageUrl,{name});
    getAndUpdateImageList(setList);
};

const uploadImage = (item, setList) => {
    getAndUpdateImageList(setList);
};

const downloadImage = (item) => {
    console.log('downloadImage', item)
};

function App() {
    const [list, setList] = useState([]);

    useEffect(() => {
        getAndUpdateImageList(setList);
    },[]);

    return (
      <div className="App">
        <UploadImage
            action={addImageUrl}
            list={list}
            onUpload={(item)=>uploadImage(item, setList)}
            onDelete={(item)=>deleteImage(item, setList)}
            onDownload={(item)=>downloadImage(item)}
        />
      </div>
  );
}

export default App;
