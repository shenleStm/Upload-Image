# 实现效果图

![](https://user-gold-cdn.xitu.io/2020/2/8/1702552b6da55c2e?w=640&h=282&f=jpeg&s=22963)


![](https://user-gold-cdn.xitu.io/2020/2/8/1702552ebf6465db?w=634&h=304&f=jpeg&s=21412)


![](https://user-gold-cdn.xitu.io/2020/2/8/170255313e1efcea?w=844&h=284&f=jpeg&s=27618)


![](https://user-gold-cdn.xitu.io/2020/2/8/170255335afc4bcb?w=898&h=276&f=jpeg&s=30356)


![](https://user-gold-cdn.xitu.io/2020/2/8/1702554690823648?w=1870&h=1884&f=jpeg&s=263146)

# 功能预览
1. 【less】上传文件的input框样式的改造
2. 获取图片列表
3. 点击上传图片 + 转换成base64
4. 上传中loading
5. 上传失败
6. 删除图片
7. 查看大图
8. 下载图片
9. useState 与 useEffect的使用
10. 跨域
11. 静态文件的查看
12. 查询/删除/添加文件
13. uuid
14. 用同步的方式书写异步的操作（封装 async await promise集合体）
15. axios

# 【前端】React

#### 1.【less】上传文件的input框样式的改造
```
<div className="upload-container item">
    <Icon type="plus" className="icon"/>
    <div className="name">Upload</div>
    <input id="upload-image" 
           type="file" 
           name="image" 
           accept="image/*"
           onChange={()=>handleUploadImage(props)}/>                    
</div>
```
主要用到的是原生的input框：  
`type="file"`弹出选择上传文件的框；  
`accept="image/*"`来限制你选择上传的文件只能是图片类型的；  
当你弹出选择文件的框之后，无论是选择还是取消都会触发`onChange`事件。  

原生input上传文件的样式很丑，于是换样式成了重中之重！
> 思路：  
1.把input框给隐藏掉  
2.并且要设置一个与最终样式同样大小的宽高，通过子绝父相让input框覆盖在最上层，这样才能够命中点击事件   

```
.upload-container{
    margin: 5px;
    padding: 3px;
    float: left;
    border-style: dashed;
    background-color: #f5f5f5;
    position: relative; //父相
    flex-direction: column;

    .icon{
      color: #e1e1e1;
      margin-top: 10px;
      font-size: 40px;
      font-weight: bolder;
    }
    .name{
      color: #a3a3a3;
    }
    input{
      width: 100%;
      height: 100%; // 与父样式等宽高
      cursor: pointer;
      position: absolute; // 子绝
      top: 0;
      opacity: 0; // 全透明
    }
  }
```

#### 2. 用同步的方式书写异步的操作（封装 async await promise集合体）+ 获取图片列表 + useState
```
const baseUrl = 'http://localhost:8080/image';

const getImageListUrl = `${baseUrl}/list`;

const [list, setList] = useState([]);

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
```

#### 3. 点击上传图片 + 转换成base
出现上传文件的框，无论是选择还是取消，都会触发`onChange`事件，所以要判断你选择的`targetFile`是否存在。 

通过FileReder将图片转成base64，用同步的方式将最终结果抛出去:
```
const getBase64 = (file) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    return new Promise((resolve)=>{
        fileReader.onload = (data) => {
            resolve(data.target.result)
        }
    })
};
```
获取到了base64之后再发送axios请求到后端：
```
const handleUploadImage= async ({list,action,uploadImage,setUploadLoading, setUploadErrorFileName})=>{
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
```
#### 4. 上传中loading
当我们开始上传图片的时候，会将`uploadLoading`设置成true，上传成功之后会将`uploadLoading`再设置成false！  
```
const handleUploadImage= async ({list,action,uploadImage,setUploadLoading, setUploadErrorFileName})=>{
    const input = document.getElementById('upload-image');
    const targetFile = input.files[0];
    if (targetFile){
        setUploadLoading(true);
        ...
        setUploadLoading(false);
    }
};
```

```
const [uploadLoading, setUploadLoading] = useState(false);

{uploadLoading && renderUploading()}

const renderUploading =()=> (
    <div className="uploading item">
        <Icon className="icon" type='loading' />
        <span>Uploading...</span>
    </div>
);
```

#### 5. 上传失败
与loading其实同理, 其次，上传失败之后设置`uploadErrorFileName`来渲染失败的样式。
```
await axios.post(action, {imageBase64, name})
            .then(()=>{
                ...
            }).catch(() => {
                setUploadErrorFileName(name);
            });
```
  
  
```
const [uploadErrorFileName, setUploadErrorFileName] = useState(null);

{uploadErrorFileName && renderUploadError(uploadErrorFileName,setUploadErrorFileName)}

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
```

#### 6. 删除图片
```
const deleteImage = async ({name}, setList)=>{
    await ajax(deleteImageUrl,{name});
    getAndUpdateImageList(setList);
};
```

#### 7. 查看大图
用到了Antd的上传图片一样，用到的Modal框去显示大图， 用`previewSrc`保存选择的结果
````
const [previewSrc, setPreviewSrc] = useState(null);

 <Modal
    width={800} 
    className="preview-modal"
    visible={previewSrc !== null}
    title={null}
    footer={null}
    onCancel={()=>setPreviewSrc(null)} >
         <img src={previewSrc} alt=""/>
</Modal>
````

#### 8. 下载图片 + blob
> 思路：  
> 1.用a标签的download属性来实现下载效果，因为下载按钮是Icon，所以点击download Icon之后触发a标签的download  

> 2.使用Blob

```
<Icon type="download" className="icon" onClick={()=>downloadImage(item, onDownload)}/>
<a id="download-image"  download={item.name}/>
```

```
const downloadImage=(item, onDownload)=>{
    const target = document.getElementById('download-image');
    const blob = new Blob([item.src]);
    target.href = URL.createObjectURL(blob);
    target.click();
    onDownload(item);
};
```

# 【后端】Nest

#### 1.跨域
```
app.enableCors();
```

#### 2.静态文件暴露
```
const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'data/images'), {
    prefix: '/images/',
  });
```

#### 3.写文件
> 1. 解析base64,生成buffer
> 2. fs.writeFile(buffer)

```
@Post('/image/add')
  getImage(@Req() req, @Res() res): void {
    const {imageBase64, name} = req.body;
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const dataBuffer = new Buffer(base64Data, 'base64');
    fs.writeFile(`data/images/${name}`, dataBuffer, (err) => {
      if (err) {
        res.send(err);
      } else {
        res.send({status: 0 });
      }
    });
  }
```

#### 4.读文件
> fs.readdirSync(文件名)

```
@Get('/image/list')
  getProductList(@Res() res): void {
    const data = fs.readdirSync('data/images');
    const url = 'http://localhost:8080/images/';
    res.send({
      data: data.map(item => ({
        name: item,
        id: uuid(),
        src: url + item,
      })),
      status: 0,
    });
  }
```

#### 5.删文件
> fs.unlinkSync(文件名)

```
  @Get('/image/delete')
  deleteImage(@Query() query, @Res() res): void {
    const files = fs.readdirSync('data/images');
    const target = files.filter(item => item === query.name);
    if (target) {
      fs.unlinkSync('data/images/' + target);
      res.send({status: 0 });
    }
    res.send({status: 1 });
  }
```

# 案例

#### 用useEffect代替了didMount请求图片列表
```
const [list, setList] = useState([]);

useEffect(() => { 
    getAndUpdateImageList(setList);
},[]);


```

```
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
```

# 源码
https://github.com/shenleStm/Upload-Image

