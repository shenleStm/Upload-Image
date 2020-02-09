import React,{useState} from 'react';
import UploadImage from "./component/upload-image/upload-image";
import axios from "axios";
import {message} from "antd";

const addImageUrl = 'http://localhost:8080/image/add';

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

const getImageList = async(setList)=>{
    const data = await ajax('http://localhost:8080/image/list');
    setList(data.data);
};

const deleteImage = async ({name}, setList)=>{
    await ajax('http://localhost:8080/image/delete',{name});
    getImageList(setList);
};

const uploadImage = (item) => {
    console.log('uploadImage', item)
};

const downloadImage = (item) => {
    console.log('downloadImage', item)
};

function App() {
    const [list, setList] = useState([]);
    getImageList(setList);
    return (
      <div className="App">
        <UploadImage
            action={addImageUrl}
            list={list}
            onUpload={(item)=>uploadImage(item)}
            onDelete={(item)=>deleteImage(item, setList)}
            onDownload={(item)=>downloadImage(item)}
        />
      </div>
  );
}

export default App;
